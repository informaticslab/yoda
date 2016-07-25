(function() {
  'use strict';

  angular
    .module('app.details')
    .controller('DetailsController', DetailsController);

  DetailsController.$inject = ['$q', 'logger', '$stateParams','dataservice'];
  /* @ngInject */
  function DetailsController($q, logger, $stateParams, dataservice) {
    var vm = this;
    vm.title = 'Details';
    vm.data = {};
    vm.id = $stateParams.id;

    activate();
    console.log(vm.data);

    function activate() {
      console.log(vm.id);
      var promises = [getPreparedResponse(vm.id)];
      return $q.all(promises).then(function() {
        logger.info('Activated Details View');
      });
    }

    function getPreparedResponse(id) {
      if (id !== null){
        return dataservice.getPreparedResponsebyId(id).then(function(data) {
          vm.data = data;
          vm.data = vm.data._source;
          return vm.data
        });
      }
      
    }

  }
})();
