(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('authservice', authservice);

  authservice.$inject = ['$http', '$cookies', '$rootScope', '$timeout', 'Base64'];
  /* @ngInject */
  function authservice($http, $cookies, $rootScope, $timeout, Base64) {
    var service = {
      login: login,
      setCredentials: setCredentials
    };

    return service;

    function login(username, password, callback) {
      /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
      $timeout(function() {
        var response = {success: username ==='labuser' && password ==='testwiththelab'}; 
        if (!response.success) {
          response.message = 'Username/password is incorrect';
        }
        callback(response);
      }, 1000);


      /* Use this for real authentication
       ----------------------------------------------*/
      //$http.post('/api/authenticate', { username: username, password: password })
      //    .success(function (response) {
      //        callback(response);
      //    });
    }

    function setCredentials(username, password) {
      var authdata = Base64.encode(username + ':' + password);

      $rootScope.globals = {
        currentUser: {
          username: username,
          authdata: authdata
        }
      };

      $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata;
      $cookies.put('globals', $rootScope.globals);
    }

  }
})();