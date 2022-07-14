import SHA256 from './sha256'
import { Transaction } from './Transaction'

export class Block {
    timestamp: number
    transactions: Transaction[]
    previousHash: string
    hash: string
    nonce: number
    chainDifficulty: number = 0
    constructor(timestamp: number, transactions: Transaction[], previousHash = '') {
        this.timestamp = timestamp
        this.transactions = transactions
        this.previousHash = previousHash
        this.hash = ''
        this.nonce = 0
    }
    calculateHash() {
        const str = JSON.stringify(this.transactions)
        return SHA256(this.previousHash + this.timestamp + str + this.nonce)
    }
    mineBlock(difficulty: number) {
        this.chainDifficulty = difficulty
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++
            this.hash = this.calculateHash()
        }
    }
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) return false
        }
        return true
    }
}
