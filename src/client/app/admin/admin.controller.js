(function() {
  'use strict';

  angular
    .module('app.admin')
    .controller('AdminController', AdminController);

  AdminController.$inject = ['logger', '$scope', 'dataservice', '$q'];
  /* @ngInject */
  function AdminController(logger, $scope, dataservice, $q) {
    var vm = this;
    vm.logs = [];
    vm.logDetails = [];
    vm.title = 'Admin';
    vm.pageSize = 50;
    vm.currentPage = 1;

    vm.sortType = '"@timestamp"';
    vm.sortReverse = true;
    vm.searchLog = '';

    activate();

    function activate() {
      var promises = [getAllLogs(), getLogDetails()];
      return $q.all(promises).then(function(){
      });
    }

    function getAllLogs() {
      return dataservice.getIndices().then(function(data) {
        for(var i=0; i < data.length; i++) {
          if(data[i].includes('logstash')) {
            vm.logs.push(data[i]);
          }
        }
        console.log(vm.logs);
      });
    }

    function getLogDetails() {
      var test = 'logstash-2016.09.12';
      return dataservice.getLogDetails(test).then(function(data) {
        var hits = data.hits;
        console.log(hits);
        vm.logDetails = hits.hits;  
      });
    }

  }
})();
