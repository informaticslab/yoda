// var should = require('should');
var chai = require('chai');
var chaiHTTP = require('chai-http');
var request = require('supertest');
var elastic = ('../controllers/elastic');
var should = chai.should();

var baseUrl = 'http://localhost:3000/';

chai.use(chaiHTTP);

describe('Routing', function() {
  describe('Auth', function() {

  });

  describe('Elastic Search', function() {

    describe("Get PR by ID", function() {
      var expectedPR = {
        id: 101096,
        title:'Where can I get clinical information about Ebola hemorrhagic fever (Ebola HF)?',
        relatedPR: true,
        numberOfRelatedPR: 3
      };

      it("should return the correct PR for the provided ID", function(done) {
        request(baseUrl)
          .get('/api/getPreparedResponsebyId/'+ expectedPR.id)
          .end(function(err, res) {
            if(err) {
              throw err;
            }

            var result = res.body._source;
            res.should.have.status(200);
            result.should.have.property('id').eql(expectedPR.id);
            result.should.have.property('prId');
            result.should.have.property('dateModified');
            result.should.have.property('resources');
            result.should.have.property('tier');
            result.should.have.property('featuredRanking');
            result.should.have.property('commonQuestionRanking');
            result.should.have.property('datePublished');
            result.should.have.property('topic');
            result.should.have.property('subtopic');
            result.should.have.property('keywords');
            result.should.have.property('language');
            result.should.have.property('category');
            result.should.have.property('title').eql(expectedPR.title);
            result.should.have.property('description');
            result.title.should.be.equal(expectedPR.title);
            done();
          });
      });

      it("should return related PR object", function(done) {
        request(baseUrl)
          .get('/api/getPreparedResponsebyId/'+ expectedPR.id)
          .end(function(err, res) {
            var relatedObj = res.body.relatedPR;
            res.should.have.status(200);
            should.exist(relatedObj);
            done();
          });
      });

      it("should return the correct number of related PRs for the object", function(done){
        request(baseUrl)
          .get('/api/getPreparedResponsebyId/'+ expectedPR.id)
          .end(function(err, res) {
            var relatedObj = res.body.relatedPR;
            res.should.have.status(200);
            relatedObj.length.should.be.equal(expectedPR.numberOfRelatedPR);
            done();
          });
      });
    });

    describe("Full Search", function() {

      var singleSearch = new SearchObj('ebola', 'relevance', 'all', {length:17, suggestionsLength: 1, firstHit: 'How is Ebola hemorrhagic fever (Ebola HF) diagnosed?', id: 101076});

      it("should return expected results from a simple single word search", function(done) {
        request(baseUrl)
          .get('/api/search/'+singleSearch.query+'/1/'+singleSearch.sort+'/' + singleSearch.filter)
          .end(function(err, res) {
            var firstHit = res.body.hits[0]._source;

            res.should.have.status(200);
            res.body.total.should.be.eql(singleSearch.expected.length);
            res.body.suggestions.length.should.be.eql(singleSearch.expected.suggestionsLength);
            firstHit.should.have.property('id').eql(singleSearch.expected.id);
            firstHit.should.have.property('prId');
            firstHit.should.have.property('dateModified');
            firstHit.should.have.property('resources');
            firstHit.should.have.property('tier');
            firstHit.should.have.property('featuredRanking');
            firstHit.should.have.property('commonQuestionRanking');
            firstHit.should.have.property('datePublished');
            firstHit.should.have.property('topic');
            firstHit.should.have.property('subtopic');
            firstHit.should.have.property('keywords');
            firstHit.should.have.property('language');
            firstHit.should.have.property('category');
            firstHit.should.have.property('title').eql(singleSearch.expected.firstHit);
            firstHit.should.have.property('description');
            done();
          });
      });

      var simplePhraseSearch = new SearchObj('what is hiv', 'relevance', 'all', {length: 290, suggestionsLength: 1, firstHit: 'What is HIV?', id: 93372});

      it("should return expected results from a simple phrase search", function(done) {
        request(baseUrl)
          .get('/api/search/'+simplePhraseSearch.query+'/1/'+simplePhraseSearch.sort+'/'+simplePhraseSearch.filter)
          .end(function(err, res) {
            var firstHit = res.body.hits[0]._source;

            res.should.have.status(200);
            res.body.total.should.be.eql(290);
            res.body.suggestions.length.should.be.eql(1);
            firstHit.should.have.property('id').eql(simplePhraseSearch.expected.id);
            firstHit.should.have.property('prId');
            firstHit.should.have.property('dateModified');
            firstHit.should.have.property('resources');
            firstHit.should.have.property('tier');
            firstHit.should.have.property('featuredRanking');
            firstHit.should.have.property('commonQuestionRanking');
            firstHit.should.have.property('datePublished');
            firstHit.should.have.property('topic');
            firstHit.should.have.property('subtopic');
            firstHit.should.have.property('keywords');
            firstHit.should.have.property('language');
            firstHit.should.have.property('category');
            firstHit.should.have.property('title').eql(simplePhraseSearch.expected.firstHit);
            firstHit.should.have.property('description');
            done();
          });
      });

      var partialPhraseSearch = new SearchObj('how is mer', 'relevance', 'all', {length: 32, firstHit: 'What are the signs and symptoms of MERS?', id: 107871});

      it("should return expected results from a partial phrase search", function(done) {
        request(baseUrl)
          .get('/api/search/' + partialPhraseSearch.query + '/1/' + partialPhraseSearch.sort + '/' + partialPhraseSearch.filter)
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      });

      it("should return a suggestion for misspelled single word search");

      var featuredSearch = new SearchObj('sars', 'relevance', 'all', {});
      it("should return a 'constainsFeatured' flag in response if the result set contains a featured PR", function(done) {
        request(baseUrl)
          .get('/api/search/' + featuredSearch.query + '/1/' + featuredSearch.sort + '/' + featuredSearch.filter)
          .end(function(err, res) {
            var hasFeatured = res.body.aggregations.featured_PRs.buckets; 
            res.should.have.status(200);
            hasFeatured.length.should.be.eql(2);
            done();
          });
      });

      describe("Filtering & Sorting", function() {
        it("should return expected results when passing 'public' parameter with search term");
        it("should return expected results when passing 'professiona' parameter with search term");
      });

      describe("sorting", function() {

      });
      
      describe("special cases", function() {

      })
    });

    describe("Get questions for typeahead", function() {
      it("should return correct set of questions for provided search term");
      it("should return suggestions if you type a single character");
      it("should return suggestions for a phrase");
    });

    describe("Update positive rating", function() {

    });

    describe("Update negative rating", function() {

    });

    describe("Featured", function() {
      var max = 5;

      it("should return correct number of results based on 'max' variable", function(done) {
        request(baseUrl)
          .get('/api/getFeatured/' + max)
          .end(function(err, res) {
            var result = res.body.hits.hits;
            result.length.should.be.equal(max);
            done();
          });
      });
      it("should return expected 'featured' based on expected object");
    });

    describe("Common Questions",function() {
      var max = 5;

      it("should return correct number of results based on 'max' variable", function(done) {
        request(baseUrl)
          .get('/api/getCommon/' + max)
          .end(function(err, res) {
            var result = res.body.hits.hits;
            res.should.have.status(200);
            result.should.be.a('array');
            result.length.should.be.equal(max);
            done();
          });
      });
      it("should return expected 'common questions' based on expected object");

    });

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
            res.should.have.status(200);
            result.should.be.a('array');
            result.length.should.be.equal(max);
            done();
          });
      });

      it("returns expected most recent results");

    });
    
  });


  describe("Users", function() {
    // it("should return -1 when the value is not present");
  });
});

function SearchObj(query, sort, filter, expected) {
  this.query = query;
  this.sort = sort;
  this.filter = filter;
  this.expected = expected;
}