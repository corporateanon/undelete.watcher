'use strict';

const axios = require('axios');
const TwitterStream = require('twitter-stream-api');
const readableToken = require('readable-token');
const conf = require('./conf')();

require('request').debug = true;

main();
return;

function main() {
  const twi = new TwitterStream(conf.twitter, true);
  twi.stream('user', {
    replies: true
  });

  twi.on('data', onData);
}

function onData(message) {
  if (message && message.text && message.id_str && !message.retweeted_status) {
    onTweet({
      id: message.id_str,
      body: message,
    });
  }
}

function onTweet(tweet) {
  var body = tweet.body;
  console.log('tweet: ', '@' + body.user.screen_name, body.user.name, body.text);
  resolveAttachments(tweet).then(storageAddTweet);
}

function storageAddTweet(tweet) {
  axios.put(conf.storage.url + '/tweets', tweet)
    .then(addTweetSuccess, addTweetError);
}

function addTweetSuccess(response) {
  console.log('add-tweet-success:', response.status, response.data);
}

function addTweetError(error) {
  console.error('add-tweet-error:', error);
}

function resolveAttachments(tweet) {
  const body = tweet.body;
  const media = ((body.extended_entities || {}).media || []);
  const photos = media.filter(it => it.type === 'photo' && it.media_url);
  const photoURLs = photos.map(it => it.media_url);

  var result = Promise.resolve(tweet);
  if (photoURLs.length) {
    result = downloadImages(photoURLs)
      .then(attachments => {
        tweet.attachments = attachments;
        return tweet;
      });
  }
  return result;
}

function downloadImages(urls) {
  return Promise.all(urls.map(downloadImage)).then(attachments => attachments.filter(it => it));
}

function downloadImage(url) {
  console.log('attachment-downloading:', url);
  return axios({
    url: url,
    method: 'get',
    timeout: 10000,
    responseType: 'arraybuffer',
  }).then(downloadSuccess.bind(null, url), downloadError.bind(null, url));
}

function downloadSuccess(url, response) {
  const data = response.data;
  const base64Data = data.toString('base64');
  console.log('attachment-downloaded: %d bytes (%d bytes in base64) %s', data.length, base64Data.length, url);
  return {
    url: url,
    body: base64Data,
  };
}

function downloadError(url, error) {
  console.error('attachment-download-error:', url, error);
  return null;
}
