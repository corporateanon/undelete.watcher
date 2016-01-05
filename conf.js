'use strict';

module.exports = function getConfig() {
        var env = process.env;

        return {
                twitter: {
                        token: env.TwitterToken,
                        token_secret: env.TwitterTokenSecret,
                        consumer_key: env.TwitterConsumerKey,
                        consumer_secret: env.TwitterConsumerSecret,
                },
                storage: {
                        url: env.StorageURL,
                }
        };
};
