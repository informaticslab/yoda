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

router.get('/termSearch/:query', termSearch);
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
      explain: true      //set to 'true' for testing only
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
  var suggestions = null;
  client.search({
      index: index,
      body:   {
      "suggest": {
        "didYouMean": {
        "text": req.params.query,
        "phrase": {
              "field": "did_you_mean"
        }
      }
    },
    //"fuzzy" : {
    //    "did_you_mean" :{
    //      "value" : req.params.query,
    //      "fuzziness" :     2,
    //    }
    //  }
    "query": {
      "multi_match": {
        "query": req.params.query,
        "type": "phrase_prefix",
        "fields": [
            "response",
            "query",
            "keywords"
       ]
    }
  }
  ,
        size: 1000,
        explain: true      //set to 'true' for testing only
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
function termSearch(req, res, next) {
  client.search({
    index:index,
    body:{
      query:{
        term: {
          query: req.params.query
        }
      },
      size: 1000,
      explain: true
    }
  })
  .then(function(results) {
    var hits = results.hits.hits;
    res.send(hits);
  }, function(err) {
    console.trace(err.message);
  });
}

function getQuestions(req, res, next) {
  client.search({
    index: index,
    body: {
       query: { "wildcard": { query: "*"+req.params.query+"*"} }
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


