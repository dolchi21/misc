//@ts-check
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')

const DIR = './cbr'

const files = fs.readdirSync(DIR)

let now = new Date(process.argv[2] + 'T11:00:00.000Z')

if (isNaN(now.valueOf())) {
    process.exit(1)
}

let ret = shell.exec('exiftool -alldates= ./cbr/*.jpg')
let ret2 = shell.exec('exiftool -alldates= ./cbr/*.JPG')

files.map(path.parse).map(file => {
    console.log(file)
    shell.touch({
        '-d': now
    }, path.join(DIR, file.base))
    now = new Date(now.valueOf() + (1000 * 60))
})