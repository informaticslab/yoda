// var should = require('should');
var chai = require('chai');
var chaiHTTP = require('chai-http');
var request = require('supertest');
var elastic = ('../controllers/elastic');
var should = chai.should();

var baseUrl = 'http://localhost:3000/';

chai.use(chaiHTTP);

describe('Routing', function() {

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

    describe("Search", function() {

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
            var firstHit = res.body.hits[0]._source;

            res.should.have.status(200);
            res.body.total.should.be.eql(partialPhraseSearch.expected.length);
            res.body.suggestions.length.should.be.eql(1);
            firstHit.should.have.property('id').eql(partialPhraseSearch.expected.id);
            firstHit.should.have.property('prId');
            firstHit.should.have.property('dateModified');
            firstHit.should.have.property('resources');
            firstHit.should.have.property('tier');
            firstHit.should.have.property('featuredRanking');
            firstHit.should.have.property('commonQuestionRanking');
            firstHit.should.have.property('datePublished');
            firstHit.should.have.property('keywords');
            firstHit.should.have.property('language');
            firstHit.should.have.property('category');
            firstHit.should.have.property('title').eql(partialPhraseSearch.expected.firstHit);
            firstHit.should.have.property('description');
            done();
          });
      });

      var misspelledSearch = new SearchObj('evola', 'relevance', 'all', {length: 0, suggestion: 'ebola'});

      it("should return a suggestion for misspelled single word search", function(done) {
        request(baseUrl) 
          .get('/api/search/' + misspelledSearch.query + '/1/' + misspelledSearch.sort + '/' +misspelledSearch.filter)
          .end(function(err, res) {
            var suggestion =  res.body.suggestions[0].options[0].text;
            res.should.have.status(200);
            res.body.should.have.property('hits');
            res.body.should.have.property('total').eql(misspelledSearch.expected.length);
            suggestion.should.be.eql(misspelledSearch.expected.suggestion);
            done();
          });
      });

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

        var filterSearchPublic = new SearchObj('ebola', 'relevance', 'public', {length:6, firstHit: 'How is Ebola hemorrhagic fever (Ebola HF) treated?', id: 101078});

        it("should return expected results when passing 'public' parameter with search term", function(done) {
          request(baseUrl)
            .get('/api/search/' + filterSearchPublic.query + '/1/' + filterSearchPublic.sort + '/' + filterSearchPublic.filter)
            .end(function(err, res) {
              var firstHit = res.body.hits[0]._source;
              res.should.have.status(200);
              res.body.total.should.be.eql(filterSearchPublic.expected.length);
              firstHit.should.have.property('id').eql(filterSearchPublic.expected.id);
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
              firstHit.should.have.property('title').eql(filterSearchPublic.expected.firstHit);
              firstHit.should.have.property('description');
              done();
            });
        });

        var filterSearchProfessional = new SearchObj('ebola', 'relevance', 'professional', {length:11, firstHit: 'How is Ebola hemorrhagic fever (Ebola HF) diagnosed?', id: 101076});

        it("should return expected results when passing 'professional' parameter with search term", function(done) {
          request(baseUrl)
            .get('/api/search/' + filterSearchProfessional.query + '/1/' + filterSearchProfessional.sort + '/' + filterSearchProfessional.filter)
            .end(function(err, res) {
              var firstHit = res.body.hits[0]._source;
              res.should.have.status(200);
              res.body.total.should.be.eql(filterSearchProfessional.expected.length);
              firstHit.should.have.property('id').eql(filterSearchProfessional.expected.id);
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
              firstHit.should.have.property('title').eql(filterSearchProfessional.expected.firstHit);
              firstHit.should.have.property('description');
              done();
            });
        });

        var sortSearchRecent = new SearchObj('ebola', 'recent', 'all', {length:17, firstHit: 'What kinds of viruses cause viral hemorrhagic fevers (VHFs)?', id: 101038});

        it("should return expected results in correct order for 'Most Recent' sort", function(done) {
          request(baseUrl)
            .get('/api/search/' + sortSearchRecent.query + '/1/' + sortSearchRecent.sort + '/' + sortSearchRecent.filter)
            .end(function(err, res) {
              var firstHit = res.body.hits[0]._source;
              res.should.have.status(200);
              res.body.total.should.be.eql(sortSearchRecent.expected.length);
              firstHit.should.have.property('id').eql(sortSearchRecent.expected.id);
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
              firstHit.should.have.property('title').eql(sortSearchRecent.expected.firstHit);
              firstHit.should.have.property('description');
              done();
            });
        });

        var sortSearchFeatured = new SearchObj('sars', 'featured', 'all', {length:27, firstHit: 'What are the symptoms of SARS?', id: 1325});

        it("should return expected results in correct order for 'Featured' sort", function(done) {
          request(baseUrl)
            .get('/api/search/' + sortSearchFeatured.query + '/1/' + sortSearchFeatured.sort + '/' + sortSearchFeatured.filter)
            .end(function(err, res) {
              var firstHit = res.body.hits[0]._source;
              res.should.have.status(200);
              res.body.total.should.be.eql(sortSearchFeatured.expected.length);
              firstHit.should.have.property('id').eql(sortSearchFeatured.expected.id);
              firstHit.should.have.property('prId');
              firstHit.should.have.property('dateModified');
              firstHit.should.have.property('resources');
              firstHit.should.have.property('tier');
              firstHit.should.have.property('featuredRanking');
              firstHit.should.have.property('commonQuestionRanking');
              firstHit.should.have.property('datePublished');
              firstHit.should.have.property('topic');
              firstHit.should.have.property('subtopic');
              firstHit.should.have.property('language');
              firstHit.should.have.property('category');
              firstHit.should.have.property('title').eql(sortSearchFeatured.expected.firstHit);
              firstHit.should.have.property('description');
              done();
            });
        });

        var comboSearch =  new SearchObj('hiv', 'recent', 'public', {length: 171, firstHit: 'How soon should I get tested if I think I have been exposed to HIV?', id: 106647});

        it("should return expected results from a 'recent' sort and 'public' filter", function(done){
          request(baseUrl)
            .get('/api/search/' + comboSearch.query + '/1/' + comboSearch.sort + '/' + comboSearch.filter)
            .end(function(err, res) {
              var firstHit = res.body.hits[0]._source;
              res.should.have.status(200);
              res.body.total.should.be.eql(comboSearch.expected.length);
              firstHit.should.have.property('id').eql(comboSearch.expected.id);
              firstHit.should.have.property('prId');
              firstHit.should.have.property('dateModified');
              firstHit.should.have.property('resources');
              firstHit.should.have.property('tier');
              firstHit.should.have.property('featuredRanking');
              firstHit.should.have.property('commonQuestionRanking');
              firstHit.should.have.property('datePublished');
              firstHit.should.have.property('topic');
              firstHit.should.have.property('subtopic');
              firstHit.should.have.property('language');
              firstHit.should.have.property('category');
              firstHit.should.have.property('title').eql(comboSearch.expected.firstHit);
              firstHit.should.have.property('description');
              done();
            });
        });

      });

    
      describe("Paging", function() {
        var pagingSearch = new SearchObj('ebola', 'relevance', 'all', {length: 7, firstHit: 'How do I submit human specimens for testing (LCMV, Lassa Fever, Ebola, Marburg, RVF, CCHF, TBE)?', id: 101774 });

        it("should return expected results page when a page parameter is passed", function(done) {
          request(baseUrl)
            .get('/api/search/' + pagingSearch.query + '/2/' + pagingSearch.sort + '/' + pagingSearch.filter)
            .end(function(err, res) {
              var firstHit = res.body.hits[0]._source;
              var numOfResults = res.body.hits.length;
              res.should.have.status(200);
              numOfResults.should.be.eql(pagingSearch.expected.length);
              firstHit.should.have.property('id').eql(pagingSearch.expected.id);
              firstHit.should.have.property('prId');
              firstHit.should.have.property('dateModified');
              firstHit.should.have.property('resources');
              firstHit.should.have.property('tier');
              firstHit.should.have.property('featuredRanking');
              firstHit.should.have.property('commonQuestionRanking');
              firstHit.should.have.property('datePublished');
              firstHit.should.have.property('topic');
              firstHit.should.have.property('subtopic');
              firstHit.should.have.property('language');
              firstHit.should.have.property('category');
              firstHit.should.have.property('title').eql(pagingSearch.expected.firstHit);
              firstHit.should.have.property('description');
              done();
            });
        });
      });
      
      // describe("Edge cases", function() {
      //   //For if we want to test very specific edge cases
      // });
    });

    describe("Typeahead query", function() {

      var termSearch = new SearchObj('pregnancy', 'relevance', 'all', {length: 20, firstHit: 'Measles and pregnancy', id: 87993});

      it("should return correct set of questions for provided search term", function(done) {
        request(baseUrl)
          .get('/api/questions/' + termSearch.query)
          .end(function(err, res) {
            var firstHit = res.body[0]._source;
            res.should.have.status(200);
            res.body.length.should.be.eql(termSearch.expected.length);
            firstHit.should.have.property('id').eql(termSearch.expected.id);
            firstHit.should.have.property('prId');
            firstHit.should.have.property('dateModified');
            firstHit.should.have.property('resources');
            firstHit.should.have.property('tier');
            firstHit.should.have.property('featuredRanking');
            firstHit.should.have.property('commonQuestionRanking');
            firstHit.should.have.property('datePublished');
            firstHit.should.have.property('topic');
            firstHit.should.have.property('subtopic');
            firstHit.should.have.property('language');
            firstHit.should.have.property('category');
            firstHit.should.have.property('title').eql(termSearch.expected.firstHit);
            firstHit.should.have.property('description');
            done();
          });
      });

      var singleCharSearch = new SearchObj('e', 'relevance', 'all', {length: 20, firstHit: 'What is Hepatitis E?', id: 96482});

      it("should return suggestions if you type a single character", function(done) {
        request(baseUrl)
          .get('/api/questions/' + singleCharSearch.query)
          .end(function(err, res) {
            var firstHit = res.body[0]._source;
            res.should.have.status(200);
            res.body.length.should.be.eql(singleCharSearch.expected.length);
            firstHit.should.have.property('id').eql(singleCharSearch.expected.id);
            firstHit.should.have.property('prId');
            firstHit.should.have.property('dateModified');
            firstHit.should.have.property('resources');
            firstHit.should.have.property('tier');
            firstHit.should.have.property('featuredRanking');
            firstHit.should.have.property('commonQuestionRanking');
            firstHit.should.have.property('datePublished');
            firstHit.should.have.property('topic');
            firstHit.should.have.property('subtopic');
            firstHit.should.have.property('language');
            firstHit.should.have.property('category');
            firstHit.should.have.property('title').eql(singleCharSearch.expected.firstHit);
            firstHit.should.have.property('description');
            done();
          });
      });

      var phraseSearch = new SearchObj('this kind of sickness', 'relevance', 'all', {length: 20, firstHit: 'What kind of germ causes botulism?', id: 90108});

      it("should return suggestions for a phrase", function(done) {
        request(baseUrl)
          .get('/api/questions/' + phraseSearch.query)
          .end(function(err, res) {
            var firstHit = res.body[0]._source;
            res.should.have.status(200);
            res.body.length.should.be.eql(phraseSearch.expected.length);
            firstHit.should.have.property('id').eql(phraseSearch.expected.id);
            firstHit.should.have.property('prId');
            firstHit.should.have.property('dateModified');
            firstHit.should.have.property('resources');
            firstHit.should.have.property('tier');
            firstHit.should.have.property('featuredRanking');
            firstHit.should.have.property('commonQuestionRanking');
            firstHit.should.have.property('datePublished');
            firstHit.should.have.property('topic');
            firstHit.should.have.property('subtopic');
            firstHit.should.have.property('language');
            firstHit.should.have.property('category');
            firstHit.should.have.property('title').eql(phraseSearch.expected.firstHit);
            firstHit.should.have.property('description');
            done();
          });
      });
    });

    describe("Ratings", function() {
      it("should update positive rating property of a PR", function(done) {
        request(baseUrl)
          .post('/api/updatePositiveRating/'+101076)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body._id.should.be.eql('101076');
            res.body._shards.successful.should.be.eql(1);
            done();
          });
      });

      it("should update negative rating property of a PR", function(done) {
        request(baseUrl)
          .post('/api/updateNegativeRating/'+101076)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body._id.should.be.eql('101076');
            res.body._shards.successful.should.be.eql(1);
            done();
          });
      });

    });


    describe("Home page routes", function() {
      var max = 5;

      it("should return expected result for Featured PRs routes", function(done) {
        request(baseUrl)
          .get('/api/getFeatured/' + max)
          .end(function(err, res) {
            var result = res.body.hits.hits;
            result.length.should.be.equal(max);
            done();
          });
      });

      it("should return expected result for Common PRs routes", function(done) {
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

      it("should return expected result for Most Recent routes", function(done) {
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
  
    });

  });


  // describe("Users", function() {
  //   // it("should return -1 when the value is not present");
  // });
});

function SearchObj(query, sort, filter, expected) {
  this.query = query;
  this.sort = sort;
  this.filter = filter;
  this.expected = expected;
}