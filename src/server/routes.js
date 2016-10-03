var router = require('express').Router();
var four0four = require('./utils/404')();
var elasticsearch = require('elasticsearch');
var users = require('./controllers/users');
var auth = require('./controllers/auth');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'error'
});
//var index = 'prepared_responses_test';
//var type = 'prepared_responses_test';

var index = 'prepared_responses_alias';  //using index alias
var type = 'prepared_responses';
var logicalOperator = 'or';
var min_score = 0.13  ;
var tie_breaker = 0.3;

var primaryStopWords = ['how','do','i','what','can','get','are','where','does','from','cause','my','out','have'];
// var secondaryStopWords = ['prevent'];
var multi_match_snippet_fuzzy =  {
  "multi_match": {
    "query": null,
    "type": "cross_fields",
    "fields": ["query", "response"],
    "tie_breaker": tie_breaker,
    "minimum_should_match": "100%",
    "operator" : logicalOperator,
    "fuzziness" : "2",
    "prefix_length" : 1
  }
};

var multi_match_snippet =  {
  "multi_match": {
    "query": null,
    "type": "cross_fields",
    "fields": ["query", "response"],
    "tie_breaker": tie_breaker,
    "minimum_should_match": "100%",
    "operator" : logicalOperator

   }
};

var match_field_query = {
  "match": {
    "query": { // name of seach field
      query: null,
      fuzziness: 2,
      prefix_length: 1,
      "operator" : logicalOperator,
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
      "operator" : logicalOperator,
 //     "boost" : 4
    }
  }
};
// var index = 'prepared_responses_v2';
// var type = 'prepared_responses_v2';

router.get('/users', users.index);

router.post('/login', auth.login);
router.post('/logout', function(req, res) {
  req.logout();
  res.end();
});

router.get('/getMostRecent/:maxCount',getMostRecent);
router.get('/getFeatured/:maxCount',getFeatured);
router.get('/getCommon/:maxCount',getCommon);
router.get('/termSearch/:query', termSearch);
router.get('/getPreparedResponsebyId/:id', getPreparedResponsebyId);
//router.get('/search/:query', doSearch);
router.get('/search/:query', fuzzySearch3);
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
   // console.log(results);
    // build related pr urls
    if (results._source.relatedPrList) {
      var prIds = results._source.relatedPrList.split(',');
      // preparedResponse.relatedPRs = getRelatedPRs(prIds);
      client.search({
        index: index,
        type: type,
        body  : {
          //"fields": ["prId", "query"],
          "query" : {
            "bool" : {
              "filter" : {
                "terms" : {
                  "prId" : prIds
                }
              }
            }
          }
        }
      }).then(function(prs) {
        var relatedPR = [];
     //   console.log('get related pr ', prs.hits.hits);
        prs.hits.hits.forEach(function(pr) {
          var onePr = {
            'prId' : pr._source.prId,
            'query' : pr._source.query
          }
          relatedPR.push(onePr);
        });
        preparedResponse['relatedPR'] = relatedPR;
        res.send(preparedResponse);
      });
    }
    else {
      res.send(preparedResponse);
    }

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
  var suggestions = null;
  client.search({
      index: index,
      body:   {
      "suggest": {
        "didYouMean": {
        "text": req.params.query,
          "phrase": {
              "field": "query"
          }
      }
    },

  //  "query": {
  //    "multi_match": {
  //      "query": req.params.query,
  //      "fields": [
  //          "response",
  //          "query"
  //     ]
  //  }
  //},
        "query": {
          "bool": {
            "should": [
              {
                "multi_match": {
                  "query": req.params.query,
                  "type": "phrase_prefix",
                  "fields": ["query", "response"],
                  "operator" : "or"
                }
              },

              {
                "match": {
                  "query": { // name of seach field
                    query: req.params.query,
                    fuzziness: 2,
                    prefix_length: 1,
                    "operator" : "or"
                  }
                }
              },
              { "wildcard":
                { "query":  "*"+req.params.query+"*"

                }
              }
            ]
          }
        }
  ,
        size: 1000,
        explain: false      //set to 'true' for testing only
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
function fuzzySearch2(req, res, next) {  //full body
  var suggestions = null;
  client.search({
      index: index,
      body:   {
        "suggest": {
          "didYouMean": {
            "text": req.params.query,
            "phrase": {
              "field": "query"
            }
          }
        },
        "query": {
          "bool": {
            "should": [
              { "match_phrase": { "query":  req.params.query   }},
              { "match_phrase": { "response":  req.params.query   }},
              //{
              //  "multi_match": {
              //    "query": req.params.query,
              //    "type": "phrase_prefix",
              //    "fields": ["query", "response"],
              //    "operator" : "or"
              //  }
              //},

              {
                "match": {
                  "query": { // name of seach field
                    query: req.params.query,
                    fuzziness: 2,
                    prefix_length: 1,
                    "operator" : "or"
                  }
                }
              },
              { "wildcard":
              { "query":  "*"+req.params.query+"*"

              }
              }
            ]
          }
        }
        ,
        size: 1000,
        explain: false      //set to 'true' for testing only
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
function fuzzySearch3(req, res, next) {  //full body
  var suggestions = null;
  var preProcessTerms = preProcessSearch(req.params.query);
 // console.log(preProcessTerms);
  multi_match_snippet.multi_match.query = req.params.query;
  multi_match_snippet_fuzzy.multi_match.query = req.params.query;
  match_field_query.match.query.query = req.params.query;
  match_field_response.match.response.query = req.params.query;

  //console.log('inused = ',multi_match_snippet)
  client.search({
      index: index,
      body:   {
        "suggest": {
          "didYouMean": {
            "text": req.params.query,
            "phrase": {
              "field": "query"
            }
          }
        },
        "min_score": min_score,
        "query": {
          "bool": {
            "should": [
              // { "match_phrase": { "query":  req.params.query}},
              // { "match_phrase": { "response":  req.params.query}},
             //  multi_match_snippet,
             //  multi_match_snippet_fuzzy,
             //  match_field_query,
             //  match_field_response,
             //   { "multi_match": {
             //      "query": req.params.query,
             //      "type": "most_fields",
             //      "fields": ["query", "response"],
             //      "tie_breaker": tie_breaker,
             //      "minimum_should_match": "100%",
             //      "operator" : "or"
             //    }
             //  },
              {
                "match": {
                  "query": { // name of seach field
                    query: req.params.query,
                    fuzziness: 1,
                    prefix_length: 1,
                    "operator" : "or",
                    "minimum_should_match": "100%"
                    //    "boost" : 4
                  }
                }
              },
              {
                "match": {
                  "response": { // name of seach field
                    query: req.params.query,
                    fuzziness: 1,
                    prefix_length: 1,
                    "operator" : "or",
                    "minimum_should_match": "100%"
                  }
                }
              },
              {
                "match": {
                  "query": { // name of seach field
                    query: req.params.query,
                    "operator" : "or",
                    "minimum_should_match": "40%"
                    //    "boost" : 4
                  }
                }
              },
              {
                "match": {
                  "response": { // name of seach field
                    query: req.params.query,
                    "operator" : "or",
                    "minimum_should_match": "40%"
                  }
                }
              },
              {
                "match": {
                  "query": { // name of seach field
                    query: preProcessTerms,
                    "operator" : "and",
                    "boost" :2
                  }
                }
              },
              {
                "match": {
                  "response": { // name of seach field
                    query: preProcessTerms,
                    "operator" : "and",
                    "boost" :2
                  }
                }
              }

              //{ "wildcard":
              //{ "query":  "*"+req.params.query+"*"
              //
              //}
              //},

            ]
          }
        },
        size: 1000,
        explain: false      //set to 'true' for testing only
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
     //console.log(JSON.stringify(resultPackage));
      res.send(resultPackage);
    }, function(err) {
      console.trace(err.message);
    });
}
function termSearch(req, res, next) {
  console.log(req)
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
  var searchTerm = req.params.query;
  searchTerm = searchTerm.toLowerCase();
  client.search({
    index: index,
    body: {
       //query: { "wildcard": { query: "*"+searchTerm+"*"} }
    "size": 20,
    //"min_score":.2,
    "query": {
    "bool": {
      "should": [
        { "wildcard": { "query":  "*"+searchTerm+"*"}},
        {
          "match": {
            "query": { // name of seach field
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

function getFeatured(req,res,next){

  var maxCount = req.params.maxCount;
  client.search({
    'index' : index,
    'body' : {
    "fields": ["id","prId","query", "response", "featuredRanking","dateModified","datePublished"],
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
    "sort": [{"featuredRanking": {"order":"desc"}} ],
    "aggs": { }
  }
  }, function (error, response) {
    if(!error){
      res.send(response);
    } else {
      res.send(error);
      console.trace(error.message);
    }
  });
}

function getCommon(req,res,next){
  var maxCount = req.params.maxCount;
  client.search({
    'index' : index,
    'body' : {
      "fields": ["id","prId","query", "response", "commonQuestionRanking","dateModified","datePublished"],
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
      "sort": [{"commonQuestionRanking": {"order":"desc"}} ],
      "aggs": { }
    }
  }, function (error, response) {
    if(!error){
      res.send(response);
    } else {
      res.send(error);
      console.trace(error.message);
    }
  });
}
function getMostRecent(req,res,next){
  var maxCount = req.params.maxCount;
  client.search({
    'index' : index,
    'body' : {
      "fields": ["id","prId","query", "response", "commonQuestionRanking","dateModified","datePublished"],
      "query": {
        "bool": {
          "should": [
            {
            "range" : {
              "dateModified" : {
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
      "sort": [{"dateModified": {"order":"desc"}} ],
      "aggs": { }
    }
  }, function (error, response) {
    if(!error){
      res.send(response);
    } else {
      res.send(error);
      console.trace(error.message);
    }
  });
}
function preProcessSearch(queryString) {
  var relevantTemrs = [];
  var tokens = [];
  tokens = queryString.toLowerCase().split(' ');

  for (var i=0; i < tokens.length; i++) {
    if (primaryStopWords.indexOf(tokens[i]) === -1){
      relevantTemrs.push(tokens[i]);
    }
    // else {
    //   tokens[i] = tokens[i] + '^0.2';
    // }
  }
  console.log(relevantTemrs);
  return relevantTemrs.join(' ');
}

// function getRelatedPRs(prList){
//   client.search({
//     index: index,
//     type: type,
//     body  : {
//     //"fields": ["prId", "query"],
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
//           query : pr._source.query
//         }
//         relatedPR.push(onePr);
//       });
//     // console.log(relatedPR);
//      return relatedPR;
//
//  });
// }


