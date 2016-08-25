var restClient = require('node-rest-client').Client;
var es = require('elasticsearch');
var esClient = new es.Client({
  host: 'localhost:9200'
});

var Q = require('q');

var okToProcess = true;
var okToPush = true;
var prCount = 0;

var httpClient = new restClient();

var mainIndex =  {
  "index"  : "prepared_responses_test",
  "type"   : "prepared_responses_test"
}
var tempIndex =  {
  "index"  : "prepared_responses_2",
  "type"   : "prepared_responses_2"
}

var baseUrl = "https://prototype.cdc.gov/api/v2/resources";
var service = "media";
var prKey = "164608";
var prContent = "content";
var serviceUrl = baseUrl+'/'+service+"/"+prKey;

switchIndex()
  .then(deleteAllDoc)
  .then(retrievePR)
  .then(confirmInsert)
  .then(reindex)
.then(switchIndex);



function retrievePR() {
  var deferred = Q.defer();
  httpClient.get(serviceUrl, function (data, response) {
    // parsed response body as js object
    prCount = data.meta.pagination.total;
    var pageCount = data.meta.pagination.count;

    var content = data.results;


    if (okToProcess) {

      bulk_request = content.reduce(function (bulk_request, line) {

        // console.log(line);
        var obj, recipe;

        try {
          obj = line;
          //   console.log('object ', obj);
        } catch (e) {
          // console.log(e);
          console.log('Done reading');
          return bulk_request;
        }



        // Rework the data slightly
        recipe = {
          id: obj.id,
          prId : obj.extendedAttributes.PrId,
          number: obj.Number,
          dateModified  : obj.dateModified,
          query: obj.name,
          response: obj.description,
          category: obj.extendedAttributes.Category,
          commonQuestionRanking : obj.extendedAttributes.CommonQuestionRanking,
          featuredRanking  : obj.extendedAttributes.FeaturedRanking,
          relatedPrList   : obj.extendedAttributes.RelatedPrList,
          resources: obj.extendedAttributes.Resources,
          keywords: obj.extendedAttributes.Keywords,
          language: obj.language.name,
          datePublished : obj.datePublished,
          smartTag: obj.extendedAttributes.SmartTag,
          subtopic: obj.extendedAttributes.SubTopic,
          topic: obj.extendedAttributes.Topic,
          tier      : obj.audience

          //gender: obj.Gender,
          //readingLevel: obj.ReadingLevel,
          //readingLevelScore: obj.ReadingLevelScore,
          //center: obj.Center,
          //program: obj.Program,
          //probes: obj.Probes,
          //callToAction: obj.CallToAction,
          //background: obj.Background



        };
//      console.log('recipe ', recipe);
        if (okToPush) {
          bulk_request.push({index: {_index: mainIndex.index, _type: mainIndex.type, _id: recipe.id}});
          bulk_request.push(recipe);
        }
        return bulk_request;
      }, []);

      // A little voodoo to simulate synchronous insert
      var busy = false;
      var callback = function (err, resp) {
        if (err) {
          console.log(err);
        }

        busy = false;
      };

      // Recursively whittle away at bulk_request, 1000 at a time.
      var perhaps_insert = function () {
        if (!busy) {
          busy = true;
          esClient.bulk({
            body: bulk_request.slice(0, 1000)
          }, callback);
          bulk_request = bulk_request.slice(1000);
          console.log(bulk_request.length);
        }

        if (bulk_request.length > 0) {
          setTimeout(perhaps_insert, 10);
        } else {
          console.log('Inserted all records.');
          deferred.resolve();
        }
      };
      if (okToPush) {
        perhaps_insert();
      }
    }
  });
  return deferred.promise;
}

function confirmInsert() {
  var deferred = Q.defer();
  httpClient.get('http://localhost:9200/'+mainIndex.index+'/_count', function(countData){
    if (countData && countData.count == prCount) {
      console.log(prCount + ' Insert confirmed');
      deferred.resolve()
    }
    else {
      console.log('Insert not confirmed');
      deferred.reject('Insert not confirmed')
    }

  });
  return deferred.promise;
}
function deleteAllDoc() {
  var deferred = Q.defer();
  httpClient.delete('http://localhost:9200/'+mainIndex.index+'/'+mainIndex.type+'/_query?q=*:*',function(result){
    console.log(result);
        deferred.resolve('delete completed');
  })
  return deferred.promise
}

function reindex() {
  var deferred = Q.defer();
  console.log('i was in reindex')
  deferred.resolve(true);
  return deferred.promise;
}
