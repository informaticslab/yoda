(function() {
  'use strict';

  angular
    .module('app.home')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$q', 'dataservice', 'logger'];
  /* @ngInject */
  function HomeController($q, dataservice, logger) {
    var vm = this;
    vm.news = {
      title: 'yoda',
      description: 'CDC-INFO responsive webapp'
    };
    vm.messageCount = 0;
    vm.title = 'Home';
    vm.featuredMax = 5;
    vm.featuredPRs,vm.commonPRs,vm.mostRecent;

    activate();

    var index = 'prepared_responses';

    vm.selected = undefined;
    vm.currentPage = 1;
    vm.pageSize = 10;


    vm.placeholderSort = [
                                'Topic',
                                'Type',
                                'Relevance',
                                'Keywords'
                              ];

    ///////

    function activate() {
      var promises = [getMessageCount(),getFeatured(vm.featuredMax),getCommon(vm.featuredMax),getMostRecent(vm.featuredMax)];
      return $q.all(promises).then(function() {
        // logger.info('Activated Home View');
      });
    }

    function getMessageCount() {
      return dataservice.getMessageCount().then(function(data) {
        vm.messageCount = data;
        return vm.messageCount;
      });
    }
    function getFeatured(maxCount) {
      return dataservice.getFeatured(maxCount).then(function(result){
        vm.featuredPRs = result.data.hits.hits;
    //    console.log(vm.featuredPRs)
        return vm.featuredPRs;
      })
    }
    function getCommon(maxCount) {
      return dataservice.getCommon(maxCount).then(function(result){
        vm.commonPRs = result.data.hits.hits;
   //     console.log(vm.commonPRs)
        return vm.commonPRs;
      })
    }
    function getMostRecent(maxCount) {
      return dataservice.getMostRecent(maxCount).then(function(result){
        vm.mostRecentPRs = result.data.hits.hits;
       // console.log(vm.mostRecentPRs)
        return vm.mostRecentPRs;
      })
    }
  }
})();
