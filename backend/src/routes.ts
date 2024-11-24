import express, { Request, Response, Router } from 'express'
import { networkDetails, createNetwork, listNetworks, startNetwork, deleteNetwork } from './functions/networkFunctions'
import { getTokens } from './functions/faucetFunctions'

const router: Router = express.Router();

// Network endpoints
router.get('/networks', (req: Request, res: Response) => { listNetworks(req, res) });
router.get('/network/:id', (req: Request, res: Response) => { networkDetails(req, res) });
router.post('/network', (req: Request, res: Response) => { createNetwork(req, res) });
router.post('/network/:id/start', (req: Request, res: Response) => { startNetwork(req, res) });
router.delete('/network/:id', (req: Request, res: Response) => { deleteNetwork(req, res) });
//TODO router.post('/network/:id/stop', (req: Request, res: Response) => { stopNetwork(req, res) });

// //Node endpoints
//TODO router.post('/node/:networkid', (req: Request, res: Response) => { addNode(req, res) });
//TODO router.delete('/node/:id', (req: Request, res: Response) => { deleteNode(req, res) });

// Faucet endpoint
router.get('/faucet/:networkId/:address', (req: Request, res: Response) => { getTokens(req, res) })

export default router;
