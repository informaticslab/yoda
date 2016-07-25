(function() {
  'use strict';

  angular
    .module('app.results')
    .controller('ResultsController', ResultsController);

  ResultsController.$inject = ['logger', '$scope', '$state', '$stateParams'];
  /* @ngInject */
  function ResultsController(logger, $scope, $state, $stateParams) {
    var vm = this;
    vm.title = 'Results';
    vm.results = $stateParams.results;
    console.log(vm.results);
    activate();

    function activate() {
      logger.info('Activated Results View');
    }
  }
})();
