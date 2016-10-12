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
      getPreparedResponsebyId: getPreparedResponsebyId,
      getMessageCount: getMessageCount,
      ratePreparedResponse: ratePreparedResponse,

      getIndices: getIndices,
      getLogDetails: getLogDetails,

      getFeatured : getFeatured,
      getCommon : getCommon,
      getMostRecent : getMostRecent

    };

    return service;

    function getMessageCount() { return $q.when(72); }

    function doSearch(query, page) {

      // console.log('in do search: ',query, page);
      return $http.get('/api/search/' + query +'/' +page)
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

    function getPreparedResponsebyId(id) {
      return $http.get('/api/getPreparedResponsebyId/' + id)
      .then(success)
      .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('XHR failed for getPreparedResponsebyId')(e);
      }
    }

    function ratePreparedResponse(type, id) {
      if(type === 'like') {
        return $http.post('/api/updatePositiveRating/' + id)
        .then(success)
        .catch(fail);
      } else {
        return $http.post('/api/updateNegativeRating/' + id)
        .then(success)
        .catch(fail);
      }

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('XHR failed for ratePreparedResponse')(e);
      }
    }


    function getIndices() {
      return $http.get('/logs/getIndices')
        .then(success)
        .catch(fail);

      function success (response) {
        return response.data;
      }

       function fail(e) {
        return exception.catcher('XHR failed for getIndices')(e);
  
      }

    }

    function getFeatured(maxCount) {
      return $http.get('/api/getFeatured/'+ maxCount)
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }
      function fail(e) {
        return exception.catcher('XHR failed for getFeatured')(e);
      }
    }



  function getLogDetails(index) {
    return $http.get('/logs/getLogs/' + index)
      .then(success)
      .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('XHR failed for getLogs')(e);
      }
    }
    function getCommon(maxCount) {
      return $http.get('/api/getCommon/'+ maxCount)
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('XHR failed for getCommon')(e);
      }
    }
    function getMostRecent(maxCount) {
      return $http.get('/api/getMostRecent/'+ maxCount)
        .then(success)
        .catch(fail);

      function success(response) {
        return response;
      }

      function fail(e) {
        return exception.catcher('XHR failed for getMostRecent')(e);
      }
    }

  }

})();
