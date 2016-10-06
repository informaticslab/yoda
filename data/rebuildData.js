/**
 * Created by trungnguyen on 8/19/16.
 */
fs = require('fs');
prJsonData = JSON.parse(require('./cdcinfo_dev_data.json'));
var featureCount = 10;
var featuredPRs=[];
var commonPRs = [];

var newFormatPr =[];

var millisecondDays = 86400000;

for(var i=0; i < prJsonData.List.length; i++) {
  var obj = prJsonData.List[i];
  var publishedDate = randomDate(new Date('2008-01-01'), new Date());
  var modifiedDate =  new Date(publishedDate.getTime() + (getRandomInt(1,100) * millisecondDays));
  recipe = {
    id: obj.Id,
    prId: obj.Number,
    dateModified: modifiedDate,
    query: obj.Query,
    response: obj.Response,
    resources: obj.Resources,
    relatedPrList: obj.Related,
    tier: obj.Tier,
    featuredRanking: 0,
    commonQuestionRanking: 0,
    datePublished: publishedDate
  }
  if (obj.Topic) {
    recipe.topic = obj.Topic.Name
  }
  if (obj.Subtopic) {
    recipe.subtopic = obj.Subtopic.Name
  }
  if (obj.Keywords) {
    recipe.keywords = obj.Keywords
  }
  if (obj.Language) {
    recipe.language = obj.Language
  }
  if (obj.Category) {
    recipe.category = obj.Category.Name
  }
  if (obj.SmartTag) {
    recipe.smartTag =  obj.SmartTag.Name
  }
  newFormatPr.push(recipe);

}

for (var x = 0 ; x < featureCount; x++) {
   selectedPr = getRandomInt(0,prJsonData.List.length);
   newFormatPr[selectedPr].featuredRanking = getRandomInt(1,5);
   featuredPRs.push(selectedPr)
  selectedPr = getRandomInt(0,prJsonData.List.length);
  newFormatPr[selectedPr].commonQuestionRanking = getRandomInt(1,5);
  commonPRs.push(selectedPr)
}

prJsonData.List = newFormatPr;

fs.writeFile('./cdcinfo_dev_data_modified.json',JSON.stringify(prJsonData), function(err){
  if (err) {
    throw err;
  }
  console.log('saved');

})
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  var date = new Date(+start + Math.random() * (end - start));
  return date;
}
