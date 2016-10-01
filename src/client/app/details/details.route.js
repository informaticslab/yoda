(function() {
  'use strict';

  angular
    .module('app.details')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    var access = accessConfig.accessLevels
    return [
      {
        state: 'details',
        config: {
          url: '/details/:id',
          templateUrl: 'app/details/details.html',
          controller: 'DetailsController',
          controllerAs: 'vm',
          title: 'Details',
          data: {
            access: access.user
          },
          params: { id: null },
          settings: {
            nav: 3,
            content: '<i class="fa fa-lock"></i> Details'
          }
        }
      }
    ];
  }
})();
