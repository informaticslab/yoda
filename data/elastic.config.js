module.exports = function() {

  var config = {
      settings: {
        "settings": {
        "index": {
          "analysis": {
            "filter": {
              "stemmer": {
                "type": "stemmer",
                "language": "english"
              },
              "autocompleteFilter": {
                "max_shingle_size": "5",
                "min_shingle_size": "2",
                "type": "shingle"
              },
              "stopwords": {
                "type": "stop",
                "stopwords": [
                  "_english_"
                ]
              }
            },
            "analyzer": {
              "didYouMean": {
                "filter": [
                  "lowercase"
                ],
                "char_filter": [
                  "html_strip"
                ],
                "type": "custom",
                "tokenizer": "standard",
                "stopwords" : ["have"]
              },
              "autocomplete": {
                "filter": [
                  "lowercase",
                  "autocompleteFilter"
                ],
                "char_filter": [
                  "html_strip"
                ],
                "type": "custom",
                "tokenizer": "standard"
              },
              "default": {
                "filter": [
                  "lowercase",
                  "stopwords",
                  "stemmer"
                ],
                 "char_filter": [
                  "html_strip"
                ],
                "type": "custom",
                "tokenizer": "standard"
              }
            }
          }
        }
      },
      mappings: {
        "properties": {

          "query": {
            "type": "string",
            "copy_to": [
              "did_you_mean",
              "autocomplete",
              "all_search_fields"
            ]
          },

          "response": {
            "type": "string",
            "copy_to": [
              "autocomplete",
              "did_you_mean",
              "all_search_fields"
            ]
          },
           "keywords": {
            "type": "string",
            "copy_to": [
              "autocomplete",
              "did_you_mean",
              "all_search_fields"
            ]
          },
          "did_you_mean": {
                  "type": "string",
                  "analyzer": "didYouMean"
          },
          "autocomplete": {
            "type": "string",
            "analyzer": "autocomplete"
          },
          "all_search_fields" :{
            "type" : "string"
          }
        }
      }
    }
  };

  return config;

  // var mappings = {

  //   "properties": {

  //     "query": {
  //       "type": "string",
  //       "copy_to": [
  //         "did_you_mean",
  //         "autocomplete",
  //         "all_search_fields"
  //       ]
  //     },

  //     "response": {
  //       "type": "string",
  //       "copy_to": [
  //         "autocomplete",
  //         "did_you_mean",
  //         "all_search_fields"
  //       ]
  //     },
  //      "keywords": {
  //       "type": "string",
  //       "copy_to": [
  //         "autocomplete",
  //         "did_you_mean",
  //         "all_search_fields"
  //       ]
  //     },
  //     "did_you_mean": {
  //             "type": "string",
  //             "analyzer": "didYouMean"
  //     },
  //     "autocomplete": {
  //       "type": "string",
  //       "analyzer": "autocomplete"
  //     },
  //     "all_search_fields" :{
  //       "type" : "string"
  //     }
  //   }
  
  // };

};