var router = require('express').Router();
var four0four = require('./utils/404')();
var data = require('./data');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});
var index = 'prepared_responses';
var type = 'prepared_responses';

// router.get('/termSearch/:query', termSearch);
router.get('/getPreparedResponsebyId/:id', getPreparedResponsebyId);
//router.get('/search/:query', doSearch);
router.get('/search/:query', fuzzySearch);
router.get('/questions/:query', getQuestions);
router.get('/*', four0four.notFoundMiddleware);
//router.get('/fuzzySearch/:query', fuzzySearch);
router.post('/updatePositiveRating/:id', updatePositiveRating);
router.post('/updateNegativeRating/:id', updateNegativeRating);

module.exports = router;

//////////////


function getPreparedResponsebyId(req, res, next) {
  client.get({
    index: index,
    type: type,
    id: req.params.id
  })
  .then(function(results) {
    var preparedResponse = results;
    res.send(preparedResponse);
  }, function(err) {
    console.trace(err.message);
  });
}

function doSearch(req, res, next) {  //full body

  client.search({
    index: index,
    body: {
      query: {
        query_string: {
          query: req.params.query
        }
      },
      size: 1000,
      // explain: true      //set to 'true' for testing only
    }
  })
  .then(function(results) {
    var hits = results.hits.hits;
    res.send(hits);
  }, function(err) {
    console.trace(err.message);
  });
}

function fuzzySearch(req, res, next) {  //full body
  var searchTerm = req.params.query;
  searchTerm = searchTerm.toLowerCase();
  var suggestions = null;
  client.search({
      index: index,
      body:   {
      "suggest": {
        "didYouMean": {
        "text": searchTerm,
          "phrase": {
              "field": "query"
          }
      }
    },

    "query": {
      "bool": {
        "should": [
          // { 
          //   "wildcard": { "query":  "*"+searchTerm+"*"}
          // },
          {
            "match":{
              "query": {
                query: searchTerm,
                boost: 2
              }  
            }
          },
          {
            "match": {
              "query": { // name of search field
                query: searchTerm,
                fuzziness: 2,
                // boost: 2,
                prefix_length: 1
              }
            }
          },
          {
            "match": {
              "response": {
                query: searchTerm
              }
            }
          },
          { 
            "match_phrase": { "query":  searchTerm   }
          }
        ]
      }
    },
    size: 1000,
      // explain: true      //set to 'true' for testing only
    }
    })
    .then(function(results) {
      //console.log('my result ',results);
      if (results.suggest.didYouMean  ) {
        suggestions = results.suggest.didYouMean;
      }
      var hits = results.hits.hits;
      var resultPackage = {
        "hits" : hits,
        "suggestions" : suggestions
      }
    //  console.log(resultPackage);
      res.send(resultPackage);
    }, function(err) {
      console.trace(err.message);
    });
}

function getQuestions(req, res, next) {
  var searchTerm = req.params.query;
  searchTerm = searchTerm.toLowerCase();
  client.search({
    index: index,
    body: {
       //query: { "wildcard": { query: "*"+searchTerm+"*"} }
    "size": 20,
    "query": {
      "bool": {
        "should": [
        { "wildcard": { "query":  "*"+searchTerm+"*"}},
        {
          "match": {
            "query": { // name of search field
              query: searchTerm,
              fuzziness: 2,
              prefix_length: 1
            }
          }
        },

        { "match_phrase": { "query":  searchTerm   }}

        ]
      }
    }
  }
  })
  .then(function(results) {
    var hits = results.hits.hits;
    res.send(hits);
  }, function(err) {
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
  }, function(error, response) {
    if(!error){
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
  }, function(error, response) {
    if(!error){
      res.send(response);
    } else {
      res.send(error);
      console.trace(error.message);
    }

  });

}


