const elasticsearch = require('elasticsearch');
const searchHelper = require('../utils/search-helpers')();

module.exports = function () {

  let service = {
    basicSearch: basicSearch,
    smartSearch: smartSearch,
    findById: findById,
    getCount: getCount
  };

  const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
  })

  let index = 'elastic-showcase';
  let type = 'page';
  let min_score = 0.75;
  let logicalOperator = 'or';
  let tie_breaker = 0.3;

  return service;

  ///////////////////////////////////////////


  function findById(req, res, next) {
    client.get({
      index: index,
      type: type,
      id: req.params.id
    }, (error, response) => {
      res.send(response);
    });
  }

  function getCount(req, res, next) {
    client.count({
      index: index
    }, (error, response) => {
      res.send(response);
    });
  }

  function smartSearch(req, res, next) {
    let size = 10;
    let page = req.params.page;
    let startFrom;
    let sortArray = [];
    let filterArray = [];
    let suggestions = null;
    let preProcessedTerms2 = searchHelper.preProcessSearch2(req.params.query);
    let fieldsToSearch = ["title", "title.en", "text", "text.en"];
    // let fieldsToSearch = ["title", "title.en"];

    if (req.params.sort === 'title') {
      let sortParam = req.params.sort; //what is this for?
      sortArray.push({ 'title.keyword': { 'order': 'asc' } });
    }
    // if (req.params.filter !== 'all') {
    if (req.params.filter !== 'all') {
      let filterParam = req.params.filter;
      console.log('filter Param', filterParam)
      filterArray.push({ "term": { "category": filterParam } });
    }
    // console.log('param page', page);
    if (page === '1') {
      startFrom = 0;
    } else {
      startFrom = (page - 1) * size;
    }

    client.search({
      index: index,
      body: {
        "suggest": {
          "text": req.params.query,
          "didYouMean": {
            "phrase": {
              "analyzer": "standard",
              "field": "title",
              "size": 1,
              "real_word_error_likelihood": 0.95,
              "max_errors": 3,
              //"gram_size" : 2,
              "direct_generator": [{
                "field": "title",
                "suggest_mode": "always",
                "min_word_length": 1
              }],
              "highlight": {
                "pre_tag": "<em>",
                "post_tag": "</em>"
              }
            }

          }
        },
        // "min_score": min_score,
        "query": {
          "bool": {
            "must": [
              { //best_fields - orig string
                "multi_match": {
                  "query": preProcessedTerms2,
                  "type": "best_fields",
                  "fields": fieldsToSearch,
                  "minimum_should_match": "3<75%",
                  // fuzziness: 'auto',
                  //prefix_length: 1,
                  //"operator" : "or",
                  "boost": 2
                }
              },
              {
                "multi_match": {
                  "fields": fieldsToSearch,
                  // "type": "best_fields",
                  "query": req.params.query,
                  //"slop":4,
                  //"boost":3
                  //"operator":"and",
                  //"minimum_should_match": "2<67%",
                }
              }
            ],
            "filter": filterArray
          },
        },
        "aggs": {
          "categories": {
            "terms": {
              "field": "category"
            }
          }
        },
        "sort": sortArray,
        size: size,
        from: startFrom,
        explain: true     //set to 'true' for testing only
      }
    })
      .then((results) => {
        //console.log('my result %',results.hits);
        if (results.suggest.didYouMean) {
          suggestions = results.suggest.didYouMean;
        }
        var hits = results.hits.hits;
        var aggregations = results.aggregations;
        var total = results.hits.total;
        if (total > 250) {
          total = 250;
        }
        var resultPackage = {
          "total": total,
          "hits": hits,
          "suggestions": suggestions,
          "aggregations": aggregations
        }
        res.send(resultPackage);
      }, (err) => {
        console.trace(err.message);
      });


  }

  function basicSearch(req, res, next) {
    var searchTerm = req.params.query;
    // let filterArray = [{ "term": { "redirect": false } }, { "term": { "special": false } }, { "term": { "disambiguation": false } }];
    searchTerm = searchTerm.toLowerCase();

    client.search({
      index: index,
      body: {
        "size": 20,
        "min_score": .2,
        "query": {
          "bool": {
            "should": [
              {
                "match": {
                  "title": {
                    query: searchTerm,
                    boost: 2
                  }
                }
              },
              {
                "match": {
                  "title": {
                    query: searchTerm,
                    fuzziness: "auto",
                  }
                }
              }
            ]
            // "filter": filterArray
          }
        }
      }
    })
      .then((results) => {
        let hits = results.hits.hits;
        res.send(hits);
      }, (err) => {
        console.trace(err.message);
      });
  }


};


