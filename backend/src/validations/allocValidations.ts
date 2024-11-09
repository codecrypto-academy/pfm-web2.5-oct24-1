import { Alloc } from '../types/alloc'

function isAlloc(data: any): data is Alloc {
    return(
        typeof data === 'object' &&
        typeof data.address === 'string' &&
        typeof data.value === 'number'
    )
}

export function isAllocArray(data: any): data is Alloc[] {
    return(Array.isArray(data) && data.every(isAlloc))
}