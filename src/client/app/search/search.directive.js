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
      $scope.isCollapsed = true;
    }

    return directive;
  }
})();
