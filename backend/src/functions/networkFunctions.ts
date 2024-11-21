import { Network } from '../types/network';
import { Request, Response } from 'express';
import { isNetworkArray, validateNetwork, isNetwork } from '../validations/networkValidations';
import { GenesisFile, GenesisConfig } from '../types/genesis';
import fs from 'fs';
import path, { join } from 'path';
import { DockerService } from '../services/DockerService';

const GETH_VERSION = 'v1.13.15';

// Definir rutas base
const BASE_DIR = path.join(process.cwd());
const NETWORKS_DIR = path.join(BASE_DIR, 'networks');
const NETWORKS_FILE = path.join(BASE_DIR, 'data', 'networks.json');

// El directorio networks existe
if (!fs.existsSync(NETWORKS_DIR)) {
    fs.mkdirSync(NETWORKS_DIR, { recursive: true });
}

function generateExtradata(addresses: string[]): string{
    // validate addresses
    const addressRegex = /^[a-fA-F0-9]{40}$/ // Regex to match a 40-character hexadecimal string
    for (let address of addresses) {
        console.log(address)
        if (!addressRegex.test(address)) {
            throw new Error('one of the addresses is not a 40-character hexadecimal string')
        }
    }

    const zerosFront = "00".repeat(32) //32-bytes of zeroes
    const zerosBack = "00".repeat(65) // 65-bytes of zeroes
    const joinedAddresses = addresses.join('')
    const extradata = '0x' + zerosFront + joinedAddresses + zerosBack
    
    return extradata       
}

function generateGenesisFile(network: Network, addresses: string[]): GenesisFile {
    const config: GenesisConfig = {
        chainId: network.chainId,
        homesteadBlock: 0,
        eip150Block: 0,
        eip155Block: 0,
        eip158Block: 0,
        byzantiumBlock: 0,
        constantinopleBlock: 0,
        petersburgBlock: 0,
        clique: {
            "period": 15,
            "epoch": 30000
        }
    };

    const alloc: { [key: string]: { balance: string } } = {};
    network.alloc.forEach(allocation => {
        const balanceInWei = BigInt(allocation.value) * BigInt(10**18);
        alloc[allocation.address] = {
            balance: balanceInWei.toString()
        };
    });

    const extradata = generateExtradata(addresses)
    return {
        config,
        difficulty: "1",
        gasLimit: "8000000",
        extradata,
        alloc
    };
}

export function listNetworks(req: Request, res: Response) {
    try {
        const data = fs.readFileSync(NETWORKS_FILE, 'utf8')
        const networks: Network[] = JSON.parse(data)
        
        if(isNetworkArray(networks)) {
            res.send(networks)
        } else {
            res.status(500).send('Error: the networks.json file has an error')
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

function validateBody(body: any): Network {
    console.log('New network data: ', JSON.stringify(body, null, 2))
    if(!isNetwork(body)) {
        throw new Error('Invalid network format')
    }
    return body as Network
}

export async function createNetwork(req: Request, res: Response) {
    const docker = new DockerService()
    const backupFile = path.join(process.cwd(), 'data', 'networks.json.backup');
    const tempFile = path.join(process.cwd(), 'data', 'networks.json.temp');
    const addresses: string[] = []
    let newNetwork: Network | null = null;  // Declarar fuera del try

    try {
        console.log('\n=== STARTING NETWORK CREATION PROCESS ===');

        // 1. Validar formato básico de la nueva red
        newNetwork = validateBody(req.body)

        // 2. Asegurarse de que el directorio data existe
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // 3. Leer redes existentes y crear backup
        let existingNetworks: Network[] = [];
        
        if (fs.existsSync(NETWORKS_FILE)) {
            try {
                // Crear backup
                fs.copyFileSync(NETWORKS_FILE, backupFile);
                console.log('Created backup of networks.json');

                // Leer contenido actual
                const fileContent = fs.readFileSync(NETWORKS_FILE, 'utf8');
                existingNetworks = JSON.parse(fileContent);
                console.log('Current networks:', existingNetworks);
            } catch (error) {
                console.error('Error reading networks.json:', error);
                throw new Error('Failed to read current networks configuration');
            }
        } else {
            // Si no existe, crear archivo con array vacío
            fs.writeFileSync(NETWORKS_FILE, JSON.stringify([], null, 2));
            console.log('Created new networks.json file');
        }

        // 4. Validaciones
        if (!isNetwork(newNetwork)) {
            throw new Error('Invalid network format');
        }

        const validationErrors = validateNetwork(newNetwork, existingNetworks);
        if (validationErrors.length > 0) {
            console.log('Validation errors:', validationErrors);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // 5. Crear estructura de directorios
        const networkDir = path.join(NETWORKS_DIR, newNetwork.id);
        console.log(`Creating network directory at: ${networkDir}`);

        if (fs.existsSync(networkDir)) {
            fs.rmSync(networkDir, { recursive: true, force: true });
        }
        
        fs.mkdirSync(networkDir, { recursive: true });

        // 6. Crear y generar password
        console.log('Creating password')
        const passwordPath = path.join(networkDir, 'password.txt')
        fs.writeFileSync(passwordPath, '123456')

        // 7. Inicializar bootnode
        console.log(`Initializing bootnode`);
        const bootnodeDir = path.join(networkDir, 'bootnode')
        fs.mkdirSync(bootnodeDir, { recursive: true})
        const bootnodePasswordPath = path.join(bootnodeDir, 'password.txt');
        fs.copyFileSync(passwordPath, bootnodePasswordPath);
        
        try {
            await docker.initializeBootnode(newNetwork.id)
        } catch (error) {
            throw new Error(`Failed to initialize bootnode: ${error.message}`)
        }

        // 8. Crear carpetas de los nodos y cuentas de los nodos mineros
        for (const node of newNetwork.nodes) {
            const nodeDir = path.join(networkDir, node.name);
            fs.mkdirSync(nodeDir, { recursive: true });
            
            // crea una cuanta si el nodo es minero
            if (node.type == 'miner'){
                const nodePasswordPath = path.join(nodeDir, 'password.txt')
                fs.copyFileSync(passwordPath, nodePasswordPath)
                try {
                    const address = await docker.createNodeAccount(newNetwork.id, node.name)
                    addresses.push(address)
                } catch (error) {
                    throw new Error(`Failed to create miner ${node.name} node: ${error.message}`)
                }
            }
        }

        // 9. Crear y guardar el fichero genesis
        console.log(`Creating genesis file`);
        const genesis = generateGenesisFile(newNetwork, addresses);
        console.log(JSON.stringify(genesis, null, 2))
        const genesisPath = path.join(networkDir, 'genesis.json');
        fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2));

        // 10. Copiar el fichero genesis en la carpeta del bootnode
        const bootnodeGenesisPath = path.join(bootnodeDir, 'genesis.json');
        fs.copyFileSync(genesisPath, bootnodeGenesisPath);

        // 11. Inicializar los nodos
        for (const node of newNetwork.nodes) {
            const nodeDir = path.join(networkDir, node.name);
            // copia el fichero genesis en la carpeta de los nodos
            const nodeGenesisPath = path.join(nodeDir, 'genesis.json');
            fs.copyFileSync(genesisPath, nodeGenesisPath);
            // inicializa los nodos
            try {
                console.log(`Initializing genesis block in ${node.name}`)
                await docker.initializeGenesisBlock(newNetwork.id, node.name)
            } catch (error) {
                throw new Error(`Failed to initialize node ${node.name}: ${error.message}`);
            }
        }

        // 10. Actualizar networks.json de manera segura
        try {
            console.log('Updating networks.json...');
            // Agregar la nueva red al array
            existingNetworks.push(newNetwork);
        
            // Escribir directamente al archivo final sin usar archivo temporal
            const networkData = JSON.stringify(existingNetworks, null, 2);
            
            // Escribir de manera síncrona
            fs.writeFileSync(NETWORKS_FILE, networkData, { encoding: 'utf8', flag: 'w' });
            
            // Verificar inmediatamente que se escribió correctamente
            const verificationContent = fs.readFileSync(NETWORKS_FILE, 'utf8');
            const verifiedNetworks = JSON.parse(verificationContent);
            
            if (verifiedNetworks.length !== existingNetworks.length) {
                throw new Error('Network save verification failed');
            }
        
            console.log(`Successfully wrote ${verifiedNetworks.length} networks to file`);
            
            // Eliminar el backup si todo salió bien
            if (fs.existsSync(backupFile)) {
                fs.unlinkSync(backupFile);
            }
        
        } catch (error) {
            console.error('Error updating networks.json:', error);
            // Restaurar backup si existe
            if (fs.existsSync(backupFile)) {
                try {
                    fs.copyFileSync(backupFile, NETWORKS_FILE);
                    console.log('Restored backup file');
                } catch (restoreError) {
                    console.error('Error restoring backup:', restoreError);
                }
            }
            throw new Error(`Failed to update networks configuration: ${error.message}`);
        }

        console.log('\n=== NETWORK CREATION COMPLETED SUCCESSFULLY ===');
        res.status(201).json({
            message: 'Network created successfully',
            network: newNetwork,
            genesis: genesis
        });

    } catch (error) {
        console.error('\n=== ERROR CREATING NETWORK ===', error);
        
        // Limpiar directorio de red si se creó
        if (newNetwork?.id) {
            const networkDir = path.join(NETWORKS_DIR, newNetwork.id);
            if (fs.existsSync(networkDir)) {
                fs.rmSync(networkDir, { recursive: true, force: true });
            }
        }
        
        // Restaurar backup si existe
        if (fs.existsSync(backupFile)) {
            fs.copyFileSync(backupFile, NETWORKS_FILE);
        }

        // Enviar error a cliente
        res.status(500).json({
            error: 'Error creating network',
            details: error.message
        });
    } finally {
        // Limpiar archivos temporales
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        if (fs.existsSync(backupFile)) {
            fs.unlinkSync(backupFile);
        }
    }
}

export function networkDetails(req: Request, res: Response) {
    const networkId = req.params.id
    try {
        const data = fs.readFileSync(NETWORKS_FILE, 'utf8')
        const networks: Network[] = JSON.parse(data)
        if(isNetworkArray(networks)) {
            const network = networks.find(net => net.id === networkId)
            if (!network) {
                return res.status(404).send('Network not found')
            }
            res.send(network)
        } else {
            res.status(500).send('Error: the networks.json file has an error')
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

export async function startNetwork(req: Request, res: Response) {
    const networkId = req.params.id
    try {
        const data = fs.readFileSync(NETWORKS_FILE, "utf8")
        const networks: Network[] = JSON.parse(data)
        const network = networks.find((net) => net.id === networkId)
        
        if (!network) {
            return res.status(404).send("Network not found")
        }

        // Iniciar la red
        const docker = new DockerService()

        // Inicializar los nodos
        await docker.startNetwork(network)

        res.status(200).send({
            message: `Network ${networkId} started successfully`
        })

    } catch (error) {
        console.error("Error starting network:", error)
        res.status(500).send(`Error starting network: ${error.message}`)
    }
}

export function deleteNetwork(req: Request, res: Response) {
    const networkId = req.params.id;
    try {
        const data = fs.readFileSync(NETWORKS_FILE, 'utf8');
        let networks: Network[] = JSON.parse(data);

        // Encontrar la red por su ID
        const networkIndex = networks.findIndex(net => net.id === networkId);
        if (networkIndex === -1) {
            return res.status(404).json({ message: 'Red no encontrada' });
        }

        // Eliminar la red del array
        const [deletedNetwork] = networks.splice(networkIndex, 1);

        // Actualizar el archivo networks.json
        fs.writeFileSync(NETWORKS_FILE, JSON.stringify(networks, null, 2));

        // Opcional: Eliminar la carpeta asociada a la red
        const networkDir = path.join(NETWORKS_DIR, networkId);
        if (fs.existsSync(networkDir)) {
            fs.rmSync(networkDir, { recursive: true, force: true });
        }

        res.status(200).json({ message: 'Red eliminada correctamente', network: deletedNetwork });
    } catch (error) {
        console.error('Error al eliminar la red:', error);
        res.status(500).json({ message: 'Error al eliminar la red', error: error.message });
    }
}
