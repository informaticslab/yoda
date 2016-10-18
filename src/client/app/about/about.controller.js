(function() {
  'use strict';

  angular
    .module('app.about') 
    .controller('AboutController', AboutController);

  AboutController.$inject = ['logger'];

  function AboutController(logger) {
    var vm = this;
    vm.title = 'About';

    activate();

    function activate() {
      //Placeholder if needed
    }
  }
})();