(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('search', search);

  /* @ngInject */
  function search() {
    var directive = {
      bindToController: true,
      controller: SearchController,
      controllerAs: 'vm',
      restrict: 'EA',
      scope: {
        'navline': '='
      },
      templateUrl: 'app/search/search.html'
    };

    SearchController.$inject = ['$scope'];

    /* @ngInject */
    function SearchController($scope) {
      var vm = this;
      vm.selected = undefined;

      vm.search = function(val) { 
        if(val !== undefined) {
          return dataservice.doSearch(val).then(function(data) {
            vm.resultsArr = data;
          });
        }
      };

      vm.getQuery = function(val) {
        return dataservice.getQuestions(val).then(function(data) {
          return data.map(function(item) {
            return item._source.query;
          });
        });
      };

      $scope.isCollapsed = true;
    }

    return directive;
  }
})();
