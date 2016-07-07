(function() {
  'use strict';

  angular
    .module('app.home')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$q', 'dataservice', 'logger','$scope', 'esclientservice', 'esFactory'];
  /* @ngInject */
  function HomeController($q, dataservice, logger, $scope, esclientservice, esFactory) {
    var vm = this;
    vm.news = {
      title: 'yoda',
      description: 'CDC-INFO responsive webapp'
    };
    vm.messageCount = 0;
    vm.people = [];
    vm.title = 'Home';

    activate();

    var index = 'prepared_responses';

    $scope.selected = undefined;
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.search = function() {  //TODO: Refine this
      var results;
      $scope.resultsArr;
      esclientservice.search({
        index: index,
        body: {
          query: {
            match: {
              query: $scope.selected
            }
          },
          size: 1000,
          explain: false     //set to 'true' for testing only
        }
      })
      .then(function(results) {
        $scope.resultsArr = results.hits.hits;
        $scope.error = null;
        console.log(results);
      })
      .catch(function(err) {
        $scope.resultsArr = null;
        $scope.error.err;
      });
    };

    $scope.getQuery = function(val) {  //TODO: Refine this
      return esclientservice.search({
        index: index,
        body: {
          query: { "match": { query: val} }
        }
      })
      .then(function(response) {
        return response.hits.hits.map(function(item) {
          return item._source.query;
        });
      });
      // return esclientservice.seach({
      //   index: 'prepared_responses'
      // })
      // .then(function(response) {
      //   console.log(response);
      // });
    }

    ///////

    function activate() {
      var promises = [getMessageCount(), getPeople()];
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

    function getPeople() {
      return dataservice.getPeople().then(function(data) {
        vm.people = data;
        return vm.people;
      });
    }
  }
})();
