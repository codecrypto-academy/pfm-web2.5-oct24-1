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

export async function createNetwork(req: Request, res: Response) {
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

        // 4. Crear el directorio específico para la red
        const networkDir = path.join(NETWORKS_DIR, newNetwork.id)
        fs.mkdirSync(networkDir, { recursive: true })

        // 5. Generar y guardar el archivo genesis
        const genesis = generateGenesisFile(newNetwork)
        const genesisPath = path.join(networkDir, 'genesis.json')
        fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2))

        // 6. Inicializar el directorio de datos para el bootnode
        try {
            await execAsync(`docker run --rm -v "${networkDir}:/eth" ethereum/client-go:alltools-latest init /eth/genesis.json`)
        } catch (error) {
            console.error('Error initializing geth:', error)
            // Limpiar el directorio creado si hay error
            fs.rmSync(networkDir, { recursive: true, force: true })
            throw new Error('Failed to initialize geth directory')
        }

        // 7. Agregar la nueva red al archivo networks.json
        networks.push(newNetwork)
        fs.writeFileSync(NETWORKS_FILE, JSON.stringify(networks, null, 2))

        res.status(201).send({
            message: 'Network created successfully',
            network: newNetwork
        })

    } catch (error) {
        console.error('Error creating network:', error)
        res.status(500).send(`Error creating network: ${error.message}`)
    }
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