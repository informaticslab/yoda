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
    vm.logDetails;
    vm.title = 'Admin';
    vm.pageSize = 25;
    vm.currentPage = 1;

    vm.sortType = '_source.date';
    vm.reverse = true;
    vm.sortReverse = false;
    vm.searchLog = '';

    // vm.sortBy = function(sortType) {
    //   vm.sortReverse = (sortType !== null && vm.sortType === sortType) ? !vm.sortReverse : true;
    //   vm.sortType = sortType;
      
    // }



    activate();

    function activate() {
      var promises = [getAllLogs()];
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

    vm.getLogDetails = function(selected){
      console.log('click');
      return dataservice.getLogDetails(selected).then(function(data) {
        console.log(data);
        var hits = data.hits;
        console.log(hits);
        vm.logDetails = hits.hits;  
      });
    }

  }
})();
