/**
 * Created by trungnguyen on 10/21/16.
 */

var homePage = function () {
  'use strict';

  this.panelTitles = element.all(by.css('.panel-title'));
  this.recentPRs = element.all(by.repeater('mostRecentPR in vm.mostRecentPRs'));
  this.commonPRs = element.all(by.repeater('commonPR in vm.commonPRs'))
  this.featuredPRs = element.all(by.repeater('featuredPR in vm.featuredPRs'))
  this.topicSection = element(by.css('.title-section'));
  this.homeColumns = ['Most Recent','Common Questions','Featured Questions'];
};
module.exports = {
  homePage: new homePage()
};
