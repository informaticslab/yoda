(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('search', search);

  /* @ngInject */
  function search() {
    var directive = {
      bindToController: true,
      controller: bingSearchController,
      controllerAs: 'vm',
      restrict: 'EA',
      scope: {
        'navline': '='
      },
      templateUrl: 'app/bingSearch/search.html'
    };

    bingSearchController.$inject = ['$scope', 'dataservice', '$state'];

    /* @ngInject */
    function bingSearchController($scope, dataservice, $state) {
      var vm = this;
      vm.selected = undefined;

      vm.goToDetails = function($item, $model, $label) {
        // console.log($item);
        $state.go('details', {id: $item.id});
        vm.selected = undefined;
      };

      vm.goToResults = function($item) {
        console.log($item);
        if(!($item === undefined)) {
          $state.go('results', {searchString: $item});
          vm.selected = undefined;
        }
      }

      vm.getQuery = function(val) {
        return dataservice.getQuestions(val).then(function(data) {
          return data.map(function(item) {
            return item._source;
          });
        });
      };

      vm.checkKey = function($event,$item) {
        // console.log($event);
        if ($event.which === 13) {  // enter key press, do search
          $state.go('results', {searchString: $item});
          vm.selected = undefined;
        }
      };

      $scope.isCollapsed = true;
    }

    return directive;
  }
})();
