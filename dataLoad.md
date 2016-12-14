Elaasticsearch Clean Setup Process
==================================

1. Create empty index:

curl -XPUT 'localhost:9200/wikipedia/'

2. Close the index:

curl -XPOST 'localhost:9200/wikipedia/_close'

3. Add mapping: 

curl -XPUT 'http://localhost:9200/wikipedia/wikipedia/_mapping' -d '
{
  "wikipedia": {
    "properties": {
      "category": {
        "type": "string"
      },
      "special": {
        "type": "boolean"
      },
      "title": {
        "type": "string",
        "fields": {
          "en": {
            "type": "string",
            "analyzer": "english"
          }
        }
      },
      "stub": {
        "type": "boolean"
      },
      "disambiguation": {
        "type": "boolean"
      },
      "link": {
        "type": "string"
      },
      "redirect": {
        "type": "boolean"
      },
      "text": {
        "type": "string",
        "fields": {
          "en": {
            "type": "string",
            "analyzer": "english"
          }
        }
      }
    }
  }
}'

4. Open index:

curl -XPOST 'localhost:9200/wikipedia/_open'

5. Create alias for index:

curl -XPUT 'localhost:9200/wikipedia/_alias/elastic-showcase'

6. Load wikipedia data with the following command:

java  -Djdk.xml.totalEntitySizeLimit=2147480000 -jar ./stream2es wiki --target http://localhost:9200/wikipedia --log debug --source /Users/michaelta/Downloads/enwiki-latest-pages-articles.xml.bz2 