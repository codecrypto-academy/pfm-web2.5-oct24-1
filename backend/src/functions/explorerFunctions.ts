import Web3 from 'web3';
import path, { join } from 'path';
import { Request, Response } from 'express';

const BASE_DIR = path.join(process.cwd());
const NETWORKS_FILE = path.join(BASE_DIR, 'data', 'networks.json');
const provider = new Web3.providers.HttpProvider('http://localhost:9546');
const web3 = new Web3(provider);

export async function getLastBlocks(req: Request, res: Response){
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

        res.send(JSON.stringify(blocks, replacer));
    } catch (error) {
        console.error('Error al obtener los bloques:', error);
        res.status(500).send('Error al obtener los bloques de la red');
    }
}