const GUN = require('gun')
const SEA = GUN.SEA
const file = require('@dolchi21/file')

function log() {
    const now = new Date().toISOString()
    console.log(now, ...arguments)
}

async function saveEvent(event) {
    const filename = `tmp/${event.type.split('/').join('-')}.json`
    const state = await file(filename).catch(err => ([]))
    state.push(event)
    state.sort((a, b) => {
        if (!a._date || !b._date) return 0
        return b._date.localeCompare(a._date)
    })
    await file(filename, state)
}
async function getPair(name) {
    return file(`tmp/${name}.json`).catch(async () => {
        const pair = await SEA.pair()
        await file(`tmp/${name}.json`, pair)
        return pair
    })
}
async function testSEA() {
    const state = {}
    const alice = state.alice = await getPair('alice')
    const bob = state.bob = await getPair('bob')

    const message = {
        type: 'TEST',
        date: new Date().toISOString()
    }
    state.baSecret = await SEA.secret(bob.epub, alice)
    state.aliceSays = await SEA.encrypt(message, state.baSecret)
    state.abSecret = await SEA.secret(alice.epub, bob)
    state.bobHears = await SEA.decrypt(state.aliceSays, state.abSecret)

    console.log(state)
}

async function main() {
    //return testSEA()
    const state = await file('tmp/state.json').catch(err => ({}))
    state.counters = state.counters || {}
    state.errors = state.errors || []
    const peer = 'https://gun-manhattan.herokuapp.com/gun'
    const opt = { peers: [peer] }
    const gun = GUN(opt)
    let last = null
    gun.get('event').get('global').on(async function (value) {
        try {
            if (last === value) return
            last = value
            const event = JSON.parse(value)
            event._date = new Date().toISOString()
            await saveEvent(event).catch(console.error)
            const type = event.type
            delete event.type
            //if (!type.startsWith('COM')) return
            if (undefined === state.counters[type]) state.counters[type] = 0
            state.counters[type]++
            log(type, event)
            await file('tmp/state.json', state)
        } catch (err) {
            console.error(err)
        }
    })
    gun.get('event').get('global').put('{"type":"PEER"}')
}

main()
