var restClient = require('node-rest-client').Client;
var es = require('elasticsearch');
var moment = require('moment');
var config = require('./elastic.config')();
var bunyan = require('bunyan');
var bunyanStreamElasticsearch = require('bunyan-elasticsearch');

var esStream = new bunyanStreamElasticsearch({
  indexPattern: '[logstash-]YYYY.MM.DD',
  type: 'logs',
  host: 'localhost:9200' 
});

var log = bunyan.createLogger({
  name: 'cdcinfo',
  streams: [
    {stream: esStream},
    {
      type: 'rotating-file',
      path: './logs/data-load.log',
      period: '1d',
      count: 2  //keep 2 backups
    }
  ]
});

var esClient = new es.Client({
  host: 'localhost:9200'
});
var fs = require('fs');
var Q = require('q');
var path = require('path')
var PRfile =  'PRfile_'+ new Date().toISOString().replace(/-/g,'_').replace(/:/g,'_').replace('.' ,'_');

var okToProcess = true;
var okToPush = true;
var prCount = 0;

var httpClient = new restClient();

var indexAlias = 'prepared_responses_alias';
var newIndexName;
var oldIndex;

var baseIndex =  {
  "index"  : "prepared_responses",
  "type"   : "prepared_responses"
}

var mainIndex =  {
  "index"  : "prepared_responses",
  "type"   : "prepared_responses"
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

var fd = fs.openSync(path.join(process.cwd(), PRfile), 'a')

// initIndex()
//   .then(getAlias()
//     .then(function(response){
//       var keys = Object.keys(response); 
//       oldIndex = keys[0];
//     }))
//   .then(closeIndex)
//   .then(configIndex)
//   .then(openIndex)
//   .then(syncPrSingle)
//   .then(putMappings);

//   getAlias()
//     .then(function(response){
//       var keys = Object.keys(response); 
//       oldIndex = keys[0];
//       console.log(response);
//       console.log(oldIndex);
//     });

retrievePrToFile()
  // .then(switchIndex)
  .then(initIndex)
  .then(getAlias()
    .then(function(response){
      var keys = Object.keys(response); 
      oldIndex = keys[0];
    }))
  .then(closeIndex)
  .then(configIndex)
  .then(openIndex)
  .then(syncPrSingle)
  .then(putMappings);
  //.then(confirmInsert)
  //.then(reindex)
  //.then(switchIndex);


function retrievePrToFile(nextUrl){
  var deferred = Q.defer();

  httpClient.get(serviceUrl, function (data, response) {
    // parsed response body as js object
    pagination = data.meta.pagination;
    //prCount = data.meta.pagination.total;
    currentUrl = data.meta.pagination.currentUrl;
    nextUrl = data.meta.pagination.nextUrl;
    var pageCount = pagination.totalPages;

      for (var j=0;j<data.results.length; j++){
        var obj = data.results[j];
        var recipe = {
          id: obj.id,
          prId: obj.extendedAttributes.PrId,
          number: obj.Number,
          dateModified: obj.dateModified,
          query: obj.name,
          response: obj.description,
          category: obj.extendedAttributes.Category,
          commonQuestionRanking: obj.extendedAttributes.CommonQuestionRanking,
          featuredRanking: obj.extendedAttributes.FeaturedRanking,
          relatedPrList: obj.extendedAttributes.RelatedPrList,
          resources: obj.extendedAttributes.Resources,
          keywords: obj.extendedAttributes.Keywords,
          language: obj.language.name,
          datePublished: obj.datePublished,
          smartTag: obj.extendedAttributes.SmartTag,
          subtopic: obj.extendedAttributes.SubTopic,
          topic: obj.extendedAttributes.Topic,
          tier: obj.audience
        }
        fs.writeSync(fd,JSON.stringify(recipe));
        console.log('Saving PR with ID: '+recipe.prId+ ' to local file');
        log.info('Saving PR with ID: '+ recipe.prId+ ' to local file');
    }

    if (nextUrl != ''){
      retrievePrToFile(nextUrl);
    }
    else {
      fs.closeSync(fd);
      deferred.resolve(PRfile)
    };
  });
  return deferred.promise;
}

/**
* create the new index
*/
function initIndex() {  
  var timestamp = moment().format('X');
  newIndexName = baseIndex.index + '-' + timestamp;
  // console.log('creating new index: ' + newIndexName);
  log.info('Creating new index: ' + newIndexName);
  // console.log(newIndexName);
  return esClient.indices.create({
    index: newIndexName
  });
}

exports.initIndex = initIndex;

/**
* Update settings for the new index
*/
function configIndex() {
  var body = config.settings;
  log.info('Configure index: ' + newIndexName);
  return esClient.indices.putSettings({
    index: newIndexName,
    type: baseIndex.type,
    body: body
  })
}

/**
* Close index
*/
function closeIndex() {
  log.info('Close index: ' + newIndexName);
  return esClient.indices.close({
    index: newIndexName
  });
}

/**
* Open index
*/

function openIndex() {
  log.info('Open index:' + newIndexName);
  return esClient.indices.open({
    index: newIndexName
  });
}

/**
* Create mappings for the new index
*/
function putMappings() {
  log.info('Apply mappings for: ' + newIndexName);
  var body = config.mappings;
  return esClient.indices.putMapping({
    index: newIndexName,
    type: baseIndex.type,
    body: body
  });
}


/**
* delete old index
*/
function deleteOldIndex() {
  log.info('Deleting old index: ' + oldIndex);
  return esClient.indices.delete({
    index: oldIndex
  });
}

/**
* Get alias
*/
function getAlias() {
  return esClient.indices.getAlias({
    name: indexAlias
  });
}

/** 
* Update alias
*/
function updateAliases() {
  // console.log('update alias');
  log.info('Update alias from ' + oldIndex + ' to ' + newIndexName);

  return esClient.indices.updateAliases({
    body: {
      actions: [
        { remove: {index: oldIndex, alias: indexAlias} },
        { add: { index: newIndexName, alias: indexAlias} }
      ]
    }
  });  
}

function syncPrSingle() {
  //var PRfile = 'PRfile_2016_08_29T18_26_44_586Z';
  var PRfile = 'cdcinfo_dev_data_single_lines.json';
  var deferred = Q.defer();
  var content;
  // console.log('load data');
  try {
    // console.log('load data');
    log.info('Data syncronization start');
    content = fs.readFileSync(PRfile).toString().split('\n');
    content.forEach(function(listItem, index){
      if (listItem != '') {
        var obj = JSON.parse(listItem);

        esClient.create({
          'index': newIndexName,
          'type': baseIndex.type,
          'id': obj.id,
          'body': obj
        }, function (err, insertResult) {
          if (err) {
            deferred.reject('Insert PR '+ obj.prId + ' failed');
            // console.log('Insert PR '+ obj.prId + ' failed')
            log.warn('Insert PR '+ obj.prId + ' failed');
          }
          if (insertResult) {
            prCount++;
            checkInsertCompleted(content.length);

            if (obj.id != insertResult._id) {
              // console.log('insert PR ' + obj.prId + ' failed');
              log.warn('Insert PR '+ obj.prId + ' failed');
            }
            else {
              // console.log('inserted PR ' + obj.prId );
              log.info('Sucessfully inserted PR: ' + obj.prId);
            }
          }
        }
      );
    }
    });

  }
  catch (e) {
    deferred.reject();
    console.log ('error detected in SyncPR single ', e);
  }
  return deferred.promise;
}

function checkInsertCompleted(recordCount) {
 // console.log(prCount + ' ' + recordCount);
  // pick up where it left off
  if (prCount >= recordCount) {
    // wait 15 seconds before execute
    setTimeout(function () {
      confirmInsert()
        .then(reindex)
        .then(updateAliases)
        .finally(deleteOldIndex)
    }, 15000);
  }
}

// function syncPrBulk() {
//   var PRfile = 'PRfile_2016_08_29T18_26_44_586Z';
//   var deferred = Q.defer();
//   var content;
//   try {
//     content = fs.readFileSync(PRfile).toString().split('\n');
//     if (okToProcess) {
//       for (var i=0 ; i < content.length; i++) {

//         line = content[i];
//         bulk_request = content.reduce(function (bulk_request, line) {
//           // console.log(line);
//           var obj;
//           try {
//             obj = JSON.parse(line);
//             //  console.log('object ', obj);
//           } catch (e) {
//             // console.log(e);
//             console.log('Done reading');
//             return bulk_request;
//           }
//           if (okToPush) {
//             console.log('inserting PR '+ obj.prId);
//             bulk_request.push({index: {_index: mainIndex.index, _type: mainIndex.type, _id: obj.id}});
//             bulk_request.push(obj);
//           }
//           return bulk_request;
//         }, []);
//       }
//       // A little voodoo to simulate synchronous insert
//       var busy = false;
//       var callback = function (err, resp) {
//         if (err) {
//           console.log(err);
//           deferred.reject(err)
//         }

//         busy = false;
//       };

//       // Recursively whittle away at bulk_request, 1000 at a time.
//       var perhaps_insert = function () {
//         if (!busy) {
//           busy = true;
//           esClient.bulk({
//             body: bulk_request.slice(0,1000)
//           }, callback);
//           bulk_request = bulk_request.slice(1000);
//       //    console.log('bulk request length ', bulk_request.length);
//         }

//         if (bulk_request.length > 0) {
//           setTimeout(perhaps_insert, 10);
//         } else {
//           console.log('Inserted all records.');
//           deferred.resolve();
//         }
//       };
//       if (okToPush) {
//         perhaps_insert();
//       }
//     }
//   }
//   catch (e) {
//     deferred.reject();
//     console.log ('error detected in SyncPR ', e);
//   }
//   return deferred.promise;
// }


function confirmInsert() {
  var deferred = Q.defer();
  httpClient.get('http://localhost:9200/'+newIndexName+'/_count', function(countData){
    if (countData && countData.count == prCount) {
      // console.log('Insert Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
      log.info('Insert Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
      deferred.resolve()
    }
    else {
      console.log('Insert Not Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
      log.warn('Insert Not Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
      deferred.reject('Insertion not confirmed')
    }

  });
  return deferred.promise;
}

function deleteAllDoc() {
  var deferred = Q.defer();
  httpClient.delete('http://localhost:9200/'+mainIndex.index+'/'+mainIndex.type+'/_query?q=*:*',function(result){
    deferred.resolve();
    // console.log('completed deleting '+ result._indices._all.deleted + ' records');
  })
  return deferred.promise
}


function reindex() {
  var deferred = Q.defer();
  console.log('i was in reindex')
  deferred.resolve(true);
  return deferred.promise;
}
