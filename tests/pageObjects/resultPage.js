/**
 * Created by trungnguyen on 10/18/16.
 */

var resultPage = function () {
  'use strict';
   this.totalResults = element(by.id('resultStatus'));
   this.searchBox = element(by.model('vm.selected'));
   this.searchButton = element(by.id('searchButton'));
   this.resultTitle = element(by.binding('results._source.title'));
   this.resultsArray = element.all(by.repeater('results in vm.resultsArray'));
   this.lastPageButton = element(by.css('[ng-click="selectPage(totalPages, $event)"]'));
   this.sortByRecentOption = element(by.cssContainingText('option', 'Most Recent'));
   this.sortByRelevanceOption = element(by.cssContainingText('option', 'Relevance'));
   this.sortByFeaturedOption =  element(by.cssContainingText('option', 'Featured'));
   this.radioButtons = element.all(by.css('input[name="optionsRadios"]'));
  // functions
  this.searchFor = function(searchTerm) {
      this.searchBox.clear();
      this.searchBox.sendKeys(searchTerm);
      this.clickSubmit();

  };
  this.extractTitle = function(result){
    return result.element(by.binding('results._source.title'));
  }
  this.clickSubmit = function() {
    //this.searchButton.click();
    browser.actions().sendKeys(protractor.Key.ENTER).perform();
  };

  this.sortByRecent = function() {
    this.sortByRecentOption.click();
  };

  this.sortByRelevance = function() {
    this.sortByRecentOption.click();
  }

  this.isFeaturedEnabled = function() {

  }
};


module.exports = {
  resultPage : new resultPage()
};




// it('should return search result with search values', function () {
//   browser.get('http://localhost:8001');
//   searchParams.forEach(function(searchParm){
//     element(by.model('vm.selected')).sendKeys(searchParm.phrase);
//     element(by.id('searchButton')).click();
//     expect(browser.getTitle()).toEqual('yoda: results');
//     var count = element(by.id('resultCount')).getInnerHtml();
//     expect(count).toBeGreaterThan(searchParm.expectedCount);  // number of results should be greater than 100
//     element.all(by.binding('result._source.title')).then(function(items) {
//       //expect(items.length).toBeLessThan(10);
//       items.forEach(function(item) {
//
//         // expect(['What','HIV','mom'].indexOf(item.getText()));  // match anyone of the term
//         checkTerms = searchParm.phrase.split(' ');
//         for (var x = 0; x < checkTerms.length; x++) {
//           console.log('checking term :',checkTerms[x]);
//           expect(item.getText()).toContain(checkTerms[x]);
//         }
//         // expect(item.getText()).toContain(['What']);
//         // expect(item.getText()).toContain(['is']);
//         //  expect(item.getText()).toContain(['link']);
//         //  expect(item.getText()).toContain(['HIV']);
//       })
//
//     });
//   })
//
// });
