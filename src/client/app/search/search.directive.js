(function() {
    'use strict';

    angular
        .module('app.layout')
        .directive('search', search);

    /* @ngInject */
    function search() {
        var directive = {
            bindToController: true,
            controller: SearchController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {
                'navline': '='
            },
            templateUrl: 'app/search/search.html'
        };

        SearchController.$inject = ['$scope', 'dataservice', '$state'];

        /* @ngInject */
        function SearchController($scope, dataservice, $state) {
            var vm = this;
            vm.selected = undefined;
            vm.isDisabled = false;

            vm.goToDetails = function($item, $model, $label) {
                // console.log($item);
                $state.go('details', { id: $item.id });
                vm.selected = undefined;
            };

            vm.goToResults = function($item) {
                var options = {
                    searchString: $item,
                    page: '1'
                };
                // console.log('item: ',$item);
                if (!($item === undefined)) {
                    $state.go('results', options);
                    vm.selected = undefined;
                }
            }

            vm.getMatches = function(queryString) {
                return dataservice.autocomplete(queryString).then(function(data) {
                    return data.map(function(item) {
                        return item._source;
                    });
                });
            }

            // vm.getQuery = function (val) {
            //   return dataservice.getQuestions(val).then(function (data) {
            //     return data.map(function (item) {
            //       return item._source;
            //     });
            //   });
            // };

            vm.checkKey = function($event, $item) {

                var options = {
                    searchString: $item,
                    page: '1',
                    newSearch: true,
                    sort: 'relevance',
                    filter: 'all'
                };

                if ($event.which === 13) {  // enter key press, do search
                    $state.go('results', options);
                    vm.selected = undefined;
                }
            };

            $scope.isCollapsed = true;
        }

        return directive;
    }
})();
