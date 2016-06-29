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
    vm.people = [];
    vm.title = 'Home';

    activate();

    function activate() {
      var promises = [getMessageCount(), getPeople()];
      return $q.all(promises).then(function() {
        logger.info('Activated Dashboard View');
      });
    }

    function getMessageCount() {
      return dataservice.getMessageCount().then(function(data) {
        vm.messageCount = data;
        return vm.messageCount;
      });
    }

    function getPeople() {
      return dataservice.getPeople().then(function(data) {
        vm.people = data;
        return vm.people;
      });
    }
  }
})();
