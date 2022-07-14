//@ts-check
const axios = require('axios').default
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

function name(URLInfo, fileInfo) {
    const index = ('' + (1000 + parseInt(fileInfo.name))).substr(1, 3)
    const dest = [URLInfo.name, '-', index, fileInfo.ext].join('')
    return dest
}
function imagesSelector(url) {
    if (url.indexOf('mangakakalot') !== -1) return '#vungdoc img'
    if (url.indexOf('manganelo') !== -1) return '.container-chapter-reader img'
}
async function getImageList(url) {
    const html = await axios.get(url).then(res => res.data)
    const $ = cheerio.load(html)
    const images = $(imagesSelector(url)).map((i, el) => {
        const { src } = el.attribs
        return src
    }).get()
    return images
}
function imagesToTasks(URLInfo, images) {
    return images.map(src => {
        const info = path.parse(src)
        const dest = name(URLInfo, info)
        return { src, dest }
    })
}

async function main() {
    const url = process.argv[2]
    const URLInfo = path.parse(url)
    const images = await getImageList(url)
    const tasks = imagesToTasks(URLInfo, images)
    const onTasks = tasks.map(async t => {
        const fileStream = await axios.get(t.src, {
            responseType: 'stream',
            headers: {
                referer: url
            }
        }).then(res => {
            return res.data
        })
        fileStream.pipe(fs.createWriteStream('images/' + t.dest))
    })
    await Promise.all(onTasks)
}

main().catch(err => {
    console.error(err)
})
