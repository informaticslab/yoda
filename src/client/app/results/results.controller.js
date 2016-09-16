(function() {
  'use strict';

  angular
    .module('app.results')
    .controller('ResultsController', ResultsController);

  ResultsController.$inject = ['logger', '$scope', '$state', '$stateParams', 'dataservice', '$q', '$location', '$anchorScroll'];
  /* @ngInject */
  function ResultsController(logger, $scope, $state, $stateParams, dataservice, $q, $location, $anchorScroll) {
    var vm = this;
    vm.title = 'Results';
    vm.searchString = $stateParams.searchString;
    vm.resultsArray = [];
    vm.suggestionArray = [];
    vm.featuredArray =[];
    vm.currentPage = 1;
    vm.pageSize = 5;
    vm.noResults = false;
    vm.reverse = true;
    vm.personPhrase = 'person likes this';
    vm.peoplePhrase = 'people like this';
    vm.sortKey='-_score';
    vm.secondarySort = '-_score';
    vm.sortOptions =[
      {
        'option' : 'dateModified',
        "label" : 'Most Recent',
        'notAvailable' : false
      },
      {
      'option' : 'featuredRanking',
      "label" : 'Featured',
        'notAvailable' : false
      },
      {
        'option' : 'default',
        'label' : 'Relevant',
        'notAvailable' : false
      }
     ];

    vm.sortOption = vm.sortOptions[2];

    vm.toTop = function(id) {
      var old = $location.hash();
      $location.hash(id);
      $anchorScroll();
      $location.hash(old);
    };

    vm.goToResults = function($item) {
      $state.go('details', {id: $item.id});
    };

    vm.sort = function(keyname){
      if (keyname == 'default') {
        vm.sortKey = '-_score';
        vm.reverse = true;
      }
      else {
        vm.sortKey = '-_source.' + keyname;   //set the sortKey to the param passed
        vm.reverse = true;
      }
 //       console.log(vm.resultsArray);
    };

    vm.filter = function(filterKey) {
        //console.log(filterKey);
            vm.disableFilter = filterKey ==='all'
    }

    activate();

    function activate() {
      var promises = [search(vm.searchString)];
      return $q.all(promises).then(function(){
        // logger.info('Activated Results View');
      });
    }

    function search(searchString) {
      return dataservice.doSearch(searchString).then(function(data){
        vm.suggestionArray = data.suggestions;
        vm.resultsArray = data.hits;
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
      });
    }

  }
})();
