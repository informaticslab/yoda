(function() {
  'use strict';

  angular
    .module('app.layout')
    .controller('ShellController', ShellController);

  ShellController.$inject = ['$rootScope', '$timeout', 'config', 'logger', '$cookies', 'authservice'];
  /* @ngInject */
  function ShellController($rootScope, $timeout, config, logger, $cookies, authservice) {

    var vm = this;
    $rootScope.isLoggedIn;
    vm.busyMessage = 'Please wait ...';
   
    $rootScope.isBusy = false;

    // vm.isBusy = true;
// <<<<<<< HEAD
//     $rootScope.showSplash = true;
// =======
//     // $rootScope.showSplash = true;

//     vm.isAdminState = function() {
//       var state =  $state.is('admin');
//       return state;
//     };
// >>>>>>> development
    
    activate();

    function activate() {
      // logger.success(config.appTitle + ' loaded!', null);
      // hideSplash();
      // console.log($cookies.globals);
    }

    function hideSplash() {
      //Force a 1 second delay so we can see the splash.
      $timeout(function() {
        $rootScope.showSplash = false;
      }, 1000);
    }
  }
})();
