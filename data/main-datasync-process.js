//read me
// expected parameters
// process.argv[2] = 'a' for "all"  or 's' for "single"
// process.argv[3] = id from syndication engine or PR id from prms  to be determined
// process.argv[4] = mode of operation  ['update','delete','create']  default to create if mode = 'a'

var restClient = require('node-rest-client').Client;
var es = require('elasticsearch');
var moment = require('moment');
var config = require('./elastic.config')();
var bunyan = require('bunyan');
var bunyanStreamElasticsearch = require('bunyan-stream-elasticsearch');


var esStream = new bunyanStreamElasticsearch({
  indexPattern: '[logstash-]YYYY.MM.DD',
  type: 'logs',
  host: 'localhost:9200',
  defaultTemplate: true
});

// manage error case
esStream.on('error', function (err) {
  console.log('Buyan Stream Elasticsearch Error:', err.stack);
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
  ],
  serializers: bunyan.stdSerializers
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
};

var mainIndex =  {
  "index"  : "prepared_responses",
  "type"   : "prepared_responses"
};

var baseUrl = "https://prototype.cdc.gov/api/v2/resources";
var service = "media";
var topicId = "12392";
var prKey = "164611";
var prContent = "content";
var singlePrServiceUrl = baseUrl+'/'+service+"/";
var allPrsServiceUrl = baseUrl+'/'+service+'?topicid='+topicId+'&max=0';
var serviceUrl = allPrsServiceUrl;
var mode = 'create' ;

var fd = fs.openSync(path.join(process.cwd(), PRfile), 'a')


// retrievePrToFile()
//   // .then(switchIndex)
//   .then(initIndex)
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
//   //.then(confirmInsert)
//   //.then(reindex)
//   //.then(switchIndex);

if (process.argv[2]) {
  if (process.argv[2] == 's') {
    console.log('processing single PR')
    if (!isNaN(process.argv[3])) {
      serviceUrl = singlePrServiceUrl + process.argv[3];
      mode = process.argv[4];
      retrievePrToFile()
        .then(initIndex)
        .then(getAlias()
          .then(function(response){
            var keys = Object.keys(response);
            oldIndex = keys[0];
          }))
        .then(closeIndex)
        // .then(configIndex)
        .then(putMappings)
        .then(openIndex)

        .then(syncPrSingle);

      //.then(confirmInsert)
      //.then(reindex)
      //.then(switchIndex);
    }
    else {
      console.log('invalid request parameter for single pr');
    }
  }
  else if (process.argv[2] == 'a') {
    console.log('processing all pr');
    retrievePrToFile()
      .then(initIndex)
      .then(getAlias()
        .then(function(response){
          var keys = Object.keys(response);
          oldIndex = keys[0];
        }))
      .then(closeIndex)
      // .then(configIndex)
      .then(putMappings)
      .then(openIndex)

      .then(syncPrSingle);

    //.then(confirmInsert)
    //.then(reindex)
    //.then(switchIndex);
  }

}

function retrievePrToFile(nextUrl){
  var deferred = Q.defer();

  httpClient.get(serviceUrl, function (data, response) {
    // console.log(data);
    // parsed response body as js object
    if(Buffer.isBuffer(data)){
      data = data.toString('utf8');
    }
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
          dateModified: new Date(obj.extendedAttributes.LastUpdateDate).toISOString(),
          title: obj.name,
          description: obj.description,
          category: obj.extendedAttributes.Category,
          commonQuestionRanking: obj.extendedAttributes.CommonQuestionRanking,
          featuredRanking: obj.extendedAttributes.FeaturedRanking,
          relatedPrList: obj.extendedAttributes.RelatedPrList,
          resources: obj.extendedAttributes.Resources,
          keywords: obj.extendedAttributes.Keywords,
          language: obj.extendedAttributes.Language,
          datePublished: obj.datePublished,
          smartTag: obj.extendedAttributes.SmartTag,
          subtopic: obj.extendedAttributes.SubTopic,
          topic: obj.extendedAttributes.Topic,
          tier: obj.extendedAttributes.Audience
        }

        fs.writeSync(fd,JSON.stringify(recipe)+'\n');
        console.log('saving PR '+recipe.prId);
        log.info({type:'Success'}, 'Saving PR with ID: '+ recipe.prId+ ' to local file');

    }

    if (nextUrl){
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
  log.info({type:'Success'}, 'Creating new index: ' + newIndexName);
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
  // var body = config.settings;
  log.info({type:'Success'}, 'Configure index: ' + newIndexName);
  return esClient.indices.putSettings({
    index: newIndexName,
    type: baseIndex.type
    // body: body
  })
}

/**
* Close index
*/
function closeIndex() {
  log.info({type:'Success'}, 'Close index: ' + newIndexName);
  return esClient.indices.close({
    index: newIndexName
  });
}

/**
* Open index
*/

function openIndex() {
  log.info({type:'Success'}, 'Open index:' + newIndexName);
  return esClient.indices.open({
    index: newIndexName
  });
}

/**
* Create mappings for the new index
*/
function putMappings() {
  log.info({type:'Success'}, 'Apply mappings for: ' + newIndexName);
  var body = config.mappings;
  console.log('mappings', body);
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
  log.info({type:'Success'}, 'Deleting old index: ' + oldIndex);
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
  log.info({type:'Success'}, 'Update alias from ' + oldIndex + ' to ' + newIndexName);

  return esClient.indices.updateAliases({
    body: {
      actions: [
        { remove: {index: oldIndex, alias: indexAlias} },
        { add: { index: newIndexName, alias: indexAlias} }
      ]
    }
  });
}


//////////////////////////////////////////////
// LOOK HERE WILL SETUP FOR TESTING DATA ONLY
// NEED TO CHANGE WHEN SE data is viable
//////////////////////////////////////////////

function syncPrSingle() {
  //var PRfile = 'PRfile_2016_08_29T18_26_44_586Z';
  var PRfile = 'cdcinfo_dev_data_single_lines_2.json';   //OVERRIDE HERE!!!!!!!!!!!!!!!
  var deferred = Q.defer();
  var content;
  // console.log('load data');
  try {
    // console.log('load data');
    log.info({type:'Info'}, 'Data syncronization start');
    content = fs.readFileSync(PRfile).toString().split('\n');
    content = content.filter(function(line) {return line !==''})
    content.forEach(function(listItem, index){
      if (listItem != '') {
        var obj = JSON.parse(listItem);
        if (mode == 'update') {
          esClient.index({
              'index': newIndexName,
              'type': baseIndex.type,
              'id': obj.id,
              'body': obj,
              'refresh' : true
            }, function (err, updateResult) {
              if (err) {
                deferred.reject();
                console.log('update PR ' + obj.prId + ' failed.  Reason:' + err.message)
              }
              if (updateResult) {
                prCount++;
                checkInsertCompleted(content.length);

// <<<<<<< HEAD
//         esClient.create({
//           'index': newIndexName,
//           'type': baseIndex.type,
//           'id': obj.id,
//           'body': obj
//         }, function (err, insertResult) {
//           if (err) {
//             deferred.reject('Insert PR '+ obj.prId + ' failed');
//             // console.log('Insert PR '+ obj.prId + ' failed')
//             log.warn({type:'Fail'}, 'Insert PR '+ obj.prId + ' failed');
//           }
//           if (insertResult) {
//             prCount++;
//             checkInsertCompleted(content.length);

//             if (obj.id != insertResult._id) {
//               // console.log('insert PR ' + obj.prId + ' failed');
//               log.warn({type:'Fail'}, 'Insert PR '+ obj.prId + ' failed');
//             }
//             else {
//               // console.log('inserted PR ' + obj.prId );
//               log.info({type:'Success'},'Sucessfully inserted PR: ' + obj.prId);
// =======
                if (obj.id != updateResult._id) {
                  console.log('update PR ' + obj.prId + ' failed');
                }
                else {
                  console.log('updated PR ' + obj.prId);
                }
              }
            }
          );
        }
        if (mode =='remove') {
           // tobe implement
        }
        if (mode == 'create') {
          esClient.create({
              'index': newIndexName,
              'type': baseIndex.type,
              'id': obj.id,
              'body': obj
            }, function (err, insertResult) {
              if (err) {
                deferred.reject();
                console.log('Insert PR ' + obj.prId + ' failed.  Reason:' + err.message)
                log.warn({type:'Fail'}, 'Insert PR '+ obj.prId + ' failed')
              }
              if (insertResult) {
                prCount++;
                checkInsertCompleted(content.length);

                if (obj.id != insertResult._id) {
                  console.log('insert PR ' + obj.prId + ' failed');
                  log.warn({type:'Fail'}, 'Insert PR '+ obj.prId + ' failed')
                }
                else {
                  console.log('inserted PR ' + obj.prId);
                  log.info({type:'Success'},'Sucessfully inserted PR: ' + obj.prId);
                }
              }

            }
          );
        }
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

function confirmInsert() {
  var deferred = Q.defer();
  httpClient.get('http://localhost:9200/'+newIndexName+'/_count', function(countData){
    if (countData && countData.count == prCount) {
      // console.log('Insert Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
      log.info({type:'Success'}, 'Insert Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
      deferred.resolve()
    }
    else {
      console.log('Insert Not Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
      log.warn({type: 'Fail'},'Insert Not Confirmed: PR count from db : '+ countData.count + ', PR Count from file: ' + prCount);
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
  console.log('Completed datasync')
  deferred.resolve(true);
  return deferred.promise;
}
