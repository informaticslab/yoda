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

    SearchController.$inject = ['$scope', 'dataservice', '$state'];

    /* @ngInject */
    function SearchController($scope, dataservice, $state) {
      var vm = this;
      vm.selected = undefined;

      vm.goToDetails = function($item, $model, $label) {
        // console.log($item);
        $state.go('details', {id: $item.id});
      };

      vm.goToResults = function($item) {
        console.log($item);
        $state.go('results', {searchString: $item});
      }
      
      vm.getQuery = function(val) {
        return dataservice.getQuestions(val).then(function(data) {
          return data.map(function(item) {
            return item._source;
          });
        });
      };

      $scope.isCollapsed = true;
    }

    return directive;
  }
})();
