import { Network } from '../types/network';
import { Alloc } from '../types/alloc';
import { GenesisFile, GenesisConfig } from '../types/genesis'

function generateExtradata(addresses: string[]): string {
    const addressRegex = /^[a-fA-F0-9]{40}$/ // Regex to match a 40-character hexadecimal string
    for (let address of addresses) {
        if (!addressRegex.test(address)) {
            throw new Error(`${address} is not a 40-character hexadecimal string`)
        }
    }

    const zerosFront = "00".repeat(32) // 32 bytes of zeroes
    const zerosBack = "00".repeat(65) // 65 bytes of zeroes
    const joinedAddresses = addresses.join('')
    return `0x${zerosFront}${joinedAddresses}${zerosBack}`
}

function generateAlloc(faucetAddress: string, allocs: Alloc[]) {
    const allocations: { [key: string]: {balance: string}} = {}
    allocations[faucetAddress] = {balance: "10000000000000000000000000000"}
    allocs.forEach((alloc) => {
        const balanceInWei = BigInt(alloc.value) * BigInt(10 ** 18)
        allocations[alloc.address] = { balance: balanceInWei.toString() }
    })
    return allocations
}

// Function to generate the genesis file
export function generateGenesisFile(network: Network, addresses: string[]): GenesisFile {
    const config: GenesisConfig = {
        chainId: network.chainId,
        homesteadBlock: 0,
        eip150Block: 0,
        eip155Block: 0,
        eip158Block: 0,
        byzantiumBlock: 0,
        constantinopleBlock: 0,
        petersburgBlock: 0,
        clique: {
            period: 30,
            epoch: 30000,
        },
    };
    const faucetAddress = addresses[0]
    const alloc = generateAlloc(faucetAddress, network.alloc)
    const extradata = generateExtradata(addresses.slice(1));

    return {
        config,
        difficulty: "1",
        gasLimit: "8000000",
        extradata,
        alloc,
    };
}