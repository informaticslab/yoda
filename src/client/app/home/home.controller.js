(function() {
  'use strict';

  angular
    .module('app.home')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$q', 'dataservice', 'logger','$scope'];
  /* @ngInject */
  function HomeController($q, dataservice, logger, $scope) {
    var vm = this;
    vm.news = {
      title: 'yoda',
      description: 'CDC-INFO responsive webapp'
    };
    vm.messageCount = 0;
    vm.title = 'Home';

    activate();

    var index = 'prepared_responses';

    $scope.selected = undefined;
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.placeholderSort = [
                                'Topic',
                                'Type',
                                'Relevance',
                                'Keywords'
                              ];

    $scope.search = function(val) { 
      if(val !== undefined) {
        return dataservice.doSearch(val).then(function(data) {
          $scope.resultsArr = data;
        });
      }
    };

    $scope.getQuery = function(val) {

      return dataservice.getQuestions(val).then(function(data) {
        return data.map(function(item) {
          return item._source.query;
        });
      });
    }

    ///////

    function activate() {
      var promises = [getMessageCount()];
      return $q.all(promises).then(function() {
        logger.info('Activated Home View');
      });
    }

    function getMessageCount() {
      return dataservice.getMessageCount().then(function(data) {
        vm.messageCount = data;
        return vm.messageCount;
      });
    }
  }
})();
