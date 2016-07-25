(function() {
  'use strict';

  angular
    .module('app.layout')
    .directive('footer', footer);

  /* @ngInject */
  function footer() {
    var directive = {
      bindToController: true,
      controller: FooterController,
      controllerAs: 'vm',
      restrict: 'EA',
      scope: {
        'navline': '='
      },
      templateUrl: 'app/layout/footer.html'
    };

    FooterController.$inject = ['$scope'];

    /* @ngInject */
    function FooterController($scope) {
      var vm = this;
      // $scope.isCollapsed = true;
    }

    return directive;
  }
})();
