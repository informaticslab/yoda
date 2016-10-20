(function() {
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
    vm.resultsArray = [];
    vm.suggestionArray = [];
    vm.featuredArray =[];
    vm.pageSize = 10;
    vm.noResults = false;
    vm.reverse = true;
    vm.maxSize = 7;
    vm.personPhrase = 'person likes this';
    vm.peoplePhrase = 'people like this';
    vm.sortKey='-_score';
    vm.secondarySort = '-_score';
    vm.options = {};
    vm.range = {};
    vm.sort = $stateParams.sort || 'relevance';
    vm.filterOption = $stateParams.filter || 'all';

    vm.sortOptions =[
      {
        'option' : 'recent',
        "label" : 'Most Recent',
        'notAvailable' : false
      },
      {
      'option' : 'featured',
      "label" : 'Featured',
        'notAvailable' : false
      },
      {
        'option' : 'relevance',
        'label' : 'Relevance',
        'notAvailable' : false
      }
     ];
     
    if($stateParams.sort == 'recent') {
      vm.sortOption = vm.sortOptions[0];
    } else if ($stateParams.sort == 'featured') {
      vm.sortOption = vm.sortOptions[1];
    } else {
      vm.sortOption = vm.sortOptions[2];
    }

    vm.pageChanged = function(newPageNumber) {
      vm.options.searchString = vm.searchString;
      vm.options.page = newPageNumber;
      $state.go('.', vm.options);
    };

    vm.toTop = function(id) {
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      $location.hash(old);
    };

    vm.goToDetails = function($item) {
      $state.go('details', {id: $item.id});
    };

    vm.sort = function(keyname) {
      vm.options.searchString = vm.searchString;
      vm.options.page = null;
      if (keyname === 'recent'){
        vm.options.sort = 'recent';
        $state.go('.', vm.options);
      } else if (keyname === 'featured') {
        vm.options.sort = 'featured';
        $state.go('.', vm.options);
      } else {
        vm.options.sort = 'relevance';
        $state.go('.', vm.options);
      } 
    }

    vm.filter = function(filterKey) {
      vm.options.searchString = vm.searchString;
      vm.options.page = null;
      vm.options.sort = 'relevance';
      if (filterKey === 'public') {
        vm.options.filter = 'public';
        $state.go('.', vm.options);
      } else if (filterKey ==='professional') {
        vm.options.filter = 'professional';
        $state.go('.', vm.options);
      } else {
        vm.options.filter = 'all';
        $state.go('.', vm.options);
      }
    }

    activate();

    function activate() {
      $rootScope.isBusy = true;
    
      // var promises = [search($stateParams.searchString, $stateParams.page)];
      var promises = [search()];
      // var promises = [search(vm.searchString, vm.currentPage)];
      return $q.all(promises).then(function(){
        // logger.info('Activated Results View');
        $rootScope.isBusy = false;
      });
    }

    function search() {
      // console.log('searchString ', searchString);
      // console.log('page ', page);
      var containsFeatured = false;
      return dataservice.doSearch($stateParams)
        .then(function(data){
          vm.currentPage = $stateParams.page;
          vm.suggestionArray = data.suggestions;
          vm.resultsArray = data.hits;
          vm.totalResults = data.total;
          var aggregations = data.aggregations

          var featuredAgg = aggregations.featured_PRs;
          if(featuredAgg.buckets.length !== 1){
            containsFeatured = true;
          }
        
          vm.sortOptions[1].notAvailable = !containsFeatured;
          if (vm.resultsArray.length === 0){
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
