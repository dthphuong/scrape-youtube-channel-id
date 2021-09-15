require('dotenv').config()
const axios = require('axios')
const _ = require('underscore')
const async = require('async')
const fs = require('fs')

const utils = require('./utils')

let utubeUrls = fs.readFileSync(process.env.INPUT_FILE, 'utf8')
utubeUrls = utubeUrls.split('\n')
console.log(utubeUrls.length)

// refine utube url
var q = async.queue((task, callback) => {
  console.log(`👉 Open: ${task.url}`);

  if (task.url != '') {
    if (task.url.indexOf('https://') > -1) {
      if (utils.youtubeParser(task.url)) { // url is video url
        utils.getChannelIdByYoutubeAPI(utils.searchQueryForChannelByVideoUrl(task.url), callback)
      } else { // url is channel url
        utils.getChannelIdBySource(task.url, callback)
      }
    } else {
      utils.getChannelIdByYoutubeAPI(utils.searchQueryForChannelByName(task.url), callback)
    }
  } else {
    fs.appendFileSync(process.env.OUTPUT_FILE, `\n`)
    console.log('😫 next....')
    console.log('--------------------------------------------------------')
    callback()
  }
})

_.each(utubeUrls, (url) => {
  q.push({ url: url });
})

q.drain(function () {
  console.log('all items have been processed');
});

q.error(function (err, task) {
  console.error(`task ${task.url} experienced an error`);
});