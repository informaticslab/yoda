(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('authservice', authservice);

  authservice.$inject = ['$http', '$cookieStore', '$rootScope'];
  /* @ngInject */
  function authservice($http, $cookieStore, $rootScope) {

    var accessLevels = accessConfig.accessLevels,
        userRoles = accessConfig.userRoles,
        currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };
    
    $cookieStore.remove('user');

    function changeUser(user) {
      angular.extend(currentUser, user);
    }
    
    var service = {
      accessLevels: accessLevels,
      userRoles: userRoles,
      user: currentUser,
      authorize: authorize,
      isLoggedIn: isLoggedIn,
      login: login,
      logout: logout
    };

    return service;

    /////////////

    function authorize(accessLevel, role) {
      if(role === undefined) {
        role = currentUser.role;
      }
      return accessLevel.bitMask & role.bitMask;
    }

    function isLoggedIn(user) {
      if(user ===  undefined) {
        user = currentUser;
      }
      return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
    }

    function login(user, success, error) {
      $http.post('/api/login', user).success(function(user) {
      
        changeUser(user);

        success();
      }).error(error);
    }

    function logout(success, error) {
      $http.post('/api/logout').success(function() {
        changeUser({
          username: '',
          role: userRoles.public
        });
        success();
      }).error(error);
    }

  }
})();