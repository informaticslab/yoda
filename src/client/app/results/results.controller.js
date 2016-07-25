(function() {
  'use strict';

  angular
    .module('app.results')
    .controller('ResultsController', ResultsController);

  ResultsController.$inject = ['logger', '$scope', '$state', '$stateParams', 'dataservice', '$q'];
  /* @ngInject */
  function ResultsController(logger, $scope, $state, $stateParams, dataservice, $q) {
    var vm = this;
    vm.title = 'Results';
    vm.searchString = $stateParams.searchString;
    vm.resultsArray = [];
    vm.currentPage = 1;
    vm.pageSize = 5;

    vm.goToResults = function($item) {
      $state.go('details', {id: $item.id});
    }

    activate();

    function activate() {
      var promises = [search(vm.searchString)];
      return $q.all(promises).then(function(){
        logger.info('Activated Results View');
      });
    }

    function search(searchString) {
      return dataservice.doSearch(searchString).then(function(data){
        vm.resultsArray = data;
      });
    }
  }
})();
