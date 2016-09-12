var router = require('express').Router();
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

var index = 'prepared_responses_alias';  //using index alias
var type = 'logs';

router.get('/getIndices', getIndices);
router.get('/getLogs/:index', getLogs);

module.exports = router;

//////////////////

function getIndices(req, res, next) {   //move to main routes file 
  client.indices.stats()
  .then(function(results) {
    var indices = [];
    for (var k in results.indices) {
      indices.push(k);
    }
    res.send(indices);
  }, function(err) {
    console.trace(err.message);
  });
}


function getLogs(req, res, next) { 
  // console.log(req);
  var params = req.params;
  var encodedParam = encodeURIComponent(params.index);
  client.search({
    index: encodedParam,
    body: {
      "query" : {
        "match_all" : {}
      },
      "size": 100
    }
  })
  .then(function(results) {
    var hits = results.hits;
    res.send(results);
  }, function(err) {
    console.trace(err.message);
  });

}