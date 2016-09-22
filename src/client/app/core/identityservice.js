(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('identityservice', identityservice);

  identityservice.$inject = ['$window', '$rootScope'];
  /* @ngInject */
  function identityservice($window, $rootScope) {
    var currentUser;
    if(!!$rootScope.globals) {
      currentUser = $rootScope.globals.currentUser;
    }
    return {
      currentUser: currentUser,
      isAuthenticated: function() {
        console.log(!!this.currentUser);
        return !!this.currentUser;
      }
    }
  }
})();