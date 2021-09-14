const axios = require('axios')
const _ = require('underscore')
const async = require('async')
const fs = require('fs')

let utubeUrls = fs.readFileSync('./input.txt', 'utf8')
utubeUrls = utubeUrls.split('\n')
console.log(utubeUrls.length)

// refine utube url
var q = async.queue((task, callback) => {
  console.log(`👉 Open: ${task.url}`);

  if (task.url != '') {
    if (task.url.indexOf('https://') > -1) {
      axios.get(task.url)
        .then((response) => {
          const startKey = '"externalId":"'
          const endKey = '","keywords'

          if (response.status == 200) {
            // console.log(response.data)
            const src = response.data

            const startIdx = src.indexOf(startKey)
            const endIdx = src.indexOf(endKey)
            console.log(`👉 ${startIdx} - ${endIdx}`)

            if (startIdx > -1) {
              // console.log(startIdx + startKey.length)
              // console.log(endIdx)

              const externalId = src.substring(startIdx + startKey.length, startIdx + startKey.length + 24)
              // console.log(`🎉 ${externalId}`)
              console.log(`🎉 https://youtube.com/channel/${externalId}`)
              fs.appendFileSync('./output.txt', `https://youtube.com/channel/${externalId}\n`)
              console.log('--------------------------------------------------------')
              callback()
            } else {
              fs.appendFileSync('./output.txt', `\n`)
              console.log('❌ Can not find')
              callback()
            }
          } else {
            console.log(`❌ ${response.status} - ${response.statusText}`)
            callback()
          }
        })
        .catch((err) => {
          fs.appendFileSync('./output.txt', `\n`)
          console.log(`❌ ${err}`)
          callback()
        })
    } else {
      axios.get(searchQueryForChannelByName(task.url))
        .then((response) => {
          if (response.status == 200) {
            // console.log(response.data)
            const jsonData = response.data

            const externalId = jsonData.items[0].snippet.channelId
            console.log(`🎉 https://youtube.com/channel/${externalId}`)
            fs.appendFileSync('./output.txt', `https://youtube.com/channel/${externalId}\n`)
            console.log('--------------------------------------------------------')
            callback()
          } else {
            console.log(`❌ ${response.status} - ${response.statusText}`)
            callback()
          }
        })
        .catch((err) => {
          fs.appendFileSync('./output.txt', `\n`)
          console.log(`❌ ${err}`)
          callback()
        })
    }
  } else {
    fs.appendFileSync('./output.txt', `\n`)
    console.log('😫 next....')
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

const searchQueryForChannelByName = (name) => {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${name}&type=channel&key=AIzaSyBrg9ZWFa9qmf8b6UQJ_guNawseglgtMDc`
}