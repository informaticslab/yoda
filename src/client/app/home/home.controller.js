(function () {
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
    vm.featuredPRs, vm.commonPRs, vm.mostRecent;

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
      var promises = [];
      return $q.all(promises).then(function () {
        // logger.info('Activated Home View');
      });
    }

  }
})();
