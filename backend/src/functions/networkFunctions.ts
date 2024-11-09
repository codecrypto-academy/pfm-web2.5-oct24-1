import { Network } from '../types/network'
import { Request, Response } from 'express'
import { isNetworkArray } from '../validations/networkValidations'
import { GenesisFile, GenesisConfig, GenesisAlloc } from '../types/genesis'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

// Definir rutas base
const BASE_DIR = path.join(process.cwd()) // Directorio raíz del proyecto
const NETWORKS_DIR = path.join(BASE_DIR, 'networks')
const NETWORKS_FILE = path.join(BASE_DIR, 'src', 'data', 'networks.json')

// El directorio networks existe
if (!fs.existsSync(NETWORKS_DIR)) {
    fs.mkdirSync(NETWORKS_DIR, { recursive: true })
}

function generateGenesisFile(network: Network): GenesisFile {
    const config: GenesisConfig = {
        chainId: network.chainId,
        homesteadBlock: 0,
        eip150Block: 0,
        eip155Block: 0,
        eip158Block: 0,
        byzantiumBlock: 0,
        constantinopleBlock: 0,
        petersburgBlock: 0,
        istanbulBlock: 0,
        berlinBlock: 0,
        londonBlock: 0,
        ethash: {}
    }

    const alloc: GenesisAlloc = {}
    network.alloc.forEach(allocation => {
        alloc[allocation.address] = {
            balance: allocation.value.toString() + "000000000000000000"
        }
    })

    return {
        config,
        difficulty: "1",
        gasLimit: "8000000",
        extradata: "0x0000000000000000000000000000000000000000000000000000000000000000",
        alloc
    }
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

export async function addNetwork(req: Request, res: Response) {
    try {
        // 1. Leer el archivo de redes existente
        const data = fs.readFileSync(NETWORKS_FILE, 'utf8')
        const networks: Network[] = JSON.parse(data)
        
        // 2. Validar la nueva red desde el body
        const newNetwork: Network = req.body
        if (!isNetworkArray([newNetwork])) {
            return res.status(400).send('Invalid network data')
        }

        // 3. Verificar que el ID no exista
        if (networks.some(net => net.id === newNetwork.id)) {
            return res.status(400).send('Network ID already exists')
        }

        // 4. Agregar la nueva red al archivo networks.json
        networks.push(newNetwork)
        fs.writeFileSync(NETWORKS_FILE, JSON.stringify(networks, null, 2))

        res.status(201).send({
            message: 'Network added successfully',
            network: newNetwork
        })

    } catch (error) {
        console.error('Error adding network:', error)
        res.status(500).send(`Error adding network: ${error.message}`)
    }
}

export async function startNetwork(req: Request, res: Response){
    // 1. Leer el archivo de redes existente
    const data = fs.readFileSync(NETWORKS_FILE, 'utf8')
    const networks: Network[] = JSON.parse(data)

    // 2. verificar que la red exista
    if(!networks.some(network => network.id === req.params.id)){
        return res.status(400).send("Network doen't exist")
    }
    
    // 3. Obtener la red
    const network = networks.find(network => network.id === req.params.id)

    // 4. Crear el directorio específico para la red
    const networkDir = path.join(NETWORKS_DIR, network.id)
    fs.mkdirSync(networkDir, { recursive: true })

    // 5. Generar y guardar el archivo genesis
    const genesis = generateGenesisFile(network)
    const genesisPath = path.join(networkDir, 'genesis.json')
    fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2))

    // 6. Generar el password y guardar el archivo password
    const passwordPath = path.join(networkDir, 'password.txt')
    fs.writeFileSync(passwordPath, "123456",)

    // 6. Inicializar el bootnode
    try {
        const bootnodeDir = path.join(NETWORKS_DIR, network.id, "bootnode")
        fs.mkdirSync(bootnodeDir,{recursive: true})
        await execAsync(`docker run --rm -v "${networkDir}:/root" ethereum/client-go:alltools-v1.13.15 sh -c "geth account new --password /root/password.txt --datadir /root/bootnode &&  bootnode -genkey /root/bootnode/boot.key -writeaddress > /root/bootnode/public.key"`)
    } catch (error) {
        console.error('Error initializing bootnode', error)
        // Limpiar el directorio creado si hay error
        fs.rmSync(networkDir, { recursive: true, force: true })
        res.status(500).send('Failed to initialize bootnode')
    }
    // Se crea el bootnode
    try {
        await execAsync(`docker run -d --name bootnode -v "${networkDir}:/root" ethereum/client-go:alltools-v1.13.15 bootnode -nodekey /root/bootnode/boot.key`)
    } catch (error) {
        console.error('Error running the bootnode', error)
        fs.rmSync(networkDir, { recursive: true, force: true })
        res.status(500).send('Failed to run the bootnode')
    }
    return res.send({message: "Network started successfully"})
} 

// Mantener las funciones existentes
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