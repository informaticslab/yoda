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
      description: 'Elastisearch Showcase'
    };
    vm.messageCount = 0;
    vm.title = 'Home';
    vm.documentCount = 0;
    vm.stats = null;

    activate();

    ///////

    function activate() {
      var promises = [getStats()];
      return $q.all(promises).then(function () {
        // logger.info('Activated Home View');
      });
    }

    function getStats() {
      return dataservice.getStats()
        .then(function (data) {
          vm.stats = data;
          var queryTotal = vm.stats.search.query_total;
          var queryTime = vm.stats.search.query_time_in_millis;
          vm.avgQuery = queryTime / queryTotal;
          vm.size = vm.stats.store.size_in_bytes / Math.pow(1024, 3);

        });
    }

  }
})();
