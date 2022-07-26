import React from 'react'
import { connect } from 'react-redux'
//@ts-ignore
import md5 from 'crypto-js/md5'
import { enqueue, selectProcess } from '../actions'

function getContrastYIQ(hexcolor: string) {
    try {
        hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0, 2), 16);
        var g = parseInt(hexcolor.substr(2, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    } catch (err) {
        return 'black'
    }
}
function colors(str: any) {
    //@ts-ignore
    //const data = window.COLORS_SEED ? window.COLORS_SEED + str : str
    const data = str + new Date().toISOString().substr(0, 18)
    const hash = md5(data).toString()
    const color0 = `#${hash.substr(0, 3)}`
    const color1 = getContrastYIQ(color0)
    return [color0, color1]
}

const ms2p = (state: any) => {
    const items = (state.data.processes || []).sort((a: any, b: any) => a.order.localeCompare(b.order))
    return {
        items,
        selected: state.data.selected
    }
}

const md2p = (dispatch: any) => ({ dispatch })

const ProgressColor: any = {
    done: 'bg-success',
    error: 'bg-danger',
    running: 'bg-info progress-bar-striped progress-bar-animated'
}
const Progress = (process: any) => {
    const progress = (process.totalDocuments ? process.processedDocuments / process.totalDocuments : 1) * 100
    return (
        <div className="progress">
            <div className={`progress-bar ${ProgressColor[process.status]}`} role="progressbar" style={{ width: `${progress}%` }} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}></div>
        </div>
    )
}

const Process = (process: any) => {
    const date = new Date(process.updatedAt)
    return (
        <React.Fragment>
            <div className="d-flex w-100 justify-content-between">
                <ProcessTitle {...process} />
                <small>{date.toLocaleString()}</small>
            </div>
            <p className="mb-1">
                Generación de emails de <strong style={{
                    color: colors(process.entityId.toString())[0]
                }}>Grupo{process.entityId}</strong>.
            </p>
            <Progress {...process} />
            <div title={JSON.stringify(process, null, 2)}>
                {process.error && <small>Error: {process.error}.</small>}
                {!process.error && <small>Se generaron <strong style={{ color: colors(process.emailsGenerated.toString())[0] }}>{process.emailsGenerated}</strong> emails.</small>}
                <ErrorsInfo {...process} />
            </div>
        </React.Fragment>
    )
}

const ErrorsInfo = (process: any) => {
    const count = Object.keys(process.processError).length
    if (!count) return null
    return <small> Errores: {count}</small>
}

const ProcessTitle = connect((state: any) => ({ selected: state.data.selected }), md2p)((process: any) => (
    <h5 className="mb-1" onClick={() => {
        const action = enqueue(process.client, process.entityId)
        action(process.dispatch)
    }}>
        <span className="badge" style={{
            backgroundColor: colors(process.client)[0],
            color: colors(process.client)[1]
        }}>{process.client}</span>
        <small className="ms-2 u-clientName" style={{
            color: colors(process.client)[0]
        }}>{process?.clientData?.name}</small>
    </h5>
))

const ListItemClass: any = {
    //done: 'list-group-item-success',
    error: 'list-group-item-danger'
}
const List = (props: any) => {
    return (
        <ul className="list-group">
            {props.items.map((process: any) => {
                const [c0] = colors(process.client)
                const selected = process.key === props.selected
                const style: any = {
                    cursor: 'pointer',
                    //borderRight: selected && `10px solid ${c0}`,
                    borderLeft: selected && `1rem solid ${c0}`,
                }
                return (
                    <li style={style} key={process.key} className={`list-group-item ${ListItemClass[process.status]}`} onClick={() => selectProcess(props.selected === process.key ? null : process.key)(props.dispatch)}>
                        <Process {...process} />
                    </li>
                )
            })}
        </ul >
    )
}

export default connect(ms2p, md2p)(List)