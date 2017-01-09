// Node Modules
var funimapi = require('./libs/funimapi');

var options = {
    language: 'dub',
    quality: 'hd',
    show_rating: 'TV-MA,TV-14',
    genre: 'comedy',
    // sort: 'latest_video_subscription_release_date'
};

funimapi.getShows(options)

.then(function (shows) {
    var sortRegex = new RegExp('("' + options.sort + '")', 'gi');
    var standardRegex = /("series_name"|"show_rating"|"pubDateHR"|"pubDate"|"genres")/gi;
    // var output = JSON.stringify(shows, null, 2)
    //     .replace(standardRegex, '$1'.bold);

    // if(options.sort)
    //     output = output.replace(sortRegex, '$1'.green);

    // console.log(output);
    // console.log('Total Shows:', shows.length);

    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('----------------------------------------------------');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');

    var searchResults = shows.search('Fan Service').sortByKey('latest_video_subscription_release_date:asc');

    console.log(JSON.stringify(searchResults, null, 2).replace(standardRegex, '$1'.bold));
    console.log('Total Search Results:', searchResults.length);
})

.catch(function (err) {
    console.log(err.message || err);
    console.log(err.stack);

    process.exit(1);
});
