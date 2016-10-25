(function() {
  'use strict';

  angular.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    var access = accessConfig.accessLevels;

    return [
      {
        state: 'contact',
        config: {
          url: '/contact',
          templateUrl: 'app/contact/contact.html',
          controller: 'ContactController',
          controllerAs: 'vm',
          title: 'Contact',
          data: {
            access: access.user
          },
          settings: {
            nav: 4,
            content: '<i class="fa fa-dashboard"></i> Contact'
          }
        }
      }
    ];
  }
})();