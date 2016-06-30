(function() {
  'use strict';

  angular
    .module('app.home')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$q', 'dataservice', 'logger','$scope'];
  /* @ngInject */
  function HomeController($q, dataservice, logger, $scope) {
    var vm = this;
    vm.news = {
      title: 'yoda',
      description: 'CDC-INFO responsive webapp'
    };
    vm.messageCount = 0;
    vm.people = [];
    vm.title = 'Home';

    activate();

    $scope.selected = undefined;
    $scope.testPR = [
      'Is there any danger from receiving extra doses of a vaccine?', 'How is HIV transmitted?',
      'What is the role of CDC-INFO?', 'Does CDC have any job openings, or training or fellowship opportunities?',
      'Where can I go for a free or low-cost mammogram or Pap test?', 'How is genital herpes transmitted?',
      'Can CDC provide information on product safety and testing?', 'What are the signs and symptoms of HIV?',
      'Who should get Zostavax (shingles vaccine)?', 'Can the varicella-zoster virus from the shingles (herpes zoster) vaccine (Zostavax) be spread to at-risk family members and other close contacts of people who have been recently vaccinated?',
      'Who should get the Tdap vaccine?', 'What are the signs and symptoms of genital herpes?'
    ];

    function activate() {
      var promises = [getMessageCount(), getPeople()];
      return $q.all(promises).then(function() {
        logger.info('Activated Dashboard View');
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
