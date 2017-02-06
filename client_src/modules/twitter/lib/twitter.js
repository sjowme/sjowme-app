
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
			
			client.stream('statuses/filter', {track: 'internet'},  function(stream) {
				stream.on('connected', function (res) {
					console.log('stream connected (' + res.statusCode + ')');
				});
				
				stream.on('reconnect', function (req, res, interval) {
					console.log('stream reconnecting in ' + interval + ' (' + res.statusCode + ')');
				});
				
				stream.on('data', function(tweet) {
					console.log(tweet.text);
				});

				stream.on('error', function(error) {
					console.log(error);
				});
			});
			
        });
    }
};
