const nlp = require('nlp_compromise');
const primaryStopWords = require('stopwords').english;

module.exports = function () {

  let service = {
    preProcessSearch: preProcessSearch,
    preProcessSearch2: preProcessSearch2
  };

  return service;

  function preProcessSearch(queryString) {
    let relevantTemrs = [];
    let nounTokens = nlp.sentence(queryString).terms.filter((t) => {
      return t.pos.Noun;
    });

    let tags = nlp.text(queryString).tags((t) => {
      return t.pos.Noun;
    });

    console.log("nlp tags:", tags[0]);

    for (let i = 0; i < nounTokens.length; i++) {
      relevantTemrs.push(nounTokens[i].text);
    }
    return relevantTemrs.join(' ');
  }

  function preProcessSearch2(queryString) {
    let relevantTemrs = [];
    let tokens = [];
    tokens = queryString.toLowerCase().split(' ');

    for (let i = 0; i < tokens.length; i++) {
      if (primaryStopWords.indexOf(tokens[i]) === -1) {
        relevantTemrs.push(tokens[i]);
      }
      // else {
      //   tokens[i] = tokens[i] + '^0.2';
      // }
    }
    return relevantTemrs.join(' ');
  }
};