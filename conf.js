'use strict';

module.exports = function getConfig() {
        var env = process.env;

        return {
                twitter: {
                        token: env['twitter.token'],
                        token_secret: env['twitter.token_secret'],
                        consumer_key: env['twitter.consumer_key'],
                        consumer_secret: env['twitter.consumer_secret'],
                },
                storage: {
                        url: env['storage.url'],
                }
        };
};
