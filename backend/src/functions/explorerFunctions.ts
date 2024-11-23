import Web3 from 'web3';
import fs from 'fs';
import path, { join } from 'path';
import { Request, Response } from 'express';

const BASE_DIR = path.join(process.cwd());
const NETWORKS_FILE = path.join(BASE_DIR, 'data', 'networks.json');

/*Main routes functions */
export async function getLastBlocks(req: Request, res: Response){
    const web3 = await connectProvider(req.params.id);
    try {
        const { count } = req.query; 
        // Número de bloques que se desea obtener, por defecto 10
        // Conversion de count a numero bigint para hacer la solucion mas robusta
        const blockCount = BigInt(parseInt(count as string, 10) || 10);

        const latestBlockNumber = await web3.eth.getBlockNumber(); // Número del bloque más reciente

        // Obtener los últimos bloques
        const blocks = [];
        for (let i = latestBlockNumber; i > latestBlockNumber - blockCount && i >= BigInt(0); i--) {
            const block = await web3.eth.getBlock(i);
            blocks.push(block);
        }

        // Serializar y enviar los bloques, manejando BigInt
        const replacer = (key: string, value: any) =>
            typeof value === 'bigint' ? value.toString() : value;
        console.log('Obtenidos los bloques de forma exitosa');
        res.send(JSON.stringify(blocks, replacer));
    } catch (error) {
        console.error('Error al obtener los bloques:', error);
        res.status(500).send('Error al obtener los bloques de la red');
    }
}

/* PRIVATES HELPER FUNCTIONS  */
async function connectProvider(networkId:string): Promise<Web3 | null>{
    try {
        const nodePort = await getRpcPort(networkId); // Obtiene el puerto del nodo
        const provider = new Web3.providers.HttpProvider(`http://localhost:${nodePort}`); // Crea el proveedor HTTP
        const web3 = new Web3(provider); // Crea la instancia de Web3
        console.log("Conexion exitosa con el provider");
        return web3; // Retorna la instancia de Web3 si todo fue exitoso
    } catch (error) {
        console.error('Error al conectar al provider', error); // Muestra el error en consola
        return null; // Devuelve null en caso de error
    }
}

async function getRpcPort(networkId: string): Promise<number | null> {
    try {
        // Leer y parsear el archivo networks.json
        const data = await fs.promises.readFile(NETWORKS_FILE, 'utf8');
        const networks = JSON.parse(data);

        // Buscar la red correspondiente por ID
        const network = networks.find((net: any) => net.id === networkId);

        if (!network) {
            throw new Error(`No se encontró la red con ID: ${networkId}`);
        }

        // Buscar el nodo de tipo "rpc"
        const rpcNode = network.nodes.find((node: any) => node.type === 'rpc');

        if (!rpcNode) {
            throw new Error(`No se encontró un nodo RPC en la red: ${networkId}`);
        }

        // Retornar el puerto del nodo RPC
        return rpcNode.port || null;
    } catch (error) {
        console.error('Error al obtener el puerto del nodo RPC:', error);
        return null;
    }
}


