/**
 * Created by trungnguyen on 10/11/16.
 */
// spec.js
var loginModule = require('./login.js');
var path = require('path');
var fs = require('fs');
var searchParams =
  [
    {
      'phrase':'what is hiv',
      'expectedCountStatus': 'Displaying 1 - 10 of 290 results for what is hiv',
      'publicAudience':'Displaying 1 - 10 of 149 results for what is hiv',
      'professionalAudience':'Displaying 1 - 10 of 141 results for what is hiv',
      'expectedCount':'600',
      'countCompare':'lessthan',
      'checkTerms'  : ['HIV'],
      'mostRecent'  : 'What is the CDC Global AIDS Program (CDC GAP)?',
      'featured'    : '',
      'relevance'   : 'What is HIV?'

    },

    { 'phrase':'what is west nile virus',
      'expectedCountStatus':'Displaying 1 - 10 of 41 results for what is west nile virus',
      'publicAudience':'Displaying 1 - 10 of 24 results for what is west nile virus',
      'professionalAudience':'Displaying 1 - 10 of 17 results for what is west nile virus',
      'expectedCount': '200',
      'countCompare':'greaterthan',
      'checkTerms': ['west nile'],
      'mostRecent'  : 'EMAIL: Can I get a copy of the West Nile video?',
      'featured'    : 'What is West Nile virus neuroinvasive disease?',
      'relevance'   :'What are the symptoms of West Nile virus neuroinvasive disease?'
    },

    { 'phrase':'what is shingles',
      'expectedCountStatus':'Displaying 1 - 10 of 44 results for what is shingles',
      'publicAudience':'Displaying 1 - 10 of 23 results for what is shingles',
      'professionalAudience':'Displaying 1 - 10 of 21 results for what is shingles',
      'expectedCount':'44',
      'countCompare':'equal',
      'checkTerms' : ['shingle'],
      'mostRecent'  : 'Background Text: Varicella and zoster vaccine comparison for medical examination of aliens',
      'featured'    : '',
      'relevance'   : 'What is shingles (herpes zoster)? (Background Text)'
    }
  ];

var delay = 1000;

describe('home page',function() {
  var homeColumns = ['Most Recent','Common Questions','Featured Questions'];

  beforeAll(function() {
    browser.get('http://localhost:8001/');
    loginModule.login();
  });
//home page
  it('should be at home page', function() {
    expect(browser.getTitle()).toEqual('yoda: home');
  });

  it('should have common section, most recent and featured and at least one PR for each ', function() {
    element.all(by.css('.panel-title')).then(function(panelTitles) {
      for(var i=0;i< panelTitles.length;i++){
        panelTitles[i].getText().then(function(value){
          expect(homeColumns.join(',  ')).toContain(value);
        });

      }
    });
    element.all(by.repeater('mostRecentPR in vm.mostRecentPRs')).then(function(recents){
      expect(recents.length).toBeGreaterThan(0);
    });
    element.all(by.repeater('commonPR in vm.commonPRs')).then(function(commons){
      expect(commons.length).toBeGreaterThan(0);
    });
    element.all(by.repeater('featuredPR in vm.featuredPRs')).then(function(featured){
      expect(featured.length).toBeGreaterThan(0);
    });
  });

  it ('should go to topics page',function(){
    browser.get('http://localhost:8001/topics');
    expect(browser.getTitle()).toEqual('yoda: Topics');
    element(by.css('.title-section')).getText().then(function(text){
      expect(text).toBe('Topics (Placeholder)');
    })
  });

  it ('should go to About page',function(){
    browser.get('http://localhost:8001/about');
    expect(browser.getTitle()).toEqual('yoda: About');
  });

});

describe('CDC-INFO search', function() {

  browser.get('http://localhost:8001/');
// search page
  it('should returns search results for search terms', function () {
    //  var fd = fs.openSync(path.join(process.cwd(),'test.log'), 'a')
    browser.get('http://localhost:8001/');
    searchParams.forEach(function (searchParm) {
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      browser.driver.sleep(delay);
      element(by.id('resultStatus')).getText().then(function (rowCount) {
        expect(rowCount).toEqual(searchParm.expectedCountStatus);
      });

      // switch (searchParm.countCompare)  {
      //   case  'equal':
      //     expect(count).toBe(searchParm.expectedCount);  // number of results should be greater than 100
      //         break;
      //   case 'lessthan' :
      //     expect(count).toBeLessThan(searchParm.expectedCount);  // number of results should be greater than 100
      //         break;
      //   case 'greater':
      //     expect(count).toBeGreaterThan(searchParm.expectedCount);  // number of results should be greater than 100
      //         break;
      // }
      var checkterms = searchParm.checkTerms;
      element.all(by.repeater('results in vm.resultsArray')).then(function (results) {
        browser.driver.sleep(delay);
        results.forEach(function (result) {

          //checking title
          result.element(by.binding('results._source.title')).getText().then(function (title) {

            for (x = 0; x < checkterms.length; x++) {
              // console.log('title :', title, ' check term ', checkterms[x].toString());
              expect(title.toString().toLowerCase()).toContain(checkterms[x].toLowerCase());
            }
          });
          //checking description
          // result.element(by.id('description')).evaluate('results._source.description').then(function(description){
          //   for (x = 0; x < checkterms.length; x++) {
          //    // console.log('description :', description, ' check term ', checkterms[x].toString());
          //     expect(description.toString().toLowerCase()).toContain(checkterms[x].toLowerCase());
          //   }
          // });
        })
      });
      browser.driver.sleep(delay);
      // click on the last page and check the results
      var lastPageButton = element(by.css('[ng-click="selectPage(totalPages, $event)"]'));
      lastPageButton.click();
      browser.driver.sleep(delay);
      element.all(by.repeater('results in vm.resultsArray')).then(function (results) {
        results.forEach(function (result) {

          //checking title
          result.element(by.binding('results._source.title')).getText().then(function (title) {

            for (x = 0; x < checkterms.length; x++) {
              // console.log('title :', title, ' check term ', checkterms[x].toString());
              expect(title.toString().toLowerCase()).toContain(checkterms[x].toLowerCase());
            }
          });
          //checking description
          // result.element(by.id('description')).evaluate('results._source.description').then(function(description){
          //   for (x = 0; x < checkterms.length; x++) {
          //    // console.log('description :', description, ' check term ', checkterms[x].toString());
          //     expect(description.toString().toLowerCase()).toContain(checkterms[x].toLowerCase());
          //   }
          // });
        })
      });
    });
  });
})


describe('CDC-INFO Sort',function(){
  pending('Force skip');
  var searchResults;

  it ('should Sort by most recent', function() {
    searchParams.forEach(function (searchParm) {
      browser.get('http://localhost:8001/');
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('in most recent:', searchParm.phrase);
      element(by.cssContainingText('option', 'Most Recent')).click();
      element.all(by.repeater('results in vm.resultsArray')).then(function (results) {
        browser.driver.sleep(delay);
        results[0].element(by.binding('results._source.title')).getText().then(function (title) {
          expect(title).toBe(searchParm.mostRecent);
        });
      });
    })
  });
  it ('should Sort by relevance', function() {
    searchParams.forEach(function (searchParm) {
      browser.get('http://localhost:8001/');
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('in most relevance:', searchParm.phrase);
      element(by.cssContainingText('option', 'Relevance')).click();
      element.all(by.repeater('results in vm.resultsArray')).then(function (results) {
        results[0].element(by.binding('results._source.title')).getText().then(function (title) {
          expect(title).toBe(searchParm.relevance);
        });
      });
    })
  });

  it ('should Sort by featured', function() {
    searchParams.forEach(function (searchParm) {
      browser.get('http://localhost:8001/');
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      var featuredOption = element(by.cssContainingText('option', 'Featured'));
    //  featuredOption.getAttribute('disabled').then
      featuredOption.getAttribute('disabled').then(function(attr){
        console.log(attr);
        if (!attr) {
          featuredOption.click();
          console.log('in featured:', searchParm.phrase);
          element.all(by.repeater('results in vm.resultsArray')).then(function (results) {
            browser.driver.sleep(delay);
            results[0].element(by.binding('results._source.title')).getText().then(function (title) {
              expect(title).toBe(searchParm.featured);
            });
          });
        }
      });

    })
  });
});

describe('CDC-INFO Filter',function(){
  pending('Force skip');
  it ('should filter by public', function(){
    searchParams.forEach(function (searchParm) {
      browser.get('http://localhost:8001/');
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('searching for', searchParm.phrase);
      element.all(by.css('input[name="optionsRadios"]')).then(function(buttons){
        buttons[1].click();
        browser.driver.sleep(delay);
        element(by.id('resultStatus')).getText().then(function(rowCount){
          expect(rowCount).toEqual(searchParm.publicAudience);
        });
      })

    })
  });

  it ('should filter by professional', function(){
    searchParams.forEach(function (searchParm) {
      browser.get('http://localhost:8001/');
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('searching for', searchParm.phrase);
      element.all(by.css('input[name="optionsRadios"]')).then(function(buttons){
        buttons[2].click();
        browser.driver.sleep(6000);
        element(by.id('resultStatus')).getText().then(function(rowCount){
          expect(rowCount).toEqual(searchParm.professionalAudience);
        });
      })
    })
  });
});

describe('CDC-INFO Detail Page', function() {
  pending('Force skip');
  it('should return a detail page with ID:60183 ', function () {
    browser.get('http://localhost:8001/details/60183');
    expect(browser.getTitle()).toEqual('yoda: Details');
    expect(element(by.binding('vm.data.id')).getAttribute('value') == 60183);
    expect(element(by.id('section4')).getInnerHtml()).toContain('Publications');
    expect(element(by.id('section6')).getInnerHtml()).toContain('RELATED')

  });
})

