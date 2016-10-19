/**
 * Created by trungnguyen on 10/11/16.
 */
// spec.js
var loginModule = require('./login.js');
var path = require('path');
var fs = require('fs');
describe('CDC-INFO App', function() {
  var okToContinue = false;
  var checkterms = [];
  var idToCheck = getIdToCheck(10);
  var searchParams =
    [
      {'phrase':'what is hiv', 'expectedCount':'600','countCompare':'lessthan','checkTerms' : ['HIV']},
      {'phrase':'how do i get chicken','expectedCount': '200','countCompare':'greaterthan', 'checkTerms': ['chicken']},
      {'phrase':'what is shingles','expectedCount':'44', 'countCompare':'equal', 'checkTerms' : ['shingle'] }
    ];

  it('should be at home page', function() {
    browser.get('http://localhost:8001/');
    loginModule.login();
    expect(browser.getTitle()).toEqual('yoda: home');
  });

  it('should return search result with search values', function () {
  //  var fd = fs.openSync(path.join(process.cwd(),'test.log'), 'a')
    browser.get('http://localhost:8001');
      searchParams.forEach(function(searchParm){
        element(by.model('vm.selected')).sendKeys(searchParm.phrase);
        element(by.id('searchButton')).click();
        expect(browser.getTitle()).toEqual('yoda: results');
        var count = element(by.id('resultCount')).getInnerHtml() ;
        switch (searchParm.countCompare)  {
          case  'equal':
            expect(count).toBe(searchParm.expectedCount);  // number of results should be greater than 100
                break;
          case 'lessthan' :
            expect(count).toBeLessThan(searchParm.expectedCount);  // number of results should be greater than 100
                break;
          case 'greater':
            expect(count).toBeGreaterThan(searchParm.expectedCount);  // number of results should be greater than 100
                break;
        }
        // element.all(by.exactRepeater('result in vm.resultsArray')).then(function(results){
        //    results.forEach(function(result){
        //      console.log('hello ',result.element(by.binding('result._source.title')).getText());
        //    })
        // });
        // var allTitles = element.all(by.repeater('result in vm.resultsArray').column('result._source.title'));
        // var allDescription = element.all(by.repeater('result in vm.resultsArray').column('result._source.description'));
        element.all(by.binding('result._source.title')).then(function(items) {
          items.forEach(function(item) {
            // expect(['What','HIV','mom'].indexOf(item.getText()));  // match anyone of the term
            checkterms = searchParm.checkTerms;
              item.getText().then(function(title) {
                for (x = 0; x < checkterms.length; x++) {
                  console.log('title :', title, ' check term ', checkterms[x].toString());
                  expect(title.toString().toLowerCase()).toContain(checkterms[x].toLowerCase());
                }
              });

            // expect(item.getText()).toContain(['What']);
            // expect(item.getText()).toContain(['is']);
            //  expect(item.getText()).toContain(['link']);
            //  expect(item.getText()).toContain(['HIV']);
          })

        });
        element.all(by.binding('result._source.description')).then(function(items) {
          items.forEach(function(item) {
            // expect(['What','HIV','mom'].indexOf(item.getText()));  // match anyone of the term
            checkterms = searchParm.checkTerms;
            item.getText().then(function(description) {
              for (x = 0; x < checkterms.length; x++) {
                console.log('description :', description, ' check term ', checkterms[x].toString());
                expect(description.toString().toLowerCase()).toContain(checkterms[x].toLowerCase());
              }
            });

            // expect(item.getText()).toContain(['What']);
            // expect(item.getText()).toContain(['is']);
            //  expect(item.getText()).toContain(['link']);
            //  expect(item.getText()).toContain(['HIV']);
          })

        });
      })
  //  fs.close(fd);
    });


  it('should sort by most recent', function(){
    element(by.cssContainingText('option', 'Most Recent')).click();
  });

  it('should sort by relevant', function() {
    element(by.cssContainingText('option', 'Relevant')).click();

  });

  it('should sort by featured article', function(){
    element(by.cssContainingText('option', 'Featured')).click();
  });
  it('should filter by public audience', function(){

  });
  it('should filter by professional audience', function(){

  });

  it('should return a detail page with ID:93372 ', function () {
    browser.get('http://localhost:8001/details/93372');
    expect(browser.getTitle()).toEqual('yoda: Details');
    expect(element(by.binding('vm.data.id')).getAttribute('value') == 93372);
  });



  function getIdToCheck(numToCheck) {
      for (var x = 0; x < numToCheck; x ++) {
        idx = getRandomInt(1,6000);
      }
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

});
