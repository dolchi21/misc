import * as Data from './modules/Data'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const STATUS_ORDER: any = {
    running: 0,
    error: 8,
    done: 9
}
export const loadProcesses = async (dispatch: any) => {
    const res = await fetch('http://icharlie.amtek.com.ar:3000/state')
    const data = await res.json()
    const now = new Date()
    dispatch(Data.set({
        processes: Object.entries(data).map(([key, value]: any) => {
            const date = new Date(value.updatedAt)
            return {
                ...value,
                key,
                order: `${(1000000000 + now.valueOf() - date.valueOf())}`
                //order: `${STATUS_ORDER[value.status]}/${date.valueOf()}`
                //order: key
            }
        }),
        updatedAt: new Date()
    }))
}

export const autoLoadProcesses = async (dispatch: any, getState: any) => {
    console.log('autoLoad')
    const state = getState()
    if (state.data.auto) return
    dispatch(Data.set({ auto: true }))
    setTimeout(async () => {
        while (true) {
            const state = getState()
            if (state.data.auto && !document.hidden) await loadProcesses(dispatch)
            await sleep(1000 * 1)
        }
    })
    return () => dispatch(Data.set({ auto: false }))
}

export const enqueue = (client: string, entityId: number) => async (dispatch: any) => {
    const res = await fetch(`http://icharlie.amtek.com.ar:3000/enqueue?client=${client}&entityId=${entityId}`)
    const data = await res.json()
    dispatch(Data.set({ queue: data }))
}

export const selectProcess = (key: string) => (dispatch: any) => {
    dispatch(Data.set({ selected: key }))
}