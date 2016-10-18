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
    var access = accessConfig.accessLevels
    return [
      {
        state: 'results',
        config: {
          url: '/results/:searchString/:page?sort',
          templateUrl: 'app/results/results.html',
          controller: 'ResultsController',
          controllerAs: 'vm',
          title: 'results',
          data: {
            access: access.user
          },
          params: { searchString: null,
                    page: '1', 
                    newSearch: null,
                    sort: null
                  },  //required to pass along state params
          settings: {
            nav: 2,
            content: '<i class="fa fa-dashboard"></i> Home'
          }
        }
      }
    ];
  }
})();
