(function() {
  'use strict';

  angular
    .module('app.topics')
    .controller('TopicsController', TopicsController);

  TopicsController.$inject = ['logger'];
  /* @ngInject */
  function TopicsController(logger) {
    var vm = this;
    vm.title = 'Topics';

    activate();

    function activate() {
      logger.info('Activated Topics View');
    }
  }
})();
