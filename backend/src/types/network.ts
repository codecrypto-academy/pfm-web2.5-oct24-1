import { Alloc } from './alloc'
import { Node } from './node'

export interface Network {
    id: string,
    chainId: number,
    subnet: string,
    ipBootNode: string,
    alloc: Alloc[],
    nodes: Node[]
}