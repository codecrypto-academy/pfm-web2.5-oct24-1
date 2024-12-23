import Web3 from 'web3';
import fs from 'fs';
import path, { join } from 'path';
import { Request, Response } from 'express';
import { isAddress } from 'web3-validator';

const BASE_DIR = path.join(process.cwd());
const NETWORKS_FILE = path.join(BASE_DIR, 'data', 'networks.json');

/*MAIN ROUTES FUNCTIONS*/
export async function getLastBlocks(req: Request, res: Response){
    const web3 = await connectProvider(req.params.id);
    if(web3 === null){
        res.status(500).send('Error al conectar con el provider web3 en funcion getLastBlocks');
    }else{
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
    
}

export async function getBlock(req: Request, res: Response){
    const web3 = await connectProvider(req.params.id);

    if(web3 === null){
        res.status(500).send('Error al conectar con el provider web3 en funcion getBlock');
    }else{
        try {
            // Obtiene la información del bloque especificado y sus transacciones
            const block = await web3.eth.getBlock(req.params.blockId, true); // 'true' asegura que también se incluyen las transacciones
            const replacer = (key: string, value: any) =>
                typeof value === 'bigint' ? value.toString() : value;
            console.log('Obtenido el bloque con sus transacciones de forma exitosa');
            res.send(JSON.stringify(block,replacer)); // Devuelve el bloque con sus transacciones
        } catch (error) {
            console.error('Error al obtener el bloque:', error); // Muestra el error en consola
            res.status(500).send('Error al obtener el bloque con sus transacciones');
        }
    }
  
}

export async function getTransaction(req: Request, res: Response) {
    const web3 = await connectProvider(req.params.id);
    if (web3 === null) {
        res.status(500).send('Error al conectar con el provider web3 en funcion getTransaction');
    } else {
        try {
            // Obtener el hash de la transacción desde los parámetros de la solicitud
            const transaction = await web3.eth.getTransaction(req.params.txId); // Obtener información de la transacción
            
            // Si la transacción no existe, retornar un error
            if (!transaction) {
                res.status(404).send('Transacción no encontrada');
                return;
            }

            // Serializar la transacción, manejando BigInt
            const replacer = (key: string, value: any) =>
                typeof value === 'bigint' ? value.toString() : value;
            
            console.log('Transacción obtenida de forma exitosa');
            res.send(JSON.stringify(transaction, replacer)); // Enviar la transacción como respuesta
        } catch (error) {
            console.error('Error al obtener la transacción:', error);
            res.status(500).send('Error al obtener la transacción de la red');
        }
    }
}

export async function getBalance(req: Request, res: Response){
    const web3 = await connectProvider(req.params.id);
    
    if (web3 === null) {
        res.status(500).send('Error al conectar con el provider web3 en la función getAddress');
        return;
    }

    try {
        // Obtener la dirección de la cartera desde los parámetros de la solicitud
        const walletAddress = req.params.address;

        // Validar que la dirección es válida usando web3-validator
        if (!isAddress(walletAddress)) {
            res.status(400).send('Dirección de la cartera no válida');
            return;
        }

        // Obtener el balance de la dirección
        const balance = await web3.eth.getBalance(walletAddress);

        // Convertir el saldo de Wei a Ether
        const balanceInEther = web3.utils.fromWei(balance, 'ether');

        // Devolver la información de la dirección y el balance
        console.log("Balance obtenido de forma exitosa");
        res.send({ address: walletAddress, balance: balanceInEther });
    } catch (error) {
        console.error('Error al obtener la información de la dirección:', error);
        res.status(500).send('Error al obtener la información de la dirección');
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


