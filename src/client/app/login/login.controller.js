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
      vm.dataLoading = true;
      authservice.login(vm.username, vm. password, function(res) {
        console.log(res);
        if(res.success) {
          authservice.setCredentials(vm.username, vm.password);
          $state.go('home');
        } else {
          vm.error = res.message;
          vm.dataLoading = false;
        }
      })
    }

    activate();

    function activate() {
      // logger.info('Activated Login View');
    }
  }
})();
