import { Network } from '../types/network'
import { Request, Response } from 'express'
import { isNetworkArray } from '../validations/networkValidations'
import  fs  from 'fs'

export function listNetworks(req:Request, res:Response) {
    try {
        const data:any = fs.readFileSync('./src/data/networks.json', 'utf8')
        const networks:Network[] = JSON.parse(data) as Network[]
        
        //validate the networks data from the networks.json file 
        if(isNetworkArray(networks)){
            res.send(networks)
        }
        else{
            res.status(500).send('Error: the networks.json file has an error')
        }
    } catch (error) {
        res.status(500).send(error)
    }
}

export function networkDetails(req:Request, res:Response) {
    const networkId = req.params.id
    try {
        const data:any = fs.readFileSync('./src/data/networks.json', 'utf8')
        const networks:Network[] = JSON.parse(data) as Network[]
        //validate the networks data from the networks.json file
        if(isNetworkArray(networks)){
            //filter the network using the networkId
            const network:Network = networks.filter((network) => network.id == networkId)[0]
            res.send(network)
        }
        else{
            res.status(500).send('Error: the networks.json file has an error')
        }
        
    } catch (error) {
        res.status(500).send(error)
    }
}