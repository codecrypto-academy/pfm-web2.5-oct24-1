import express, { Request, Response, Router } from 'express'
import { networkDetails, createNetwork, listNetworks, getNetworkStatus, startNetwork, stopNetwork, deleteNetwork, addNode, deleteNodeFromNetwork } from './functions/networkFunctions'
import { getLastBlocks, getBlock, getTransaction, getBalance} from  './functions/explorerFunctions';

const router: Router = express.Router();

// Network endpoints
router.get('/networks', (req: Request, res: Response) => { listNetworks(req, res) });
router.get('/network/:id', (req: Request, res: Response) => { networkDetails(req, res) });
router.post('/network/create', (req: Request, res: Response) => { createNetwork(req, res) });
router.post('/network/start/:id', (req: Request, res: Response) => { startNetwork(req, res) });
router.post('/network/stop/:id', (req: Request, res: Response) => { stopNetwork(req, res) });
router.delete('/network/delete/:id/', (req: Request, res: Response) => { deleteNetwork(req, res) });
router.get('/network/status/:id', (req: Request, res: Response) => { getNetworkStatus(req, res) });

//Node endpoints
router.post('/node/create/:id_network', (req: Request, res: Response) => { addNode(req, res) });
router.delete('/node/delete/:nodeName/:id_network', (req: Request, res: Response) => { deleteNodeFromNetwork(req, res) });

//Explorer routes
router.get('/network/:id/explorer/blocks', (req: Request, res: Response) =>{getLastBlocks(req, res)});
router.get('/network/:id/explorer/block/:blockId', (req: Request, res: Response) =>{getBlock(req, res)});
router.get('/network/:id/explorer/transaction/:txId', (req: Request, res: Response) =>{getTransaction(req, res)});
router.get('/network/:id/explorer/balance/:address', (req: Request, res: Response) =>{getBalance(req, res)});


export default router;
