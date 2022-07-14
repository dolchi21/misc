import * as crypto from 'crypto'

export default (data: string) => {
    return crypto.createHash('sha256')
        .update(data)
        .digest('hex')
}