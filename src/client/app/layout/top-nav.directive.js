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

    TopNavController.$inject = ['$scope','$state'];

    /* @ngInject */
    function TopNavController($scope, $state) {
      var vm = this;
      // $scope.isCollapsed = true;

      vm.isHomeState = function() {
        var state =  $state.is('home');
        return state;
      };
    }

    return directive;
  }
})();
