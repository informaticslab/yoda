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

router.get('/getPreparedResponsebyId/:id', getPreparedResponsebyId);
router.get('/search/:query', doSearch);
router.get('/questions/:query', getQuestions);
router.get('/*', four0four.notFoundMiddleware);

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

function doSearch(req, res, next) {
  client.search({
    index: index,
    body: {
      query: {
        query_string: {
          query: req.params.query
        }
      },
      size: 1000,
      explain: false     //set to 'true' for testing only
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
       query: { "match": { query: req.params.query} }
    }
  })
  .then(function(results) {
    var hits = results.hits.hits;
    res.send(hits);
  }, function(err) {
    console.trace(err.message);
  });
}

