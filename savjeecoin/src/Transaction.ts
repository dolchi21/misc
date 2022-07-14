import { ec as EC } from 'elliptic'
import SHA256 from './sha256'

const ec = new EC('secp256k1')

export class Transaction {
    fromAddress: string | null
    toAddress: string
    amount: number
    signature: any
    constructor(fromAddress: string | null, toAddress: string, amount: number) {
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
    }
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount)
    }
    signTransaction(signingKey: EC.KeyPair) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets')
        }
        const hash = this.calculateHash()
        const sig = signingKey.sign(hash, 'base64')
        this.signature = sig.toDER('hex')
    }
    isValid() {
        if (this.fromAddress === null) return true
        if (this.fromAddress === this.toAddress) {
            throw new Error('Self transaction not allowed')
        }
        if (!this.signature) {
            throw new Error('No signature in this transaction')
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}