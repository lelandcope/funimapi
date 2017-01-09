// Node Modules
var Fuse = require('fuse.js');


/*
@class ShowsCollection
*/

function ShowsCollection() {
    var collection = Object.create(Array.prototype);
    collection = (Array.apply(collection, arguments)) || collection;
    collection = ShowsCollection.injectClassMethods(collection);

    return collection;
}

/////////////////////////////////////
// Static Functions
/////////////////////////////////////

ShowsCollection.injectClassMethods = function injectClassMethods(collection) {
    for(var method in ShowsCollection.prototype) {
        if(ShowsCollection.prototype.hasOwnProperty(method)) {
            collection[method] = ShowsCollection.prototype[method];
        }
    }

    return collection;
}

/////////////////////////////////////
// Prototype Functions
/////////////////////////////////////

/*
@function search
@param {String} text - The text you are searching for
*/

ShowsCollection.prototype.search = function search(text) {
    if(!this.length) return [];

    var options = {
        keys: [
            'genres',
            'languages',
            'link',
            'official_marketing_website',
            'series_description',
            'series_name',
            'show_rating'
        ],
        include: ['score'],
        threshold: 0.5
    }

    var fuse = new Fuse(this, options);
    var searchResults = fuse.search(text).map(function (obj) {
        var show = obj.item;
        show._score = obj.score;

        return show;
    })
    var results = new ShowsCollection();
    results.push.apply(results, searchResults);

    return results;
}

/*
@function sortByKey
@param {String} [key=_pubTimestamp:desc]
*/

ShowsCollection.prototype.sortByKey = function sortByKey(key) {
    key = (key || '_pubTimestamp:desc').split(':');
    sortOrder = key[1] || 'asc';
    key = key[0];

    var sortedShows = this.sort(function (a, b) {
        return a[key] - b[key];
    });

    if(sortOrder === 'desc') {
        sortedShows.reverse();
    }

    var results = new ShowsCollection();
    results.push.apply(results, sortedShows);

    return results;
}


module.exports = ShowsCollection;
