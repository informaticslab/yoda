var restClient = require('node-rest-client').Client;
var es = require('elasticsearch');
var esClient = new es.Client({
  host: 'localhost:9200'
});

var okToProcess = true;
var okToPush = true;

var httpClient = new restClient();

var baseUrl = "https://prototype.cdc.gov/api/v2/resources";
var service = "media";
var prKey = "164608";

var serviceUrl = baseUrl+'/'+service+"/"+prKey;
console.log(serviceUrl);
// direct way
httpClient.get(serviceUrl, function (data, response) {
  // parsed response body as js object

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
        question: obj.name,
        response: obj.description,
        resources: obj.Resources,
        related   : obj.related,
        tier      : obj.audience,
        featured  : obj.feature,
        common_question : obj.common_question,
        topic: obj.extendedAttributes.Topic,
        subtopic: obj.extendedAttributes.SubTopic,
        keywords: obj.extendedAttributes.Keywords,
        language: obj.language.name,
        datePublished : obj.datePublished,
        category: obj.extendedAttributes.Category,
        smartTag: obj.extendedAttributes.SmartTag
        //gender: obj.Gender,
        //readingLevel: obj.ReadingLevel,
        //readingLevelScore: obj.ReadingLevelScore,
        //center: obj.Center,
        //program: obj.Program,
        //probes: obj.Probes,
        //callToAction: obj.CallToAction,
        //background: obj.Background



       };
      console.log('recipe ', recipe);
      if (okToPush) {
            bulk_request.push({index: {_index: 'prepared_responses_test', _type: 'prepared_responses_test', _id: recipe.id}});
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
      }
    };
   if (okToPush) {
     perhaps_insert();
   }
  }
});
