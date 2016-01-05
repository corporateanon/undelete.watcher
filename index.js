'use strict';

const axios = require('axios');
const TwitterStream = require('twitter-stream-api');
const conf = require('./conf')();

require('request').debug = true;

main();
return;

function main() {
        const twi = new TwitterStream(conf.twitter, true);
        twi.stream('user', {
                replies: true
        });

        twi.on('data', (message) => {
                if (message && message.text && message.id_str && !message.retweeted_status) {
                        onTweet({
                                id: message.id_str,
                                body: message,
                        });
                }
        });

        function onTweet(tweet) {
                var body = tweet.body;
                console.log('tweet: ', '@' + body.user.screen_name, body.user.name, body.text);
                storageAddTweet(tweet);
        }

        function storageAddTweet(tweet) {
                axios.put(conf.storage.url + '/tweets', tweet)
                        .then((response) => console.log('response:', response.status, response.data), (error) => console.log('ERROR:', error));
        }
}
