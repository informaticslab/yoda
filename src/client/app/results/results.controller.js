(function () {
    'use strict';

    angular
        .module('app.results')
        .controller('ResultsController', ResultsController);

    ResultsController.$inject = ['logger', '$scope', '$state', '$stateParams', 'dataservice', '$q', '$location', '$anchorScroll', '$rootScope'];
    /* @ngInject */
    function ResultsController(logger, $scope, $state, $stateParams, dataservice, $q, $location, $anchorScroll, $rootScope) {
        // console.log($stateParams);
        var vm = this;
        vm.title = 'Results';
        vm.searchString = $stateParams.searchString;
        vm.currentPage = $stateParams.page || 1;
        vm.totalResults;
        vm.resultsArray = null;
        vm.suggestionArray = [];
        vm.featuredArray = [];
        vm.pageSize = 10;
        vm.noResults = false;
        vm.reverse = true;
        vm.maxSize = 7;
        vm.personPhrase = 'person likes this';
        vm.peoplePhrase = 'people like this';
        vm.sortKey = '-_score';
        vm.secondarySort = '-_score';
        vm.options = {};
        vm.range = {};
        vm.sort = $stateParams.sort || 'relevance';
        vm.filterOption = $stateParams.filter || 'all';



        vm.sortOptions = [
            {
                'option': 'title',
                "label": 'Title',
                'notAvailable': false
            },
            {
                'option': 'relevance',
                'label': 'Relevance',
                'notAvailable': false
            }
        ];

        if ($stateParams.sort == 'title') {
            vm.sortOption = vm.sortOptions[0];
        } else {
            vm.sortOption = vm.sortOptions[1];
        }

        vm.pageChanged = function (newPageNumber) {
            vm.options.searchString = vm.searchString;
            vm.options.page = newPageNumber;
            $state.go('.', vm.options);
        };

        vm.toTop = function (id) {
            var old = $location.hash();
            $location.hash(id);
            $anchorScroll();
            $location.hash(old);
        };

        // vm.goToDetails = function(id) {
        //     $state.go('results.details', { id: id });
        // };

        vm.sort = function (keyname) {
            vm.options.searchString = vm.searchString;
            vm.options.page = null;
            if (keyname === 'title') {
                vm.options.sort = 'title';
                $state.go('.', vm.options);
            } else {
                vm.options.sort = 'relevance';
                $state.go('.', vm.options);
            }
        }

        vm.filter = function (filterKey) {
            vm.options.searchString = vm.searchString;
            vm.options.page = null;
            vm.options.sort = 'relevance';
            // console.log(filterKey);
            vm.options.filter = filterKey.key;
            $state.go('.', vm.options);
            // if (filterKey === 'public') {
            //     vm.options.filter = 'public';
            //     $state.go('.', vm.options);
            // } else if (filterKey === 'professional') {
            //     vm.options.filter = 'professional';
            //     $state.go('.', vm.options);
            // } else {
            //     vm.options.filter = 'all';
            //     $state.go('.', vm.options);
            // }
        }

        vm.removeFilter = function () {
            vm.options.searchString = vm.searchString;
            vm.options.page = null;
            vm.options.sort = 'relevance';
            vm.options.filter = 'all';
            $state.go('.', vm.options);
        }

        activate();

        function activate() {
            $rootScope.isBusy = true;

            // var promises = [search($stateParams.searchString, $stateParams.page)];
            var promises = [search()];
            if (vm.filterOption !== 'all') {
                vm.isFilterSelected = true;
            } else {
                vm.isFilterSelected = false;
            }
            // var promises = [search(vm.searchString, vm.currentPage)];
            return $q.all(promises).then(function () {
                $rootScope.isBusy = false;
            });
        }

        function search() {
            // console.log('searchString ', searchString);
            // console.log('page ', page);
            // console.log('state params ', $stateParams);
            return dataservice.doSearch($stateParams)
                .then(function (data) {
                    vm.currentPage = $stateParams.page;
                    vm.suggestionArray = data.suggestions;
                    vm.resultsArray = data.hits;
                    vm.totalResults = data.total;
                    vm.aggregations = data.aggregations.categories.buckets;
                    // console.log(vm.resultsArray);
                    // console.log(data.aggregations);
                    // var featuredAgg = aggregations.featured_PRs;
                    // if(featuredAgg.buckets.length !== 1){
                    //   containsFeatured = true;
                    // }

                    // vm.sortOptions[1].notAvailable = !containsFeatured;

                    if (vm.resultsArray.length === 0) {
                        vm.noResults = true;
                    }
                    updateRangeValues();
                });
        }

        function updateRangeValues() {
            vm.range.lower = (vm.currentPage - 1) * vm.pageSize + 1;
            vm.range.upper = Math.min(vm.currentPage * vm.pageSize, vm.totalResults);
        }

    }
})();
