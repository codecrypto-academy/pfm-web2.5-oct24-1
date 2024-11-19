export class CommandBuilder {
    private static getBootnodeCommand(params: { ipBootNode: string, subnet: string }): string[] {
        const { ipBootNode, subnet } = params
        return [
            `-addr=${ipBootNode}:30301`,
            '-nodekey=/eth/boot.key',
            `-netrestrict=${subnet}`,
        ];
    }

    private static getMinerCommand(params: { chainId: number; ipNode: string; subnet: string; bootnodeEnode: string; addressNode: string }): string[] {
        const { chainId, ipNode, subnet, bootnodeEnode, addressNode } = params;
        return [
            `--networkid=${chainId}`,
            '--mine',
            `--miner.etherbase=0x${addressNode}`,
            `--bootnodes=${bootnodeEnode}`,
            `--nat=extip:${ipNode}`,
            `--netrestrict=${subnet}`,
            `--unlock=${addressNode}`,
            `--password=/root/.ethereum/password.txt`
        ];
    }

    private static getRpcCommand(params: { chainId: number; ipNode: string; subnet: string; bootnodeEnode: string; portNode: number }): string[] {
        const { chainId, ipNode, subnet, bootnodeEnode, portNode } = params;
        return [
            `--networkid=${chainId}`,
            '--http',
            '--http.addr=0.0.0.0',
            `--http.port=${portNode}`,
            '--http.corsdomain="*"',
            '--http.api="admin,eth,debug,miner,net,txpool,personal,web3"',
            `--netrestrict=${subnet}`,
            `--bootnodes=${bootnodeEnode}`,
            `--nat=extip:${ipNode}`
        ];
    }

    private static getNormalCommand(params: { chainId: number, ipNode: string, subnet: string, bootnodeEnode: string }): string[] {
        const { chainId, ipNode, subnet, bootnodeEnode } = params
        return [
            `--networkid=${chainId}`,
            `--bootnodes=${bootnodeEnode}`,
            `--nat=extip:${ipNode}`,
            `--netrestrict=${subnet}`
        ];
    }

    static getCommand(commandType: 'bootnode' | 'miner' | 'rpc' | 'normal', params: any): string[] {
        switch(commandType) {
            case 'bootnode':
                if(!params.ipBootNode || !params.subnet) {
                    throw new Error("Missing required parameters for bootnode command")
                }
                return this.getBootnodeCommand(params)

            case 'miner':
                if(!params.chainId  || !params.ipNode || !params.subnet || !params.bootnodeEnode || !params.addressNode) {
                    throw new Error("Missing required parameters for miner command")
                }
                return this.getMinerCommand(params)

            case 'rpc':
                if(!params.chainId || !params.ipNode || !params.subnet || !params.bootnodeEnode || !params.portNode) {
                    throw new Error("Missing required parameters for RPC command")
                }
                return this.getRpcCommand(params)

            case 'normal':
                if(!params.chainId || !params.ipNode || !params.subnet || !params.bootnodeEnode) {
                    throw new Error("Missing required parameters for normal command")
                }
                return this.getNormalCommand(params)
            
            default:
                throw new Error("Invalid command type")
        }
    }
}