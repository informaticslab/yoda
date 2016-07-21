(function() {
  'use strict';

  angular
    .module('app.results')
    .controller('ResultsController', ResultsController);

  ResultsController.$inject = ['logger'];
  /* @ngInject */
  function ResultsController(logger) {
    var vm = this;
    vm.title = 'Results';

    activate();

    function activate() {
      logger.info('Activated Results View');
    }
  }
})();
