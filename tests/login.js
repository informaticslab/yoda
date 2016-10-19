/**
 * Created by trungnguyen on 10/17/16.
 */
var loginPage = require('./pageObjects/common/loginPage.js'),
  userName = 'labuser',
  password = 'testwiththelab';

exports.login = function () {
  loginPage.log.setUserName(userName);
  loginPage.log.setPassword(password);
  loginPage.log.clickSubmit();
  browser.driver.wait(function () {
    return browser.driver.getCurrentUrl().then(function (url) {
      return url;
    });
  });
};
