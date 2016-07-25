(function() {
  'use strict';

  angular
    .module('app.search')
    .controller('SearchController', SearchController);

  SearchController.$inject = ['$state', 'routerHelper'];
  /* @ngInject */
  function SearchController($state, routerHelper) {
    var vm = this;
    var states = routerHelper.getStates();
    vm.isCurrent = isCurrent;

    vm.selected = undefined;

    vm.search = function(val) { 
      if(val !== undefined) {
        return dataservice.doSearch(val).then(function(data) {
          vm.resultsArr = data;
          console.log(vm.resultsArr);
        });
      }
    };

    vm.getQuery = function(val) {
      return dataservice.getQuestions(val).then(function(data) {
        return data.map(function(item) {
          return item._source;
        });
      });
    };

    activate();

    function activate() { getNavRoutes(); }

    function getNavRoutes() {
      vm.navRoutes = states.filter(function(r) {
        return r.settings && r.settings.nav;
      }).sort(function(r1, r2) {
        return r1.settings.nav - r2.settings.nav;
      });
    }

    function isCurrent(route) {
      if (!route.title || !$state.current || !$state.current.title) {
        return '';
      }
      var menuName = route.title;
      return $state.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
    }
  }
})();
