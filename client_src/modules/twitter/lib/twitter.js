
var config = require('../../../../app/config');
var Twitter = require('twitter');

var client = new Twitter(config.twitter);

module.exports = {
    getTweets(search_term, count) {
        return new Promise((resolve, reject) => {
            client.get('search/tweets', {
                q: search_term,
                result_type: "recent",
                count: count
            }, function(err, res) {
                if (err) {
                    return reject(err);
                }
                resolve(res.statuses);
            });
        });
    }
};
