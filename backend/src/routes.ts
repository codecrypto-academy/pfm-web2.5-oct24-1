import express, { Request, Response, Router } from 'express'
import { networkDetails, createNetwork, listNetworks } from './functions/networkFunctions'


const router: Router = express.Router()

// Network endpoints
router.get('/networks', (req:Request, res:Response) => { listNetworks(req,res) })
router.get('/network/:id', (req:Request, res:Response) => { networkDetails(req,res) })
router.post('/network', (req:Request, res:Response) => { createNetwork(req,res) })

//TODO router.delete('/network/:id', (req:Request, res:Response) => { deleteNetwork(req,res) })
//TODO router.post('/network/:id/start', (req:Request, res:Response) => { startNetwork(req,res) })
//TODO router.post('/network/:id/stop', (req:Request, res:Response) => { stopNetwork(req,res) })

// //Node endpoints
//TODO router.post('node/:networkid', (req:Request, res:Response) => { addNode(req,res) })
//TODO router.delete('node/:id', (req:Request, res:Response) => { deleteNode(req,res) })

export default router