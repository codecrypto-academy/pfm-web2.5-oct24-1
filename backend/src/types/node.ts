export type typeOptions = 'rpc' | 'miner' | 'normal'

export interface Node {
    id: string,
    type:typeOptions
    ip: string, 
    port?: number
}