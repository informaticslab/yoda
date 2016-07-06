(function() {
  'use strict';

  angular
    .module('app.core')
    .service('esclientservice', function(esFactory) {
      return esFactory({
        host: 'localhost:9200',
        apiVersion: '2.3',
        log: 'trace'
      });
    });
})();
