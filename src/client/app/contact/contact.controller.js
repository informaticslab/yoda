(function() {
  'use strict';

  angular
    .module('app.contact')
    .controller('ContactController', ContactController);

  ContactController.$inject = ['logger'];

  function ContactController(logger) {
    var vm = this;
    vm.title = 'Contact';

    activate();

    function activate() {
      //placeholder
    }
  }
})();