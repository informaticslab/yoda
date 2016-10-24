var should = require('should');
var request = require('supertest');
var elastic = ('../controllers/elastic');

var baseUrl = 'http://localhost:3000/';

describe('Routing', function() {
  describe('Auth', function() {

  });
  describe('Elastic Search', function() {

    describe('Most Recent', function() {
      var max = 5;

      it("should return correct number of results based on 'max' variable", function(done) {
        request(baseUrl)
          .get('/api/getMostRecent/'+max)
          .end(function(err, res){
            if (err) {
              throw err;
            }
            var result = res.body.hits.hits;
            result.length.should.be.equal(5);
            done();
          });
      });

      it("returns expected most recent results", function(done) {
        done();
      });

    });

    describe("Common Questions",function() {
      var max = 5;

      it("should return correct number of results based on 'max' variable");
      it("should return expected 'common questions' based on expected object");

    });

    describe("Featured", function() {
      it("should return correct number of results based on 'max' variable");
    });

    describe("Full Search", function() {
      it("should return a 'constainsFeatured' parameter in response if the result set contains a featured PR")
    })
  });


  describe("Users", function() {
    it("should return -1 when the value is not present");
  });

});