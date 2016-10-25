/**
 * Created by trungnguyen on 10/11/16.
 */
// spec.js
var loginModule = require('./login.js');
var homeModule = require('./pageObjects/homePage.js');
var searchModule = require('./pageObjects/resultPage.js');
var path = require('path');
var fs = require('fs');
var searchParams1 =
  [
    {
      'phrase':'what is hiv',
      'expectedCountStatus': 'Displaying 1 - 10 of 290 results for what is hiv',
      'publicAudience':'Displaying 1 - 10 of 149 results for what is hiv',
      'professionalAudience':'Displaying 1 - 10 of 141 results for what is hiv',
      'expectedCount':'600',
      'countCompare':'lessthan',
      'checkTerms'  : ['hiv'],
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
    },

    ];
  var searchParams2 = [
    { 'phrase':'hiv prevention',
      'expectedCountStatus':'Displaying 1 - 10 of 44 results for what is shingles',
      'publicAudience':'Displaying 1 - 10 of 23 results for what is shingles',
      'professionalAudience':'Displaying 1 - 10 of 21 results for what is shingles',
      'expectedCount':'44',
      'countCompare':'equal',
      'checkTerms' : ['How can HIV infection be prevented?'],
      'mostRecent'  : 'Background Text: Varicella and zoster vaccine comparison for medical examination of aliens',
      'featured'    : '',
      'relevance'   : 'What is shingles (herpes zoster)? (Background Text)'
    },
    { 'phrase':'Prevent hiv',
      'expectedCountStatus':'Displaying 1 - 10 of 44 results for what is shingles',
      'publicAudience':'Displaying 1 - 10 of 23 results for what is shingles',
      'professionalAudience':'Displaying 1 - 10 of 21 results for what is shingles',
      'expectedCount':'44',
      'countCompare':'equal',
      'checkTerms' : ['How can HIV infection be prevented?'],
      'mostRecent'  : 'Background Text: Varicella and zoster vaccine comparison for medical examination of aliens',
      'featured'    : '',
      'relevance'   : 'What is shingles (herpes zoster)? (Background Text)'
    },
    { 'phrase':'How to prevent hiv',
      'expectedCountStatus':'Displaying 1 - 10 of 44 results for what is shingles',
      'publicAudience':'Displaying 1 - 10 of 23 results for what is shingles',
      'professionalAudience':'Displaying 1 - 10 of 21 results for what is shingles',
      'expectedCount':'44',
      'countCompare':'equal',
      'checkTerms' : ['How can HIV infection be prevented?'],
      'mostRecent'  : 'Background Text: Varicella and zoster vaccine comparison for medical examination of aliens',
      'featured'    : '',
      'relevance'   : 'What is shingles (herpes zoster)? (Background Text)'
    },
    { 'phrase':'How can I prevent hiv',
      'expectedCountStatus':'Displaying 1 - 10 of 44 results for what is shingles',
      'publicAudience':'Displaying 1 - 10 of 23 results for what is shingles',
      'professionalAudience':'Displaying 1 - 10 of 21 results for what is shingles',
      'expectedCount':'44',
      'countCompare':'equal',
      'checkTerms' : ['How can HIV infection be prevented?'],
      'mostRecent'  : 'Background Text: Varicella and zoster vaccine comparison for medical examination of aliens',
      'featured'    : '',
      'relevance'   : 'What is shingles (herpes zoster)? (Background Text)'
    },
  ];

var delay = 1000;

describe('home page',function() {

  beforeAll(function() {
    browser.get('http://localhost:8001/');
    loginModule.login();
  });
//home page
  it('should be at home page', function() {
    expect(browser.getTitle()).toEqual('yoda: home');
  });

  it('should have common section, most recent and featured and at least one PR for each ', function() {
    homeModule.homePage.panelTitles.then(function(panelTitles) {
      for(var i=0;i< panelTitles.length;i++){
        panelTitles[i].getText().then(function(value){
          expect(homeModule.homePage.homeColumns.join(',  ')).toContain(value);
        });

      }
    });

    homeModule.homePage.recentPRs.then(function(recents){
      expect(recents.length).toBeGreaterThan(0);
    });
    homeModule.homePage.commonPRs.then(function(commons){
      expect(commons.length).toBeGreaterThan(0);
    });
    homeModule.homePage.featuredPRs.then(function(featured){
      expect(featured.length).toBeGreaterThan(0);
    });
  });

  it ('should go to topics page',function(){
    browser.get('http://localhost:8001/topics');
    expect(browser.getTitle()).toEqual('yoda: Topics');
    homeModule.homePage.topicSection.getText().then(function(text){
      expect(text).toBe('Topics (Placeholder)');
    })
  });

  it ('should go to About page',function(){
    browser.get('http://localhost:8001/about');
    expect(browser.getTitle()).toEqual('yoda: About');
  });

});

describe('CDC-INFO search', function() {
   pending('Force skip');
  beforeAll(function() {
    browser.get('http://localhost:8001/');
  });
// search page
  it('should returns search results for search terms', function () {
    //  var fd = fs.openSync(path.join(process.cwd(),'test.log'), 'a')
  //  browser.get('http://localhost:8001/');
    searchParams1.forEach(function (searchParm) {
      searchModule.resultPage.searchFor(searchParm.phrase)
      expect(browser.getTitle()).toEqual('yoda: results');
      browser.driver.sleep(delay);
      searchModule.resultPage.totalResults.getText().then(function (rowCount) {
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

      searchModule.resultPage.resultsArray.then(function (results) {
        browser.driver.sleep(delay);
        results.forEach(function (result) {

          //checking title
          searchModule.resultPage.extractTitle(result).getText().then(function (title) {
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
      searchModule.resultPage.lastPageButton.click();
      browser.driver.sleep(delay);
      searchModule.resultPage.resultsArray.then(function (results) {
        results.forEach(function (result) {
          //checking title
          searchModule.resultPage.extractTitle(result).getText().then(function (title) {
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

describe('CDC-INFO search-top10', function() {
  //pending('Force skip');
  var maxCheck = 10;
  var resultsToCheck = maxCheck;

  //pending('Force skip');
  beforeAll(function() {
    browser.get('http://localhost:8001/');
  });
// search page
  it('should returns search results for search terms in top 10 results', function () {
    //  var fd = fs.openSync(path.join(process.cwd(),'test.log'), 'a')
    //  browser.get('http://localhost:8001/');
    searchParams2.forEach(function (searchParm) {
      var matchCount = 0;
      var checkTitle;
      searchModule.resultPage.searchFor(searchParm.phrase);
      expect(browser.getTitle()).toEqual('yoda: results');
      browser.driver.sleep(delay);
      var checkterms = searchParm.checkTerms;

      searchModule.resultPage.resultsArray.then(function (results) {
        browser.driver.sleep(delay);
        // check top 10 or the results length whichever smaller
        console.log('search phrase:  ', searchParm.phrase, ' result length ', results.length);
        expect(checkPhraseExist(results,checkterms)).toBe(true);
      });
    });

    var checkPhraseExist = function (results, checkTerms) {
      var matchCount = 0;
      var matchArray = [];
      var deferred = protractor.promise.defer();
      if (results.length < resultsToCheck) {
        resultsToCheck = results.length;
      }
      for (var i = 0; i < resultsToCheck; i++) {
        searchModule.resultPage.extractTitle(results[i]).getText().then(function (title) {
          checkTitle = title;
          console.log(checkTitle);
          if (checkTitle.toLowerCase().indexOf(checkTerms[0].toLowerCase()) != -1) {
            console.log('matched');
            matchArray.push(true);
          }
          else {
            matchArray.push(false);
          }
         // checkMatchingCompleted(matchArray,resultsToCheck);
          if (matchArray.length == resultsToCheck) {
            console.log(matchArray);
            if (matchArray.indexOf(true) != -1) {
              deferred.fulfill(true);
            }
            else {
              deferred.fulfill(false);
            }
          }
        });
      }
          return deferred.promise;
    }
  })

  function checkMatchingCompleted(matchedArray,expectedLen) {
      var deferred = protractor.promise.defer();
      if (matchedArray.length == expectedLen) {
        console.log(matchedArray);
        if (matchedArray.indexOf(true) != -1) {
          return true;
        }
        else {
          return false
        }
      }
    }

});

describe('CDC-INFO Sort-sharedLoop',function(){
  pending('Force-skip');
  var searchResults;
  beforeAll(function() {
    browser.get('http://localhost:8001/');
  });
  searchParams.forEach(function (searchParm) {
  it ('should Sort by most recent', function() {
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('in most recent:', searchParm.phrase);
      searchModule.resultPage.sortByRecent();
      //element(by.cssContainingText('option', 'Most Recent')).click();
      searchModule.resultPage.resultsArray.then(function (results) {
        browser.driver.sleep(delay);
        searchModule.resultPage.extractTitle(results[0]).getText().then(function (title) {
          expect(title).toBe(searchParm.mostRecent);
        });
      });
  it ('should Sort by relevance', function() {
      searchModule.resultPage.searchFor(searchParm.phrase);
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('in most relevance:', searchParm.phrase);
      searchModule.resultPage.sortByRelevance();
      searchModule.resultPage.resultsArray.then(function (results) {
        searchModule.resultPage.extractTitle(results[0]).getText().then(function (title) {
          expect(title).toBe(searchParm.relevance);
        });
      });
  });

  it ('should Sort by featured', function() {
      searchModule.resultPage.searchFor(searchParm.phrase);
      expect(browser.getTitle()).toEqual('yoda: results');
      var featuredOption = searchModule.resultPage.sortByFeaturedOption;
    //  featuredOption.getAttribute('disabled').then
      featuredOption.getAttribute('disabled').then(function(attr){
        console.log(attr);
        if (!attr) {
          featuredOption.click();
          console.log('in featured:', searchParm.phrase);
          searchModule.resultPage.resultsArray.then(function (results) {
            browser.driver.sleep(delay);
            searchModule.resultPage.extractTitle(results[0]).getText().then(function (title) {
              expect(title).toBe(searchParm.featured);
            });
          });
        }
      });
  });
  });
  });
});

describe('CDC-INFO Sort-independent',function(){
  pending('Force-skip');
  var searchResults;

  it ('should Sort by most recent', function() {
    searchParams.forEach(function (searchParm) {
      element(by.model('vm.selected')).sendKeys(searchParm.phrase);
      //element(by.id('searchButton')).click();
      browser.actions().sendKeys(protractor.Key.ENTER).perform();
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('in most recent:', searchParm.phrase);
      searchModule.resultPage.sortByRecent();
      //element(by.cssContainingText('option', 'Most Recent')).click();
      searchModule.resultPage.resultsArray.then(function (results) {
        browser.driver.sleep(delay);
        searchModule.resultPage.extractTitle(results[0]).getText().then(function (title) {
          expect(title).toBe(searchParm.mostRecent);
        });
      });
    })
  });
  it ('should Sort by relevance', function() {
    searchParams.forEach(function (searchParm) {
      searchModule.resultPage.searchFor(searchParm.phrase);
      expect(browser.getTitle()).toEqual('yoda: results');
      console.log('in most relevance:', searchParm.phrase);
      searchModule.resultPage.sortByRelevance();
      searchModule.resultPage.resultsArray.then(function (results) {
        searchModule.resultPage.extractTitle(results[0]).getText().then(function (title) {
          expect(title).toBe(searchParm.relevance);
        });
      });
    })
  });

  it ('should Sort by featured', function() {
    searchParams.forEach(function (searchParm) {
      searchModule.resultPage.searchFor(searchParm.phrase);
      expect(browser.getTitle()).toEqual('yoda: results');
      var featuredOption = searchModule.resultPage.sortByFeaturedOption;
      //  featuredOption.getAttribute('disabled').then
      featuredOption.getAttribute('disabled').then(function(attr){
        console.log(attr);
        if (!attr) {
          featuredOption.click();
          console.log('in featured:', searchParm.phrase);
          searchModule.resultPage.resultsArray.then(function (results) {
            browser.driver.sleep(delay);
            searchModule.resultPage.extractTitle(results[0]).getText().then(function (title) {
              expect(title).toBe(searchParm.featured);
            });
          });
        }
      });

    })
  });
});

describe('CDC-INFO Filter',function(){
  pending('Force-skip');
  beforeAll(function() {
    browser.get('http://localhost:8001/');

  });
  searchParams.forEach(function (searchParm) {

   // expect(browser.getTitle()).toEqual('yoda: results');
    it('should filter by public and professional', function () {
      searchModule.resultPage.searchFor(searchParm.phrase);
      expect(browser.getTitle()).toEqual('yoda: results');
     // searchParams.forEach(function (searchParm) {
        //browser.get('http://localhost:8001/');
        searchModule.resultPage.radioButtons.then(function (buttons) {
          buttons[1].click();
          browser.driver.sleep(delay);
          searchModule.resultPage.totalResults.getText().then(function (rowCount) {
            expect(rowCount).toEqual(searchParm.publicAudience);
          });

        })
        searchModule.resultPage.radioButtons.then(function (buttons) {
        buttons[2].click();
        browser.driver.sleep(delay);
        searchModule.resultPage.totalResults.getText().then(function (rowCount) {
          expect(rowCount).toEqual(searchParm.professionalAudience);
        });
      })
      })
    //});

    // it('should filter by professional', function () {
    //   pending('Force-skip');
    // //  searchParams.forEach(function (searchParm) {
    //     // browser.get('http://localhost:8001/');
    //    // console.log('searching for', searchParm.phrase);
    //   //  searchModule.resultPage.searchFor(searchParm.phrase);
    //    // expect(browser.getTitle()).toEqual('yoda: results');
    //     searchModule.resultPage.radioButtons.then(function (buttons) {
    //       buttons[2].click();
    //       browser.driver.sleep(delay);
    //       searchModule.resultPage.totalResults.getText().then(function (rowCount) {
    //         expect(rowCount).toEqual(searchParm.professionalAudience);
    //       });
    //     })
    // //  })
    // });
  })
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

