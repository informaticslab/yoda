var router = require('express').Router();
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});

var index = 'prepared_responses_alias';  //using index alias
var type = 'prepared_responses';

router.get('/getLogIndices', getLogIndices);

module.exports = router;

//////////////////

function getLogIndices(req, res, next) {   //move to main routes file 
  client.cat.indices({
    h: ['index']
  })
  .then(function(results) {
    var indices = results;
    res.send(indices);
  }, function(err) {
    console.trace(err.message);
  });
}


function getLog(req, res, next) {
  //TODO
}