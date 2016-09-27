(function() {
  'use strict';

  angular
    .module('app.layout')
    .controller('ShellController', ShellController);

  ShellController.$inject = ['$rootScope', '$timeout', 'config', 'logger', '$state'];
  /* @ngInject */
  function ShellController($rootScope, $timeout, config, logger, $state) {
    var vm = this;
    vm.busyMessage = 'Please wait ...';
    $rootScope.isBusy = false;

    // vm.isBusy = true;
    // $rootScope.showSplash = true;

    vm.isAdminState = function() {
      var state =  $state.is('admin');
      return state;
    };
    
    activate();

    function activate() {
      // logger.success(config.appTitle + ' loaded!', null);
      // hideSplash();
    }

    function hideSplash() {
      //Force a 1 second delay so we can see the splash.
      $timeout(function() {
        $rootScope.showSplash = false;
      }, 1000);
    }
  }
})();
