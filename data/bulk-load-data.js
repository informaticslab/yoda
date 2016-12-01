const fs = require('fs');
const es = require('elasticsearch');
const data = require('./tv-data')();
const client = new es.Client({
    host: 'localhost:9200'
});

let bulk_request = [];
let content = data;

for (let i = 0; i < content.length; i++) {
    bulk_request.push({ index: { _index: 'tv_shows', _type: 'tv_shows', _id: content.id } });
    bulk_request.push(content[i]);
    if (bulk_request.length === data.length * 2) {
        perhaps_insert();
    }
}



// Recursively whittle away at bulk_request, 500 at a time.
function perhaps_insert() {
    let busy = false;
    let callback = function(err, resp) {
        if (err) { console.log(err); }

        busy = false;
    };
    if (!busy) {
        busy = true;
        client.bulk({
            body: bulk_request.slice(0, 100)
        }, callback);
        bulk_request = bulk_request.slice(100);
        console.log(bulk_request.length);
    }

    if (bulk_request.length > 0) {
        setTimeout(perhaps_insert, 10);
    } else {
        console.log('Inserted all records.');
    }
};
