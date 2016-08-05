(function() {
  'use strict';

  angular
    .module('app.topics')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'topics',
        config: {
          url: '/topics',
          templateUrl: 'app/topics/topics.html',
          controller: 'TopicsController',
          controllerAs: 'vm',
          title: 'Topics',
          settings: {
            nav: 2,
            content: '<i class="fa fa-lock"></i> Topics'
          }
        }
      }
    ];
  }
})();
