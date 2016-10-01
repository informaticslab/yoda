(function() {
  'use strict';

  angular
    .module('app.admin')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    var access = accessConfig.accessLevels;

    return [
      {
        state: 'admin',
        config: {
          url: '/admin',
          templateUrl: 'app/admin/admin.html',
          controller: 'AdminController',
          controllerAs: 'vm',
          title: 'Admin',
          data: {
            access: access.admin
          },
          settings: {
            nav: 4,
            content: '<i class="fa fa-lock"></i> Admin'
          }
        }
      }
    ];
  }
})();
