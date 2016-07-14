(function() {
  'use strict';

  angular
    .module('app.core')
    .factory('dataservice', dataservice);

  dataservice.$inject = ['$http', '$q', 'exception', 'logger'];
  /* @ngInject */
  function dataservice($http, $q, exception, logger) {
    var service = {
      doSearch: doSearch,
      getQuestions: getQuestions,
      getMessageCount: getMessageCount
    };

    return service;

    function getMessageCount() { return $q.when(72); }

    function doSearch(query) {
      return $http.get('/api/search/' + query)
      .then(success)
      .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('XHR failed for doSearch')(e);
      }
    }

    function getQuestions(query) {
      return $http.get('/api/questions/' + query)
      .then(success)
      .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('XHR failed for getQuestions')(e);
      }
    }

  }
})();
