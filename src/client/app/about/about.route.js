(function() {
  'use strict';

  angular
    .module('app.about')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    var access  = accessConfig.accessLevels;

    return [
      {
        state: 'about',
        config: {
          url: '/about',
          templateUrl: 'app/about/about.html',
          controller: 'AboutController',
          controllerAs: 'vm',
          title: 'About',
          data: {
            access: access.user
          },
          settings: {
            nav: 4,
            content: '<i class="fa fa-dashboard"></i> About'
          }
        }
      }
    ];
  }
})();