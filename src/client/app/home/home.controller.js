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

    activate();

    ///////

    function activate() {
      var promises = [getDocCount()];
      return $q.all(promises).then(function () {
        // logger.info('Activated Home View');
      });
    }

    function getDocCount() {
      return dataservice.getDocCount()
        .then(function (data) {
          vm.documentCount = data.count;
        });
    }

  }
})();
