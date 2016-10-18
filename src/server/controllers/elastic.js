var elasticsearch = require('elasticsearch');
var nlp = require('nlp_compromise');
var primaryStopWords = require('stopwords').english;

module.exports = function () {
  
  var service = {
    getPrepareResposeById: getPrepareResposeById,
    fuzzySearch3: fuzzySearch3,
    termSearch: termSearch,
    getQuestions: getQuestions,
    updatePositiveRating: updatePositiveRating,
    updateNegativeRating: updateNegativeRating,
    getFeatured: getFeatured,
    getCommon: getCommon,
    getMostRecent: getMostRecent
  };

  var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error'
  });

  var index = 'prepared_responses_alias';  //using index alias
  var type = 'prepared_responses';
  var logicalOperator = 'or';
  var min_score = 0.5;
  var tie_breaker = 0.3;

  //var primaryStopWords = ['how','do','i','what','can','get','are','where','does','from','cause','my','out','have'];
  // var secondaryStopWords = ['prevent'];
  var multi_match_snippet_fuzzy = {
    "multi_match": {
      "query": null,
      "type": "cross_fields",
      "fields": ["query", "response"],
      "tie_breaker": tie_breaker,
      "minimum_should_match": "100%",
      "operator": logicalOperator,
      "fuzziness": "2",
      "prefix_length": 1
    }
  };

  var multi_match_snippet = {
    "multi_match": {
      "query": null,
      "type": "cross_fields",
      "fields": ["query", "response"],
      "tie_breaker": tie_breaker,
      "minimum_should_match": "100%",
      "operator": logicalOperator

    }
  };

  var match_field_query = {
    "match": {
      "query": { // name of seach field
        query: null,
        fuzziness: 2,
        prefix_length: 1,
        "operator": logicalOperator,
        //  "boost" : 2
      }
    }
  };

  var match_field_response = {
    "match": {
      "response": { // name of seach field
        query: null,
        fuzziness: 2,
        prefix_length: 1,
        "operator": logicalOperator,
        //     "boost" : 4
      }
    }
  };

  return service;

  ///////////////////////////

  function getPrepareResposeById(req, res, next) {
    client.get({
      index: index,
      type: type,
      id: req.params.id
    })
      .then(function (results) {
        var preparedResponse = results;
        // console.log(results);
        // build related pr urls
        results._source.relatedPrList = results._source.relatedPrList || "1582,6258,4658";
        if (results._source.relatedPrList) {
          var prIds = results._source.relatedPrList.split(',');
          // preparedResponse.relatedPRs = getRelatedPRs(prIds);
          client.search({
            index: index,
            type: type,
            body: {
              //"fields": ["prId", "query"],
              "query": {
                "bool": {
                  "filter": {
                    "terms": {
                      "prId": prIds
                    }
                  }
                }
              }
            }
          }).then(function (prs) {
            var relatedPR = [];
            //   console.log('get related pr ', prs.hits.hits);
            prs.hits.hits.forEach(function (pr) {
              var onePr = {
                'prId': pr._source.prId,
                'title': pr._source.title
              }
              relatedPR.push(onePr);
            });
            preparedResponse['relatedPR'] = relatedPR;
            console.log(relatedPR);
            res.send(preparedResponse);
          });
        }
        else {
          res.send(preparedResponse);
        }

      }, function (err) {
        console.trace(err.message);
      });
  }

  function fuzzySearch3(req, res, next) {  //full body
    console.log('params ', req.params);
    var size = 10;
    var page = req.params.page;
    var startFrom;
    var sortArray = [];
    console.log('sort param: ', req.params.sort);
    // var sortBy = {'dateModified'};
    if (req.params.sort === 'recent') {
      var sortParam = req.params.sort;
      sortArray.push({ 'dateModified': { 'order': 'desc' } });
    }

    // sortArray.push({'dateModified':{'order':'desc'}});
    // console.log('param page', page);
    if (page == 1) {
      startFrom = 0;
    } else {
      startFrom = (page - 1) * size + 1;
    }


    var suggestions = null;

    var preProcessTerms = preProcessSearch(req.params.query);
    console.log('nlp ', preProcessTerms);
    var preProcessTerms2 = preProcessSearch2(req.params.query);
    console.log('stopword ', preProcessTerms2);
    multi_match_snippet.multi_match.query = req.params.query;
    multi_match_snippet_fuzzy.multi_match.query = req.params.query;
    match_field_query.match.query.query = req.params.query;
    match_field_response.match.response.query = req.params.query;

    //console.log('inused = ',multi_match_snippet)
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
              "max_errors": 2,
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
        "min_score": min_score,
        "query": {
          "bool": {
            "should": [
              // {
              //   "multi_match":{
              //     "fields": ["title","description","title.en","description.en"],
              //     "type":"phrase",
              //     "query":req.params.query,
              //     "slop":4,
              //     //"boost":3
              //     //"operator":"and",
              //     //"minimum_should_match": "2<67%",
              //   }
              // },
              // {
              //   "multi_match":{
              //     "fields": ["title","title.en","description","description.en"],
              //     "type":"phrase",
              //     "query":preProcessTerms2,
              //     "slop":50,
              //     //"boost":2,
              //     //"fuzziness":2,
              //     //"prefix_length": 1,
              //     //"operator":"and",
              //     //"minimum_should_match": "2<67%",
              //   }
              // },
              { //best_fields - orig string
                "multi_match": {
                  "query": preProcessTerms2,
                  "type": "best_fields",
                  "fields": ["title", "title.en", "description", "description.en"],
                  //"slop":50,
                  //"tie_breaker": tie_breaker,
                  "minimum_should_match": "3<75%",
                  //fuzziness: 1,
                  //prefix_length: 1,
                  //"operator" : "or",
                  //"boost" : 2
                }
              },
              {
                "multi_match": {
                  "fields": ["title", "description", "title.en", "description.en"],
                  //"type":"phrase",
                  "query": req.params.query,
                  //"slop":4,
                  //"boost":3
                  //"operator":"and",
                  //"minimum_should_match": "2<67%", //not used here. Contolled by min_score
                }
              },
            ]
          },
        },
        "sort": sortArray,
        size: size,
        from: startFrom,
        explain: false     //set to 'true' for testing only
      }
    })
      .then(function (results) {
        //console.log('my result %',results.hits);
        if (results.suggest.didYouMean) {
          suggestions = results.suggest.didYouMean;
        }
        var hits = results.hits.hits;
        var resultPackage = {
          "total": results.hits.total,
          "hits": hits,
          "suggestions": suggestions
        }
        res.send(resultPackage);
      }, function (err) {
        console.trace(err.message);
      });
  }

  function termSearch(req, res, next) {
    // console.log(req)
    client.search({
      index: index,
      body: {
        query: {
          term: {
            query: req.params.query
          }
        },
        size: 1000,
        explain: true
      }
    })
      .then(function (results) {
        var hits = results.hits.hits;
        res.send(hits);
      }, function (err) {
        console.trace(err.message);
      });
  }

  function getQuestions(req, res, next) {
    var searchTerm = req.params.query;
    searchTerm = searchTerm.toLowerCase();

    // var preProcessTerms = preProcessSearch(searchTerm);
    // console.log('GQ nlp ' ,preProcessTerms);
    // var preProcessTerms2 = preProcessSearch2(searchTerm);
    // console.log('GQ stopword ' ,preProcessTerms2);


    client.search({
      index: index,
      body: {
        //query: { "wildcard": { query: "*"+searchTerm+"*"} }
        "size": 20,
        "min_score": .2,
        "query": {
          "bool": {
            "should": [
              //{ "wildcard": { "query":  "*"+searchTerm+"*"}},
              {
                "match": {
                  "title": { // name of seach field
                    query: searchTerm,
                    boost: 2
                  }
                }
              },
              {
                "match": {
                  "title": { // name of seach field
                    query: searchTerm,
                    fuzziness: "auto",
                    //prefix_length: 0
                  }
                }
              },

              //{ "match_phrase": { "query":  searchTerm   }}
            ]
          }
        }

      }
    })
      .then(function (results) {
        var hits = results.hits.hits;
        res.send(hits);
      }, function (err) {
        console.trace(err.message);
      });
  }

  function updatePositiveRating(req, res, next) {
    client.update({
      index: index,
      type: type,
      id: req.params.id,
      body: {
        script: 'if( ctx._source.containsKey(\"liked\") ){ ctx._source.liked += 1; } else { ctx._source.liked = 1; }',
        upsert: {
          liked: 1
        }
      }
    }, function (error, response) {
      if (!error) {
        res.send(response);
      } else {
        res.send(error);
        console.trace(error.message);
      }

    });

  }

  function updateNegativeRating(req, res, next) {
    client.update({
      index: index,
      type: type,
      id: req.params.id,
      body: {
        script: 'if( ctx._source.containsKey(\"disliked\") ){ ctx._source.disliked += 1; } else { ctx._source.disliked = 1; }',
        upsert: {
          disliked: 1
        }
      }
    }, function (error, response) {
      if (!error) {
        res.send(response);
      } else {
        res.send(error);
        console.trace(error.message);
      }

    });




  }

  function getFeatured(req, res, next) {

    var maxCount = req.params.maxCount;
    client.search({
      'index': index,
      'body': {
        "fields": ["id", "prId", "title", "description", "featuredRanking", "dateModified", "datePublished"],
        "query": {
          "bool": {
            "must": [
              {
                "range": {
                  "featuredRanking": {
                    "gt": "0"
                  }
                }
              }
            ]
          }
        },
        "from": 0,
        "size": maxCount,
        "sort": [{ "featuredRanking": { "order": "desc" } }],
        "aggs": {}
      }
    }, function (error, response) {
      if (!error) {
        res.send(response);
      } else {
        res.send(error);
        console.trace(error.message);
      }
    });
  }

  function getCommon(req, res, next) {
    var maxCount = req.params.maxCount;
    client.search({
      'index': index,
      'body': {
        "fields": ["id", "prId", "title", "description", "commonQuestionRanking", "dateModified", "datePublished"],
        "query": {
          "bool": {
            "must": [
              {
                "range": {
                  "commonQuestionRanking": {
                    "gt": "0"
                  }
                }
              }
            ]
          }
        },
        "from": 0,
        "size": maxCount,
        "sort": [{ "commonQuestionRanking": { "order": "desc" } }],
        "aggs": {}
      }
    }, function (error, response) {
      if (!error) {
        res.send(response);
      } else {
        res.send(error);
        console.trace(error.message);
      }
    });
  }

  function getMostRecent(req, res, next) {
    var maxCount = req.params.maxCount;
    client.search({
      'index': index,
      'body': {
        "fields": ["id", "prId", "title", "description", "commonQuestionRanking", "dateModified", "datePublished"],
        "query": {
          "bool": {
            "should": [
              {
                "range": {
                  "dateModified": {
                    "gte": "1970/01/01",
                    "format": "yyyy/MM/dd||yyyy"
                  }
                }
              }
            ]
          }
        },
        "from": 0,
        "size": maxCount,
        "sort": [{ "dateModified": { "order": "desc" } }],
        "aggs": {}
      }
    }, function (error, response) {
      if (!error) {
        res.send(response);
      } else {
        res.send(error);
        console.trace(error.message);
      }
    });
  }

  function preProcessSearch(queryString) {
    var relevantTemrs = [];
    var nounTokens = nlp.sentence(queryString).terms.filter(function (t) {
      return t.pos.Noun;
    });

    var tags = nlp.text(queryString).tags(function (t) {
      return t.pos.Noun;
    });

    console.log("nlp tags:", tags[0]);

    for (var i = 0; i < nounTokens.length; i++) {
      relevantTemrs.push(nounTokens[i].text);
    }
    return relevantTemrs.join(' ');
  }

  function preProcessSearch2(queryString) {
    var relevantTemrs = [];
    var tokens = [];
    tokens = queryString.toLowerCase().split(' ');

    for (var i = 0; i < tokens.length; i++) {
      if (primaryStopWords.indexOf(tokens[i]) === -1) {
        relevantTemrs.push(tokens[i]);
      }
      // else {
      //   tokens[i] = tokens[i] + '^0.2';
      // }
    }
    return relevantTemrs.join(' ');
  }

  // function getRelatedPRs(prList){
  //   client.search({
  //     index: index,
  //     type: type,
  //     body  : {
  //     //"fields": ["prId", "title"],
  //     "query" : {
  //     "bool" : {
  //       "filter" : {
  //         "terms" : {
  //           "prId" : prList
  //           }
  //         }
  //       }
  //     }
  //   }
  // }).then(function(prs) {
  //       var relatedPR = [];
  //       console.log('get related pr ', prs.hits.hits);
  //       prs.hits.hits.forEach(function(pr) {
  //         var onePr = {
  //            prId : pr._source.prId,
  //           title : pr._source.title
  //         }
  //         relatedPR.push(onePr);
  //       });
  //     // console.log(relatedPR);
  //      return relatedPR;
  //
  //  });
  // }
};
