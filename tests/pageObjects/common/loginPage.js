/**
 * Created by trungnguyen on 10/18/16.
 */
/*File Name : loginPage.js*/
var loginPage = function () {
  'use strict';
  // var username = 'labuser';
  // var password = 'testwiththelab';
  // element(by.id('exampleInputEmail1')).sendKeys('labuser');
  // element(by.id('exampleInputPassword1')).sendKeys('testwiththelab');
  // element(by.css('button')).click();
  this.userName = element(by.model('vm.username'));
  this.password = element(by.model('vm.password'));
  this.submitButton = element(by.css('button'));
  //******************** functions *******************
  this.setUserName = function (username) {
    this.userName.clear();
    this.userName.sendKeys(username);
  };
  this.setPassword = function (password) {
    this.password.clear();
    this.password.sendKeys(password);
  };
  this.clickSubmit = function () {
    this.submitButton.click();
  };
};
module.exports = {
  log: new loginPage()
};
