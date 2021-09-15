const axios = require('axios')
const fs = require('fs')

const youtubeParser = (url) => {
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  var match = url.match(regExp);
  return (match && match[7].length == 11) ? match[7] : false;
}
exports.youtubeParser = youtubeParser

exports.searchQueryForChannelByName = (name) => {
  console.log(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${name}&type=channel&key=${process.env.API_KEY}`)
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${name}&type=channel&key=${process.env.API_KEY}`
}

exports.searchQueryForChannelByVideoUrl = (url) => {
  const id = youtubeParser(url)
  console.log(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.API_KEY}`);
  return `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.API_KEY}`
}

exports.getChannelIdByYoutubeAPI = (query, callback) => {
  axios.get(query)
    .then((response) => {
      if (response.status == 200) {
        // console.log(response.data)
        const jsonData = response.data

        const externalId = jsonData.items[0].snippet.channelId
        console.log(`🎉 https://youtube.com/channel/${externalId}`)
        fs.appendFileSync(process.env.OUTPUT_FILE, `https://youtube.com/channel/${externalId}\n`)
        console.log('--------------------------------------------------------')
        callback()
      } else {
        fs.appendFileSync(process.env.OUTPUT_FILE, `\n`)
        console.log(`❌ ${response.status} - ${response.statusText}`)
        console.log('--------------------------------------------------------')
        callback()
      }
    })
    .catch((err) => {
      fs.appendFileSync(process.env.OUTPUT_FILE, `\n`)
      console.log(`❌ ${err}`)
      console.log('--------------------------------------------------------')
      callback()
    })
}

exports.getChannelIdBySource = (url, callback) => {
  axios.get(url)
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
          fs.appendFileSync(process.env.OUTPUT_FILE, `https://youtube.com/channel/${externalId}\n`)
          console.log('--------------------------------------------------------')
          callback()
        } else {
          fs.appendFileSync(process.env.OUTPUT_FILE, `\n`)
          console.log('❌ Can not find')
          console.log('--------------------------------------------------------')
          callback()
        }
      } else {
        fs.appendFileSync(process.env.OUTPUT_FILE, `\n`)
        console.log(`❌ ${response.status} - ${response.statusText}`)
        console.log('--------------------------------------------------------')
        callback()
      }
    })
    .catch((err) => {
      fs.appendFileSync(process.env.OUTPUT_FILE, `\n`)
      console.log(`❌ ${err}`)
      console.log('--------------------------------------------------------')
      callback()
    })
}