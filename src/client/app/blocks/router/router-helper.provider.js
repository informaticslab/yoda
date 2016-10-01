/* Help configure the state-base ui.router */
(function() {
  'use strict';

  angular
    .module('blocks.router')
    .provider('routerHelper', routerHelperProvider);

  routerHelperProvider.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
  /* @ngInject */
  function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider) {
    /* jshint validthis:true */
    var config = {
      docTitle: undefined,
      resolveAlways: {}
    };

    if (!(window.history && window.history.pushState)) {
      window.location.hash = '/';
    }

    $locationProvider.html5Mode(true);

    this.configure = function(cfg) {
      angular.extend(config, cfg);
    };

    this.$get = RouterHelper;
    RouterHelper.$inject = ['$location', '$rootScope', '$state', 'logger', 'authservice'];
    /* @ngInject */
    function RouterHelper($location, $rootScope, $state, logger, authservice) {
      var handlingStateChangeError = false;
      var hasOtherwise = false;
      var stateCounts = {
        errors: 0,
        changes: 0
      };

      var service = {
        configureStates: configureStates,
        getStates: getStates,
        stateCounts: stateCounts
        // checkAuth: checkAuth
      };

      init();

      return service;

      ///////////////

      function configureStates(states, otherwisePath) {
        states.forEach(function(state) {
          state.config.resolve =
            angular.extend(state.config.resolve || {}, config.resolveAlways);
          $stateProvider.state(state.state, state.config);
        });
        if (otherwisePath && !hasOtherwise) {
          hasOtherwise = true;
          $urlRouterProvider.otherwise(otherwisePath);
        }
      }

      function handleRoutingErrors() {
        // Route cancellation:
        // On routing error, go to the dashboard.
        // Provide an exit clause if it tries to do it twice.
        $rootScope.$on('$stateChangeError',
          function(event, toState, toParams, fromState, fromParams, error) {
            if (handlingStateChangeError) {
              return;
            }
            stateCounts.errors++;
            handlingStateChangeError = true;
            var destination = (toState &&
              (toState.title || toState.name || toState.loadedTemplateUrl)) ||
              'unknown target';
            var msg = 'Error routing to ' + destination + '. ' +
              (error.data || '') + '. <br/>' + (error.statusText || '') +
              ': ' + (error.status || '');
            logger.warning(msg, [toState]);
            $location.path('/');
          }
        );
      }

      function init() {
        checkAuth()
        handleRoutingErrors();
        updateDocTitle();
      }

      function getStates() { return $state.get(); }

      function checkAuth() {
       
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
          // console.log('in check auth');
          // console.log('toState: ', toState);
          if(!('data' in toState) || !('access' in toState.data)){
              $rootScope.error = "Access undefined for this state";
              event.preventDefault();
          }
           if (!authservice.authorize(toState.data.access)) {
              $rootScope.error = "Seems like you tried accessing a route you don't have access to...";
              event.preventDefault();

              if(fromState.url === '^') {
                  if(authservice.isLoggedIn()) {
                      $state.go('home');
                  } else {
                      $rootScope.error = null;
                      $state.go('login');
                  }
              }
          }
        });
      }

      function updateDocTitle() {
        $rootScope.$on('$stateChangeSuccess',
          function(event, toState, toParams, fromState, fromParams) {
            stateCounts.changes++;
            handlingStateChangeError = false;
            var title = config.docTitle + ' ' + (toState.title || '');
            $rootScope.title = title; // data bind to <title>
          }
        );
      }
    }
  }
})();
