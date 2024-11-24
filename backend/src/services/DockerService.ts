import Docker, { Config } from 'dockerode';
import fs from 'fs';
import path from 'path';
import { Node } from '../types/node';
import { Network } from '../types/network';
import { CommandBuilder } from './CommandBuilder';

export class DockerService {
    private docker: Docker;
    private readonly NETWORKS_DIR: string;
    private readonly GETH_VERSION = 'v1.13.15';
    private readonly GETH_ALLTOOLS_VERSION = 'alltools-v1.13.15'
    private readonly GETH_IMAGE = 'ethereum/client-go';

    constructor() {
        this.docker = new Docker();
        this.NETWORKS_DIR = path.join(process.cwd(), 'networks');
    }

    async pullGethImage(): Promise<void> {
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_VERSION}`;
        console.log(`Pulling Geth ${this.GETH_IMAGE} ${this.GETH_VERSION}...`);
        try {
            await new Promise((resolve, reject) => {
                this.docker.pull(imageTag, (error: any, stream: any) => {
                    if (error) {
                        return reject(error);
                    }
                    this.docker.modem.followProgress(stream, (error: any, output: any) => {
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

    public async removeExistingContainer(containerName: string): Promise<void> {
        const existingContainer = this.docker.getContainer(containerName);
        try {
            console.log(`Checking if ${containerName} already exists`)
            const containerInfo = await existingContainer.inspect()
            const currentContainerState = containerInfo.State.Status
            console.log(`Status of the container ${containerName}: ${currentContainerState}`)
            switch (currentContainerState) {
                case 'restarting':
                case 'running':
                    console.log(`Stopping container: ${containerName}...`)
                    await existingContainer.stop();
                    break

                case 'paused':
                    console.log(`Unpausing container: ${containerName}...`)
                    await existingContainer.unpause()
                    console.log(`Stopping container: ${containerName}...`)
                    await existingContainer.stop()
                    break

                case 'created':
                case 'exited':
                case 'dead':
                    console.log(`Container is already stopped: ${containerName}`)
                    break

                default:
                    console.log(`Unkown container state: ${containerName}`)
            }
            console.log(`Removing container: ${containerName}`)
            await existingContainer.remove({ force: true })
            console.log(`Container has been removed successfully: ${containerName}`)
        } catch (error) {
            if (error.statusCode === 404) {
                console.log(`Container ${containerName} not found`)
            } else {
                console.log(`Error removing container: ${containerName} : ${error.message}`)
            }
        }
    }


    // creates a node account and returns the address string
    async createNodeAccount(networkId: string, nodeName: string): Promise<string> {
        const nodeDir = path.join(this.NETWORKS_DIR, networkId, nodeName)
        const containerName = `${networkId}-${nodeName}-init`
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_VERSION}`
        try {
            //Verificar si el contenedor ya existe
            await this.removeExistingContainer(containerName)

            const container = await this.docker.createContainer({
                Image: imageTag,
                name: containerName,
                Tty: true,
                Entrypoint: ['geth'],
                Cmd: [
                    '--password=/eth/password.txt',
                    '--datadir=/eth',
                    'account', 'new'
                ],
                HostConfig: {
                    AutoRemove: true,
                    Binds: [`${nodeDir}:/eth`]
                }
            })
            await container.start()

            // capture logs and extract the account address
            const stream = await container.logs({ follow: true, stdout: true, stderr: true })
            const addressRegex = /Public address of the key:\s*(0x[a-fA-F0-9]+)/

            let accountAddress: string = null
            stream.on('data', (data) => {
                const logData = data.toString()
                console.log(logData)

                const match = addressRegex.exec(logData)
                if (match && match[1]) {
                    accountAddress = match[1].replace(/^0x/, '')
                }
            })
            // wait for the container to stop
            await container.wait()
            console.log(`${nodeName} account created`)
            if (accountAddress) {
                console.log(`${nodeName} addres: ${accountAddress}`)
                return accountAddress
            } else {
                throw new Error('Failed to extract account addres from logs')
            }
        } catch (error) {
            throw new Error(`Error creating ${nodeName} account: ${error.message}`);
        }
    }

    async initializeGenesisBlock(networkId: string, nodeName: string) {
        const nodeDir = path.join(this.NETWORKS_DIR, networkId, nodeName)
        const containerName = `${networkId}-${nodeName}-init`
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_VERSION}`

        try {
            //Verificar si el contenedor ya existe
            await this.removeExistingContainer(containerName)

            // Create and start the container with the Geth init command
            const container = await this.docker.createContainer({
                Image: imageTag,
                name: containerName,
                Tty: true,
                Entrypoint: ['geth'],
                Cmd: ['init', '--datadir', '/eth', '/eth/genesis.json'],
                HostConfig: {
                    AutoRemove: true,
                    Binds: [`${nodeDir}:/eth`], // Mount the host directory to /eth in the container
                },
            });

            await container.start();
            const stream = await container.logs({ follow: true, stdout: true, stderr: true })
            stream.on('data', (data) => { console.log(data.toString()) })
            const result = await container.wait() // Wait for the container to complete initialization
            if (result.StatusCode !== 0) {
                throw new Error(`Genesis block initialization failed with status code: ${result.StatusCode}`)
            }

            console.log(`Genesis block initialized successfully in ${nodeName}`)
        } catch (error) {
            throw new Error(`Failed to initialize node ${nodeName}: ${error.message}`)
        }
    }

    async initializeBootnodeKeys(networkId: string) {
        const bootnodeDir = path.join(this.NETWORKS_DIR, networkId, 'bootnode')
        const containerName = `${networkId}-bootnode`
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_ALLTOOLS_VERSION}`
        try {
            //Verificar si el contenedor ya existe
            await this.removeExistingContainer(containerName)

            // Crea un contenedor para inicializar las llaves del bootnode
            const container = await this.docker.createContainer({
                Image: imageTag,
                name: containerName,
                Tty: true,
                Entrypoint: ["bootnode"],  // Entrypoint for bootnode command
                Cmd: [
                    "-genkey", "/eth/boot.key",
                    "-writeaddress"
                ],
                HostConfig: {
                    AutoRemove: true,
                    Binds: [
                        `${bootnodeDir}:/eth`
                    ]
                }
            });

            // Start and log output
            await container.start();
            const stream = await container.logs({ follow: true, stdout: true, stderr: true })
            let publicKey = ''
            stream.on('data', data => publicKey += data.toString())
            await container.wait();  // Wait for the container to complete

            const publicKeyPath = path.join(bootnodeDir, 'public.key')
            fs.writeFileSync(publicKeyPath, publicKey.trim())

            console.log(`Bootnode public key written to ${bootnodeDir}`)
            console.log('Bootnode keys initialized successfully')
        } catch (error) {
            throw new Error(`Error initializing bootnode keys: ${error.message}`)
        }
    }

    async initializeBootnode(networkId: string): Promise<void> {
        try {
            await this.createNodeAccount(networkId, 'bootnode')
            await this.initializeBootnodeKeys(networkId)
            console.log('Bootnode initialized successfully')
        } catch (error) {
            throw new Error(`Error initializing bootnode: ${error.message}`)
        }
    }

    async startBootnode(networkId: string, ipBootNode: string, subnet: string): Promise<string> {
        const bootnodeDir = path.join(this.NETWORKS_DIR, networkId, 'bootnode');
        const containerName = `${networkId}-bootnode`;
        const publicKeyPath = path.join(bootnodeDir, 'public.key')
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_ALLTOOLS_VERSION}`;

        try {
            //Verificar si el contenedor ya existe
            await this.removeExistingContainer(containerName);

            const container = await this.docker.createContainer({
                Image: imageTag,
                name: containerName,
                Hostname: containerName,
                Entrypoint: ['bootnode'],
                Cmd: CommandBuilder.getCommand('bootnode', { ipBootNode, subnet }),
                HostConfig: {
                    Binds: [`${bootnodeDir}:/eth`],
                    NetworkMode: networkId
                },
                NetworkingConfig: {
                    EndpointsConfig: {
                        [networkId]: {
                            IPAMConfig: {
                                IPv4Address: ipBootNode
                            }
                        }
                    }
                }
            });

            await container.start();
            console.log(`Started bootnode container: ${containerName}`);

            // Esperar unos segundos para que el bootnode se inicie completamente
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Retornar el enode URL del bootnode
            const bootnodePublicKey = fs.readFileSync(publicKeyPath, 'utf8')
            return `enode://${bootnodePublicKey}@${ipBootNode}:30301`;
        } catch (error) {
            throw new Error(`Failed to start bootnode: ${error.message}`);
        }
    }

    private getNodeAddress(nodeDir: string): string {
        try {
            const folderAddressPath = path.join(nodeDir, 'keystore')
            const files = fs.readdirSync(folderAddressPath)
            const addressFilePath = path.join(folderAddressPath, files[0])
            const addressNode = JSON.parse(fs.readFileSync(addressFilePath, 'utf8')).address
            return addressNode
        } catch (error) {
            throw new Error(`Error reading the node address: ${error.message}`)
        }
    }

    async startNode(params: {
        node: Node,
        chainId: number,
        networkId: string,
        subnet: string,
        bootnodeEnode: string
    }): Promise<void> {
        const { node, chainId, networkId, subnet, bootnodeEnode } = params;

        const networkDir = path.join(this.NETWORKS_DIR, networkId);
        const nodeDir = path.join(networkDir, node.name);

        const containerName = `${networkId}-${node.name}`;
        const imageTag = `${this.GETH_IMAGE}:${this.GETH_VERSION}`;

        try {
            // Verificar si el contenedor ya existe
            await this.removeExistingContainer(containerName);

            let cmd = CommandBuilder.getCommand(
                node.type, {
                chainId,
                ipNode: node.ip,
                subnet, bootnodeEnode,
                portNode: node.port,
                addressNode: node.type === 'miner' ? this.getNodeAddress(nodeDir) : undefined
            }
            );

            // Añadir la opción --ipcdisable para deshabilitar el IPC
            cmd.push('--ipcdisable');

            const container = await this.docker.createContainer({
                Image: imageTag,
                name: containerName,
                Entrypoint: ['geth'],
                Cmd: cmd,
                ExposedPorts: node.port ? {
                    [`${node.port}/tcp`]: {}
                } : undefined,
                HostConfig: {
                    Binds: [`${nodeDir}:/root/.ethereum`],
                    NetworkMode: networkId,
                    PortBindings: node.port ? {
                        [`${node.port}/tcp`]: [{ HostPort: `${node.port}` }]
                    } : undefined
                },
                NetworkingConfig: {
                    EndpointsConfig: {
                        [networkId]: {
                            IPAMConfig: {
                                IPv4Address: node.ip
                            }
                        }
                    }
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
                const network = await this.docker.getNetwork(networkId);
                await network.remove()
                console.log(`Removed existing Docker network: ${networkId}`);
            } catch (error) {
                console.log(`No existing Docker network found: ${networkId}`);
            }

            console.log(`Creating Docker network: ${networkId}`)

            await this.docker.createNetwork({
                Name: networkId,
                Driver: 'bridge',
                CheckDuplicate: true,
                Attachable: true,
                IPAM: {
                    Driver: 'default',
                    Config: [{ Subnet: subnet }],
                },
                Labels: {
                    project: `${networkId} private ethnetwork`
                }
            });
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
            const bootnodeEnode = await this.startBootnode(network.id, network.ipBootNode, network.subnet);

            // 3. Iniciar los nodos
            for (const node of network.nodes) {
                await this.startNode({ node, chainId: network.chainId, networkId: network.id, subnet: network.subnet, bootnodeEnode });
                // Esperar un poco entre cada nodo para evitar problemas de inicio
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            console.log(`Network ${network.id} started successfully`);
        } catch (error) {
            throw new Error(`Failed to start network: ${error.message}`);
        }
    }
}