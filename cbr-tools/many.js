//@ts-check
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')

function getFolders() {
    const dir = fs.readdirSync('./').map(name => {
        const datePart = name.substr(0, 10)
        const date = new Date(datePart + 'T11:00:00.000Z')
        return {
            folder: name,
            date
        }
    }).filter(o => !isNaN(o.date.valueOf()))
    return dir
}

function main() {
    const folders = getFolders()
    folders.map(o => {
        let ret0 = shell.exec(`exiftool -alldates= ./"${o.folder}"/*.jpg`)
        let ret1 = shell.exec(`exiftool -alldates= ./"${o.folder}"/*.JPG`)
	let ret2 = shell.exec(`exiftool -alldates= ./"${o.folder}"/*.png`)

        const files = fs.readdirSync(o.folder)
        let now = o.date

        files.map(path.parse).map((file, i) => {
            //console.log(file)
            //@ts-ignore
            const fileDate = new Date(now.valueOf() + (1000 * 60 * i))
            shell.touch({ '-d': fileDate }, path.join(o.folder, file.base))
        })
    })
}

main()
