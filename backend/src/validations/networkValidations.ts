import { Network } from '../types/network'
import { isAllocArray } from './allocValidations'
import { isNodeArray } from './nodeValidations'

export function isNetwork(data: any): data is Network {
    return(
        typeof data === 'object' &&
        typeof data.id === 'string' &&
        typeof data.chainId === 'number' &&
        typeof data.subnet === 'string' &&
        typeof data.ipBootNode === 'string' &&
        isAllocArray(data.alloc) &&
        isNodeArray (data.nodes)
    )
}

export function isNetworkArray(data: any): data is Network[] {
    return(Array.isArray(data) && (data.every(isNetwork) || data.length === 0))
}