import { Request, Response } from 'express'
import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'
import { Network } from '../types/network'

const BASE_DIR = path.join(process.cwd());
const NETWORKS_FILE = path.join(BASE_DIR, 'data', 'networks.json');
const NETWORKS_DIR = path.join(BASE_DIR, 'networks');
const AMOUNT = '10'

function generateTxDetails(toAddress: string, fromAddress: string): object {
    return {
        to: toAddress,
        from: fromAddress,
        value: ethers.parseEther(AMOUNT),
    }
}

function getNetwork(networkId) {
    try {
        const data = fs.readFileSync(NETWORKS_FILE, 'utf8');
        const networks: Network[] = JSON.parse(data);
        const network: Network = networks.find((network) => network.id === networkId)
        if (!network) {
            throw new Error(`Network ${networkId} not found`)
        }
        return network
    } catch (error) {
        throw new Error(`Error finding network: ${error.message}`)
    }
}

function getRpcPort(network: Network): number {
    const { nodes } = network
    const port = nodes.find((node) => node.type === 'rpc').port
    if (!port){
        throw new Error(`RPC node not found in the network: ${network.id}`)
    }
    return port
}

function getPassword(networkId) {
    try {
        const networkPath = path.join(NETWORKS_DIR, networkId)
        const passwordPath = path.join(networkPath, 'password.txt')
        const password = fs.readFileSync(passwordPath, 'utf8')
        return password
    } catch (error) {
        throw new Error(`Error getting the password for ${networkId}`)
    }
     
}

function  getFaucetAddressData(networkId){
    try {
        const bootnodeDir = path.join(NETWORKS_DIR, networkId, 'bootnode')
        const keystorePath = path.join(bootnodeDir, 'keystore')
        const files = fs.readdirSync(keystorePath)
        const faucetAddressPath = path.join(keystorePath, files[0])
        const faucetAddressData = JSON.parse(fs.readFileSync(faucetAddressPath, 'utf8'))    
        return faucetAddressData
    } catch (error) {
        throw new Error(`Error getting faucet address data:${error.message}`)
    }

}

export async function getTokens(req: Request, res: Response) {
    const { id: networkId, address } = req.params
    
    try {
        // get the network
        const network = getNetwork(networkId)
        // setup ethereum provider
        const rpcport = getRpcPort(network)
        const provider = new ethers.JsonRpcProvider(`http://localhost:${rpcport}`)
        // create wallet
        const faucetAddressData = getFaucetAddressData(networkId)
        const password = getPassword(networkId) 
        const wallet = await ethers.Wallet.fromEncryptedJson(JSON.stringify(faucetAddressData), password)
        // connect wallet to provider
        const walletConnection = wallet.connect(provider)
        // specify transaction details
        const faucetAddress = `0x${faucetAddressData.address}`
        const txDetails = generateTxDetails(address, faucetAddress)
        // send transaction from the wallet
        const tx = await walletConnection.sendTransaction(txDetails)
        const txRecipt = await tx.wait()
        const balance = await provider.getBalance(address)
        // response with  hash
        res.send({
            address,
            block: txRecipt.blockNumber,
            txHash:txRecipt.hash,
            amount: AMOUNT,
            balance: ethers.formatUnits(balance),
            date: new Date().toISOString()
        })
        
    } catch (error) {
        res.status(500).send(`Error in the transaction: ${error.message}`)
        // throw new Error(`Error in the transaction: ${error.message}`)
    }
}