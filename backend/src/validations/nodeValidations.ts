import { Node, typeOptions } from '../types/node'

function isTypeOptions(data: any): data is typeOptions {
    return(
        data === 'rpc' || 
        data === 'miner' ||
        data === 'normal'
    )
}

export function isNode(data: any): data is Node {
    return(
        typeof data === 'object' &&
        isTypeOptions(data.type) &&
        typeof data.name === 'string' &&
        typeof data.ip === 'string' &&
        (typeof data.port === 'number' || data.port == null)
    )
}

export function isNodeArray(data: any): data is Node[] {
    return(Array.isArray(data) && data.every(isNode))
}