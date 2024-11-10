import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';
import { Node } from '../types/node';
import { Network } from '../types/network';

export class DockerService {
    private docker: Docker;
    private readonly NETWORKS_DIR: string;
    private readonly GETH_VERSION = 'v1.13.15';
    private readonly GETH_IMAGE = 'ethereum/client-go';

    constructor() {
        this.docker = new Docker();
        this.NETWORKS_DIR = path.join(process.cwd(), 'networks');
    }

    async pullGethImage(): Promise<void> {
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_VERSION}`;
        console.log('Pulling Geth ${this.GETH_IMAGE} ${this.GETH_VERSION}...');
        try {
            await new Promise((resolve, reject) => {
            this.docker.pull(imageTag, (error:any, stream: any) => {
                if (error) {
                    return reject(error);
                }
                this.docker.modem.followProgress(stream, (error:any, output:any) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(output);
                });
            });
        });

        } catch (error) {
            throw new Error(`Failed to pull Geth image: ${error.message}`);
        }
    }

    private getBootnodeCommand(networkId: string, ipBootNode: string): string[] {
        return [
            '--nodekeyhex=91db994584cf2565fa19d0f6980696f06822a8cf78c8085f95f4f7839878b1cb',
            `--netrestrict=${ipBootNode}/24`,
            '--nat=extip:127.0.0.1',
            '--verbosity=3'
        ];
    }

    private getMinerCommand(bootnodeEnode: string): string[] {
        return [
            '--mine',
            '--miner.threads=1',
            '--miner.etherbase=0x0000000000000000000000000000000000000000',
            `--bootnodes=${bootnodeEnode}`,
            '--http',
            '--http.api=eth,web3,net,admin,personal',
            '--http.addr=0.0.0.0',
            '--http.corsdomain=*',
            '--nat=extip:127.0.0.1',
            '--verbosity=3'
        ];
    }

    private getRpcCommand(bootnodeEnode: string, port: number): string[] {
        return [
            '--http',
            '--http.api=eth,web3,net,admin,personal',
            '--http.addr=0.0.0.0',
            `--http.port=${port}`,
            '--http.corsdomain=*',
            `--bootnodes=${bootnodeEnode}`,
            '--nat=extip:127.0.0.1',
            '--verbosity=3'
        ];
    }

    private getNormalCommand(bootnodeEnode: string): string[] {
        return [
            `--bootnodes=${bootnodeEnode}`,
            '--nat=extip:127.0.0.1',
            '--verbosity=3'
        ];
    }

    async startBootnode(networkId: string, ipBootNode: string): Promise<string> {
        const networkDir = path.join(this.NETWORKS_DIR, networkId);
        const containerName = `${networkId}-bootnode`;
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_VERSION}`;

        try {

        //Verificar si el contenedor ya existe
        const existingContainer = await this.docker.getContainer(containerName);
        try {
            await existingContainer.stop();
            await existingContainer.remove( { force: true });
            console.log(`Removed existing bootnode container: ${containerName}`);
        }
        catch (error) {
            console.log(`No existing bootnode container found: ${containerName}`);
        }

        const container = await this.docker.createContainer({
            Image: imageTag,
            name: containerName,
            Cmd: this.getBootnodeCommand(networkId, ipBootNode),
            HostConfig: {
                Binds: [`${networkDir}:/eth`],
                NetworkMode: networkId
            }
        });

        await container.start();
        console.log(`Started bootnode container: ${containerName}`);

        // Esperar unos segundos para que el bootnode se inicie completamente
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Retornar el enode URL del bootnode
        return `enode://91db994584cf2565fa19d0f6980696f06822a8cf78c8085f95f4f7839878b1cb@${ipBootNode}:30303`;
    } catch (error) {
        throw new Error(`Failed to start bootnode: ${error.message}`);
    }
    }

    async startNode(
        networkId: string, 
        node: Node, 
        bootnodeEnode: string
    ): Promise<void> {
        const networkDir = path.join(this.NETWORKS_DIR, networkId);
        const containerName = `${networkId}-${node.name}`;
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_VERSION}`;

        try {
            //Verificar si el contenedor ya existe
            const existingContainer = this.docker.getContainer(containerName);
            try {
                await existingContainer.stop();
                await existingContainer.remove( { force: true });
                console.log(`Removed existing ${node.type} node container: ${containerName}`);
            }
            catch (error) {
                console.log(`No existing ${node.type} node container found: ${containerName}`);
            }
        
        let cmd: string[];
        switch (node.type) {
            case 'miner':
                cmd = this.getMinerCommand(bootnodeEnode);
                break;
            case 'rpc':
                cmd = this.getRpcCommand(bootnodeEnode, node.port || 8545);
                break;
            default:
                cmd = this.getNormalCommand(bootnodeEnode);
        }

        const container = await this.docker.createContainer({
            Image: imageTag,
            name: containerName,
            Cmd: cmd,
            HostConfig: {
                Binds: [`${networkDir}:/eth`],
                NetworkMode: networkId,
                PortBindings: node.port ? {
                    [`${node.port}/tcp`]: [{ HostPort: `${node.port}` }]
                } : undefined
            }
        });

        await container.start();
        console.log(`Started ${node.type} node container: ${containerName}`);
    } catch (error) {
        throw new Error(`Failed to start ${node.type} node: ${error.message}`);
    }
}
    async createDockerNetwork(networkId: string, subnet: string): Promise<void> {
        try {
            try {
                const Network = await this.docker.getNetwork(networkId);
                await Network.remove();
                console.log(`Removed existing Docker network: ${networkId}`);
            } catch (error) {
                console.log(`No existing Docker network found: ${networkId}`);
            }

            await this.docker.createNetwork({
                Name: networkId,
                Driver: 'bridge',
                IPAM: {
                    Config: [{ Subnet: subnet }],
                    Driver: 'default'
                }
            });
            console.log(`Created Docker network: ${networkId}`);
        } catch (error) {
            throw new Error(`Failed to create Docker network: ${error.message}`);
        }
    }

    async startNetwork(network: Network): Promise<void> {
        try {

            console.log(`Starting network ${network.id}...`);

            // 1. Asegurarse de que la imagen de Geth está disponible
            await this.pullGethImage();

            // 2. Crear la red Docker
            await this.createDockerNetwork(network.id, network.subnet);

            // 3. Iniciar el bootnode
            const bootnodeEnode = await this.startBootnode(network.id, network.ipBootNode);

            // 3. Iniciar los nodos
            for (const node of network.nodes) {
                await this.startNode(network.id, node, network.ipBootNode);
                // Esperar un poco entre cada nodo para evitar problemas de inicio
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`Network ${network.id} started successfully`);
        } catch (error) {
            throw new Error(`Failed to start network: ${error.message}`);
        }
    }
}