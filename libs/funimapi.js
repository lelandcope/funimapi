// Node Modules
require('colors');
var Promise         = require('bluebird');
var request         = Promise.promisifyAll(require('request'));
var qs              = require('querystring');
var moment          = require('moment');
var _               = require('lodash');
var ShowsCollection = require('./shows-collection');

// lodash mixin
_.mixin({
  sortKeysBy: function (obj, comparator) {
    var sorted = {},
    key, a = [];

    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        a.push(key);
      }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
      sorted[a[key]] = obj[a[key]];
    }
    return sorted;
  }
});

// Vars
var funimationShowsUrl = 'http://www.funimation.com/feeds/ps/shows';
var defaultQueryParams = {
  ut: 'FunimationUser',
  limit: 3000,
  sort: 'SortOptionLatestSubscription'
}


// @class Funimapi
function Funimapi() {}


//////////////////////////////////////////////
// Internal Functions
//////////////////////////////////////////////

/*
@function _fetchShows
*/

Funimapi.prototype._fetchShows = function _fetchShows() {
    var URL = funimationShowsUrl + '?' + qs.stringify(defaultQueryParams);

    return request.getAsync(URL)
    .then(function onSuccess(response) {
        return JSON.parse(response.body);
    })
    .map(this._processShow.bind(this))
    .then(function (response) {
        var shows = new ShowsCollection();
        shows.push.apply(shows, response);

        return shows;
    });
}


/*
@function _processShow
*/

Funimapi.prototype._processShow = function _processShow(show) {
    show.languages = show.languages.toLowerCase();
    show._pubTimestamp = moment(show.pubDate, 'MM/DD/YYYY').valueOf();
    show.pubDateHR = moment(show._pubTimestamp).fromNow();

    return _.sortKeysBy(show);
}

/*
@function _extendOptions
*/

Funimapi.prototype._extendOptions = function _extendOptions(options) {
    var defaultOptions = {
        language: undefined, // dub or sub
        quality: undefined, // HD or SD
        show_rating: undefined, // TV-MA, TV-14, TV-PG - Can be comma seperated
        genre: undefined, // Comma seperated list of genres. Used as an or statement
        sort: '_pubTimestamp:desc'
    };
    options = _.extend(defaultOptions, options);
    if(options.language) options.language = options.language.toLowerCase();
    if(options.quality) options.quality = options.quality.toLowerCase();
    if(options.show_rating) options.show_rating = options.show_rating.toLowerCase();

    return options;
}


//////////////////////////////////////////////
// Functions
//////////////////////////////////////////////

/*
@function getShows
*/

Funimapi.prototype.getShows = function getShows(options) {
    options = this._extendOptions(options);
    var sort = options.sort.toLowerCase();

    return this._fetchShows()
    // Sort
    .then((function (shows) {
        return shows.sortByKey(options.sort)
    }).bind(this))
    // Filter
    .then((function (shows) {
        return shows.filter(function (show) {
            var pass = true;

            if(options.language && ~['dub', 'sub'].indexOf(options.language)) {
                pass = pass && ~show.languages.toLowerCase().indexOf(options.language)
            }

            if(options.quality && ~['hd', 'sd'].indexOf(options.quality)) {
                pass = pass && ~show.quality.toLowerCase().indexOf(options.quality)
            }

            if(options.show_rating) {
                pass = pass && ~options.show_rating.split(',').indexOf(show.show_rating.toLowerCase())
            }

            if(options.genre) {
                var pass = pass && options.genre.toLowerCase().split().reduce(function (passed, genre) {
                    if(show.genres && ~show.genres.toLowerCase().indexOf(genre)) passed = true;

                    return passed;
                }, false);
            }

            return pass;
        });
    }).bind(this))
    .then(function (response) {
        var shows = new ShowsCollection();
        shows.push.apply(shows, response);
        return shows;
    });
}


module.exports = new Funimapi();
