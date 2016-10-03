(function() {
  'use strict';

  angular
    .module('app.login')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$rootScope', '$location', 'authservice', '$state'];
  /* @ngInject */
  function LoginController($rootScope, $location, authservice, $state) {
    var vm = this;
    vm.title = 'Login';

    // vm.login = function(username, password){
    //   // console.log(username);
    //   // console.log(password);
    //   authservice.authenticateUser(username, password).then(function(success) {
    //     // console.log(success);
    //     console.log(success);
    //     if(success) {
    //       $state.go('home');
    //       // $scope.ok();
    //     } else {
    //       alert('Incorrect username/password');
    //     }
    //   });
    // };

    vm.login = function() {
      authservice.login({
        username: vm.username,
        password: vm.password
      },
      function(res){
        $state.go('home');
        $rootScope.isLoggedIn = authservice.isLoggedIn();
      },
      function(err) {
        $rootScope.error = err;
      });
    }

  

    activate();

    function activate() {
      // logger.info('Activated Login View');
    }
  }
})();
