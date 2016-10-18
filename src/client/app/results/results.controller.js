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
    vm.sort = $stateParams.sort || 'relavance';

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
        'option' : 'default',
        'label' : 'Relevant',
        'notAvailable' : false
      }
     ];
     
    if($stateParams.sort == 'recent') {
      vm.sortOption = vm.sortOptions[0];
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

    // vm.sort = function(keyname){
    //   // console.log('keyname', keyname);
    //   if (keyname == 'default') {
    //     vm.sortKey = '-_score';
    //     vm.reverse = true;
    //   }
    //   else {
    //     vm.sortKey = '-_source.' + keyname;   //set the sortKey to the param passed
    //     vm.reverse = true;
    //   }
    // };

    vm.sort = function(keyname) {
      if (keyname === 'recent'){
        vm.options.searchString = vm.searchString;
        vm.options.page = vm.currentPage;
        vm.options.sort = 'recent';
        $state.go('.', vm.options);
      } else if (keyname === 'default'){
        vm.options.searchString = vm.searchString;
        vm.options.page = vm.currentPage;
        vm.options.sort = null;
        $state.go('.', vm.options);
      }
    }

    vm.filter = function(filterKey) {
            vm.disableFilter = filterKey ==='all'
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
      return dataservice.doSearch($stateParams)
        .then(function(data){
          vm.currentPage = $stateParams.page;
          vm.suggestionArray = data.suggestions;
          vm.resultsArray = data.hits;
          vm.totalResults = data.total;
          vm.resultsArray.forEach(function(result) {
            if (result._source.featuredRanking > 0) {
              vm.featuredArray.push(result);
            }
          });
      //    console.log(vm.featuredArray);
            vm.sortOptions[1].notAvailable = (vm.featuredArray.length ===0);
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
