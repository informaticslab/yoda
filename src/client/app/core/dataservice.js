(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('dataservice', dataservice);

    dataservice.$inject = ['$http', '$q', 'exception', 'logger'];
    /* @ngInject */
    function dataservice($http, $q, exception, logger) {
        var service = {
            doSearch: doSearch,
            autocomplete: autocomplete,
            findById: findById,
            getStats: getStats
        };

        return service;

        function autocomplete(query) {
            return $http.get('/api/autocomplete/' + query)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR failed for autocomplete')(e);
            }
        }


        function doSearch(params) {
            var url = '/api/smartSearch/' + params.searchString + '/' + params.page;
            // console.log(params);
            if (params.sort) {
                url = url + '/' + params.sort;
            }
            if (params.filter) {
                url = url + '/' + params.filter;
            }
            // console.log('in do search: ',query, page);
            return $http.get(url)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR failed for doSearch')(e);
            }
        }


        function findById(id) {
            return $http.get('/api/findById/' + id)
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR failed for findById')(e);
            }
        }

        function getStats() {
            return $http.get('/api/getStats')
                .then(success)
                .catch(fail);

            function success(response) {
                return response.data;
            }

            function fail(e) {
                return exception.catcher('XHR failed for getStats')(e);
            }
        }

    }

})();
