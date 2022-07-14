import { Block } from './Block'
import { Transaction } from './Transaction'

export class Blockchain {
    chain: Block[]
    difficulty: number = 1
    pendingTransactions: Transaction[] = []
    miningReward: number = 1
    constructor() {
        this.chain = [this.createGenesisBlock()]
    }
    createGenesisBlock() {
        return new Block(Date.now(), [], '0')
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1]
    }
    adjustDifficulty() {
        const now = Date.now()
        const last = this.chain[this.chain.length - 1]
        const diff = now - last.timestamp
        if (diff < 1000 * 10) {
            this.difficulty = last.chainDifficulty + 1
        } else {
            if (0 === this.difficulty) return
            this.difficulty = last.chainDifficulty - 1
        }
    }
    minePendingTransactions(miningRewardAddress: string) {
        let block = new Block(Date.now(), this.pendingTransactions)
        block.mineBlock(this.difficulty)
        console.log('Block mined:', block.hash)
        this.chain.push(block)
        this.adjustDifficulty()
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward * this.difficulty)
        ]
    }
    addTransaction(tx: Transaction) {
        if (!tx.fromAddress || !tx.toAddress) {
            throw new Error('Transaction must include from and to address')
        }
        if (!tx.isValid()) {
            throw new Error('Cannot add invalid transaction to chain')
        }
        this.pendingTransactions.push(tx)
    }
    getBalanceOfAddress(address: string) {
        let balance = 0
        this.chain.map(block => {
            block.transactions.map(tx => {
                if (tx.fromAddress === address) {
                    balance -= tx.amount
                }
                if (tx.toAddress === address) {
                    balance += tx.amount
                }
            })
        })
        return balance
    }
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i - 1]
            if (!currentBlock.hasValidTransactions()) return false
            if (currentBlock.hash != currentBlock.calculateHash()) return false
            if (currentBlock.previousHash != previousBlock.hash) return false
            return true
        }
    }
}