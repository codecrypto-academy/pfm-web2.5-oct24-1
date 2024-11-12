export type typeOptions = 'rpc' | 'miner' | 'normal'

export interface Node {
    name: string,
    id: string,
    type:typeOptions
    ip: string, 
    port?: number | null
}

export interface RPCNode extends Node {
    type: 'rpc',
    port: number
}

export interface MinerNode extends Node {
    type: 'miner'
}

export interface NormalNode extends Node {
    type: 'normal'
}