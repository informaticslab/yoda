(function() {
  'use strict';

  angular
    .module('app.results')
    .controller('ResultsController', ResultsController);

  ResultsController.$inject = ['logger', '$scope', '$state', '$stateParams', 'dataservice', '$q', '$location', '$anchorScroll'];
  /* @ngInject */
  function ResultsController(logger, $scope, $state, $stateParams, dataservice, $q, $location, $anchorScroll) {
    var vm = this;
    vm.title = 'Results';
    vm.searchString = $stateParams.searchString;
    vm.resultsArray = [];
    vm.suggestionArray = [];
    vm.currentPage = 1;
    vm.pageSize = 5;
    vm.noResults = false;

    vm.toTop = function(id) {
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      $location.hash(old);
    };

    vm.goToResults = function($item) {
      $state.go('details', {id: $item.id});
    }

    activate();

    function activate() {
      var promises = [search(vm.searchString)];
      return $q.all(promises).then(function(){
        // logger.info('Activated Results View');
      });
    }

    function search(searchString) {
      return dataservice.doSearch(searchString).then(function(data){
        vm.suggestionArray = data.suggestions;
        vm.resultsArray = data.hits;
        if (vm.resultsArray.length === 0){
          vm.noResults = true;
        }
      });
    }
  }
})();
