import express, { Request, Response, Router } from 'express'
import { networkDetails, createNetwork, listNetworks, getNetworkStatus, editNetwork, startNetwork, stopNetwork, deleteNetwork, addNode, deleteNodeFromNetwork } from './functions/networkFunctions'

const router: Router = express.Router();

// Network endpoints
router.get('/networks', (req: Request, res: Response) => { listNetworks(req, res) });
router.get('/network/:id', (req: Request, res: Response) => { networkDetails(req, res) });
router.post('/network/create', (req: Request, res: Response) => { createNetwork(req, res) });
router.post('/network/start/:id', (req: Request, res: Response) => { startNetwork(req, res) });
router.post('/network/stop/:id', (req: Request, res: Response) => { stopNetwork(req, res) });
router.put('/network/edit/:id', (req: Request, res: Response) => { editNetwork(req, res) });
router.delete('/network/delete/:id/', (req: Request, res: Response) => { deleteNetwork(req, res) });
router.get('/network/status/:id', (req: Request, res: Response) => { getNetworkStatus(req, res) });

//Node endpoints
router.post('/node/create/:id_network', (req: Request, res: Response) => { addNode(req, res) });
router.delete('/node/delete/:nodeName/:id_network', (req: Request, res: Response) => { deleteNodeFromNetwork(req, res) });


export default router;
