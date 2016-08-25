var Q = required
var restClient = require('node-rest-client').Client;
var es = require('elasticsearch');
var esClient = new es.Client({
  host: 'localhost:9200'
});


var okToProcess = true;
var okToPush = true;
var host = 'localhost';
recordCount = 0;

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

var getRecordCount = function(host,index) {

};


httpClient.get(serviceUrl, function (data, response) {
  // parsed response body as js object
  var resources = null;
  var prcounts = data.meta.pagination.total;
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
        commonQuestionRanking : obj.extendedAttributes.commonQuestionRanking,
        featuredRanking  : obj.extendedAttributes.feature,
        relatedPrList   : obj.relatedPrList,
        resources: obj.extendedAttributes.resources,
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
        httpClient.get('http://'+host+':9200/'+mainIndex.index+'/_count', function(countData){
          if (countData && countData.count == prcounts) {
            console.log('Insert confirmed');
          }
          else {
            console.log('Insert failed');
          }

        })
      }
    };
   if (okToPush) {
     perhaps_insert();
   }
  }
});

