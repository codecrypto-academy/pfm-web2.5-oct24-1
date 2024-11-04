export interface Node {
    id: string,
    type: 'rpc' | 'miner' | 'normal'
    ip: string, 
    port: number
}