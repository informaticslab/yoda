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

    vm.login = function() {
      authservice.login({
        username: vm.username.toLowerCase(),
        password: vm.password.toLowerCase()
      },
      function(res){
        $state.go('home');
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
