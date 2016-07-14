var router = require('express').Router();
var four0four = require('./utils/404')();
var data = require('./data');
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});
var index = 'prepared_responses';

router.get('/search', doSearch);
router.get('/questions', getQuestions);
router.get('/people', getPeople);
// router.get('/person/:id', getPerson);
router.get('/*', four0four.notFoundMiddleware);

module.exports = router;

//////////////


function doSearch(req, res, next) {
  client.search({
    index: index,
    body: {
      query: {
        query_string: {
          query: 'ebola'
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

    }
  })
  .then(function(results) {
    var hits = results.hits.hits;
    res.send(hits);
  }, function(err) {
    console.trace(err.message);
  });
}

function getPeople(req, res, next) {
  res.status(200).send(data.people);
}

function getPerson(req, res, next) {
  var id = +req.params.id;
  var person = data.people.filter(function(p) {
    return p.id === id;
  })[0];

  if (person) {
    res.status(200).send(person);
  } else {
    four0four.send404(req, res, 'person ' + id + ' not found');
  }
}
