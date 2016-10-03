(function() {
  'use strict';

  angular
    .module('blocks.user')
    .factory('user', user);

  user.$inject = ['$window', '$http', '$rootScope', '$resource', '$cookieStore'];
  /* @ngInject */
  function user($window, $http, $rootScope, $resource, $cookieStore) {
    var service = {
      getIdentity: getIdentity,
      getUser: getUser,
      getAll: getAll
    };
    
    return service;

    ///////////////////////


    // function getIdentity() {
    //   var currentUser;
    //   if(!!$window.bootstrappedUserObject) {
    //     currentUser = getUser();
    //     angular.extend(currentUser, $window.bootstrappedUserObject);
    //   }
    //   return {
    //     currentUser: currentUser,
    //     isAuthenticated: function() {
    //       return !!this.currentUser;
    //     }
    //   }
    // }

    function getUser() {
      // var UserResource = $resource('/api/getUsers');

      var UserResource = $resource('/api/getUsers', {
        update: {method:'PUT',isArray:false}
      });
      UserResource = UserResource[0];
      return UserResource;
    }

    function getAll(success, error) {
      $http.get('/api/getUsers').success(success).error(error);
    }



  }

})();