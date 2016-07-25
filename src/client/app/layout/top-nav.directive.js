(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('topNav', topNav);

  /* @ngInject */
  function topNav() {
    var directive = {
      bindToController: true,
      controller: TopNavController,
      controllerAs: 'vm',
      restrict: 'EA',
      scope: {
        'navline': '='
      },
      templateUrl: 'app/layout/top-nav.html'
    };

    TopNavController.$inject = ['$scope'];

    /* @ngInject */
    function TopNavController($scope, $state) {
      var vm = this;
      // $scope.isCollapsed = true;
    }

    return directive;
  }
})();
