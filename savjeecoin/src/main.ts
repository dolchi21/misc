import fs from 'fs'

import { Blockchain } from './Blockchain'
import { Transaction } from './Transaction'
import { ec as EC } from 'elliptic'
const ec = new EC('secp256k1')

const savjeeCoin = new Blockchain()
loadChain(savjeeCoin)

interface User {
    user: string
    key: EC.KeyPair
}
const users: User[] = [
    'myself',
    'satoshi',
    'suggester',
    'newLiberty',
].map(user => ({
    user,
    key: ec.keyFromPrivate(user)
}))

function loadChain(bc: Blockchain) {
    try {
        const chain = [].concat(JSON.parse(fs.readFileSync('chain.json').toString()))
        const trans = JSON.parse(fs.readFileSync('transactions.json').toString())
        bc.chain = chain
        bc.pendingTransactions = trans
        bc.adjustDifficulty()
        return bc
    } catch (err) { }
}
function saveChain(bc: Blockchain) {
    fs.writeFileSync('chain.json', JSON.stringify(bc.chain, null, 2))
    fs.writeFileSync('transactions.json', JSON.stringify(bc.pendingTransactions, null, 2))
}

function randomUser<T>(arr: T[]) {
    const r0 = Math.random() * arr.length;
    const i = Math.floor(r0)
    return arr[i]
}
function randomPair<T>(arr: T[]) {
    const u0 = randomUser(arr)
    const u1 = randomUser(arr)
    return [u0, u1]
}

let i = 0
while (i++ < 100) {
    const [from, to] = randomPair(users)
    const tx0 = new Transaction(from.key.getPublic('hex'), to.key.getPublic('hex'), Math.random())
    tx0.signTransaction(from.key)
    try {
        savjeeCoin.addTransaction(tx0)
    } catch (err) { }
    console.log('chain.difficulty', savjeeCoin.difficulty, nonceAverage(savjeeCoin))
    savjeeCoin.minePendingTransactions(from.key.getPublic('hex'))
    const balances = users.reduce((sum: any, user) => {
        sum[user.user] = savjeeCoin.getBalanceOfAddress(user.key.getPublic('hex'))
        return sum
    }, {})
    console.log('balances', balances)
    saveChain(savjeeCoin)
}

function nonceAverage(blockchain: Blockchain) {
    const nonces = blockchain.chain.map(b => b.nonce)
    return nonces.reduce((sum, i) => {
        if (!sum) return i
        return (sum + i)
    }) / nonces.length
}
