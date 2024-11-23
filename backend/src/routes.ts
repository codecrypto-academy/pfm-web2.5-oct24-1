import express, { Request, Response, Router } from 'express';
import { networkDetails, createNetwork, listNetworks, startNetwork, deleteNetwork } from './functions/networkFunctions';
import { getLastBlocks} from  './functions/explorerFunctions';
import Web3 from 'web3';

const router: Router = express.Router();
const provider = new Web3.providers.HttpProvider('http://localhost:9546');
const web3 = new Web3(provider);

// Network endpoints
router.get('/networks', (req: Request, res: Response) => { listNetworks(req, res) });
router.get('/network/:id', (req: Request, res: Response) => { networkDetails(req, res) });
router.post('/network', (req: Request, res: Response) => { createNetwork(req, res) });
router.post('/network/:id/start', (req: Request, res: Response) => { startNetwork(req, res) });
router.delete('/network/:id', (req: Request, res: Response) => { deleteNetwork(req, res) });

//Explorer routes
router.get('/network/:id/explorer/blocks', (req: Request, res: Response) =>{getLastBlocks(req, res)});
//TODO router.post('/network/:id/stop', (req: Request, res: Response) => { stopNetwork(req, res) });

// //Node endpoints
//TODO router.post('/node/:networkid', (req: Request, res: Response) => { addNode(req, res) });
//TODO router.delete('/node/:id', (req: Request, res: Response) => { deleteNode(req, res) });

export default router;
