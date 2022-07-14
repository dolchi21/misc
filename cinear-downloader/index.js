const axios = require('axios')
const fs = require('fs')
const leftPad = require('left-pad')
const path = require('path')
const Queue = require('@dolchi21/iqueue').default

function getBaseURL(url) {
    const basename = path.basename(url)
    return url.replace(basename, '')
}

async function joinChunks() {
    const { exec } = require('child_process')
    return new Promise((resolve, reject) => {
        exec('bash make-mp4.sh', (err, stdout, stderr) => {
            if (err) return reject(stderr)
            resolve(stdout)
        })
    })
}

async function getChunksList(url) {
    const baseURL = getBaseURL(url)
    const response = await axios.get(url).then(res => res.data).catch(err => {
        return fs.readFileSync(url).toString()
    })
    const lines = response.split('\n')
    const mediaFiles = lines.filter(line => line[0] !== '#')
    return mediaFiles.map(basename => {
        return baseURL + basename
        return basename
    })
}
async function download(url, filename) {
    const target = filename || path.basename(require('url').parse(url).pathname)
    return downloadQueue.add(async () => {
        const response = await axios.get(url, {
            responseType: 'stream'
        })
	console.info('ok', filename)
        response.data.pipe(fs.createWriteStream('ts-files/' + target))
    }).catch(err => {
	console.warn('retry', filename)
	return download(url, filename)
    })
}
const downloadQueue = new Queue();

async function main() {
    const src = process.argv[2]
    //const src = './sin2.m3u8'
    const chunks = await getChunksList(src)
    let failedChunks = []
    const jobs = chunks.map(async (chunk, i) => {
        const url = chunk
        const filename = leftPad(i, 4, '0') + '.ts'
        await download(url, filename).catch(() => failedChunks.push(chunk))
        console.log(downloadQueue.queue.getQueueLength(), downloadQueue.queue.maxPendingPromises)
    })
    await Promise.all(jobs).catch(err => console.log(err))

    if (failedChunks.length) console.log('failed', failedChunks)

    const stdout = await joinChunks()
    console.log(stdout)
}

main().then(() => {
    process.exit(0)
}).catch(err => {
    console.error(err)
    process.exit(1)
})
