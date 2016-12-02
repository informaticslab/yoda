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
                    url: '/results/:searchString/:page?sort&filter',
                    templateUrl: 'app/results/results.html',
                    controller: 'ResultsController',
                    controllerAs: 'vm',
                    title: 'results',
                    // ncyBreadcrumb: {
                    //     label: 'Results',
                    //     parent: 'home'
                    // },
                    params: {
                        searchString: null,
                        page: '1',
                        newSearch: null,
                        sort: null,
                        filter: null
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
