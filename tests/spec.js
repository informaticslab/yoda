/**
 * Created by trungnguyen on 10/11/16.
 */
// spec.js
describe('CDC-INFO App', function() {
  it('should have a title', function() {
    browser.get('http://localhost:8001/');
    expect(browser.getTitle()).toEqual('yoda: home');
  });

  it('should return a detail page with ID:93372 ',function(){
    browser.get('http://localhost:8001/details/93372');
    expect(browser.getTitle()).toEqual('yoda: Details');
  });
  it('should return search result with search value of hiv ',function() {
    browser.get('http://localhost:8001');
    browser.wait(function () {
      var deferred = protractor.promise.defer();
      deferred.fulfill(setTimeout(function () {
          return true;
        }
        , 11000000));
      element(by.model('vm.selected')).sendKeys('what is hiv');
      element(by.id('searchButton')).click();
      expect(browser.getTitle()).toEqual('yoda: results');
      return deferred.promise;
    });



  })
});
