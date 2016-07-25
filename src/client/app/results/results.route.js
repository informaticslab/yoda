(function() {
  'use strict';

  angular
    .module('app.results')
    .run(appRun);

  appRun.$inject = ['routerHelper'];
  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'results',
        config: {
          url: '/results',
          templateUrl: 'app/results/results.html',
          controller: 'ResultsController',
          controllerAs: 'vm',
          title: 'results',
          params: { results: null },  //required to pass along state params
          settings: {
            nav: 2,
            content: '<i class="fa fa-dashboard"></i> Home'
          }
        }
      }
    ];
  }
})();
