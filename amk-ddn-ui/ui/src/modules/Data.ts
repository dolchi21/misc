import * as R from 'redux'

export function reducer(state: any = {}, action: R.AnyAction) {
    switch (action.type) {
        case 'SET': {
            return {
                ...state,
                ...action.payload
            }
        }
        case 'REMOVE': {
            const next = { ...state }
            delete next[action.payload]
            return next
        }
        default: return state
    }
}

export const set = (data: any) => ({
    type: 'SET',
    payload: data
})

export const remove = (key: string) => ({
    type: 'REMOVE',
    payload: key
})
