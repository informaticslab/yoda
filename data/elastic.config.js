module.exports = function() {

  var config = {
      mappings: {
        "prepared_responses": {
          "properties": {
            "category": {
              "type": "string"
            },
            "commonQuestionRanking": {
              "type": "long"
            },
            "dateModified": {
              "format": "strict_date_optional_time||epoch_millis",
              "type": "date"
            },
            "datePublished": {
              "format": "strict_date_optional_time||epoch_millis",
              "type": "date"
            },
            "featuredRanking": {
              "type": "long"
            },
            "id": {
              "type": "long"
            },
            "keywords": {
              "type": "string"
            },
            "language": {
              "type": "string"
            },
            "prId": {
              "type": "long"
            },
            "query": {
              "type": "string",
              "fields": {
                "en": { 
                  "type":     "string",
                  "analyzer": "english"
                }
              }  
            },
            "response": {
              "type": "string",
              "fields": {
                "en": { 
                  "type":     "string",
                  "analyzer": "english"
                }
              }  
            },
            "smartTag": {
              "type": "string"
            },
            "subtopic": {
              "type": "string"
            },
            "tier": {
              "type": "string"
            },
            "topic": {
              "type": "string"
            }
          }
        }
      } 
  };

  return config;

};