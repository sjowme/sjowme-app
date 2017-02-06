
var config = require('../../../../app/config');
var Twitter = require('twitter');

var client = new Twitter(config.twitter);


module.exports = {
    getTweetsTest(search_term, count) {
		
		client.stream('statuses/filter', {track: 'internet'},  function(stream) {
			stream.on('connected', function (res) {
				console.log('stream connected (' + res.statusCode + ')');
			});
			
			stream.on('reconnect', function (req, res, interval) {
				console.log('stream reconnecting in ' + interval + ' (' + res.statusCode + ')');
			});
			
			stream.on('tweet', function (res) {
				console.log('Got a tweet! (' + res + ')');
			});
			
			stream.on('data', function(tweet) {
				console.log(tweet.text);
			});

			stream.on('error', function(error) {
				console.log(error);
			});
		});
		
        return new Promise((resolve, reject) => {
            client.get('search/tweets', {
                q: search_term,
                result_type: "recent",
                count: count
            }, function(err, res) {
                if (err) {
                    return reject(err);
                }
				console.log('Got the tweets: '+res+' ');
                resolve(res.statuses);
            });
			
        });
    }
};
