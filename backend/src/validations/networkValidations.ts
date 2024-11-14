import { Network } from '../types/network';
import { isAllocArray, validateAlloc } from './allocValidations';
import { isNodeArray, validateNodes } from './nodeValidations';

interface NetworkValidationError {
    field: string;
    message: string;
}

const RESERVED_CHAIN_IDS = new Set([
    1,    // Mainnet
    3,    // Ropsten
    4,    // Rinkeby
    5,    // Goerli
    42,   // Kovan
    11155111 // Sepolia
]);

function isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
    });
}

function isValidSubnet(subnet: string): boolean {
    const parts = subnet.split('/');
    if (parts.length !== 2) return false;
    
    const ip = parts[0];
    const mask = parseInt(parts[1]);
    
    return isValidIP(ip) && mask >= 16 && mask <= 30;
}

function isIPInSubnet(ip: string, subnet: string): boolean {
    const [subnetIP, mask] = subnet.split('/');
    const ipParts = ip.split('.').map(Number);
    const subnetParts = subnetIP.split('.').map(Number);
    const maskBits = parseInt(mask);

    const octetsToCompare = Math.floor(maskBits / 8);
    for (let i = 0; i < octetsToCompare; i++) {
        if (ipParts[i] !== subnetParts[i]) return false;
    }

    return true;
}

export function validateNetwork(network: Network, existingNetworks: Network[]): NetworkValidationError[] {
    const errors: NetworkValidationError[] = [];

    // 1. Validar chainId
    if (RESERVED_CHAIN_IDS.has(network.chainId)) {
        errors.push({
            field: 'chainId',
            message: `ChainID ${network.chainId} is reserved for public networks`
        });
        return errors; // Retornar inmediatamente si es un chainId reservado
    }

    // 2. Verificar duplicados
    const duplicateChainId = existingNetworks.find(net => net.chainId === network.chainId);
    if (duplicateChainId) {
        errors.push({
            field: 'chainId',
            message: `ChainID ${network.chainId} is already in use by network ${duplicateChainId.id}`
        });
    }

    const duplicateSubnet = existingNetworks.find(net => net.subnet === network.subnet);
    if (duplicateSubnet) {
        errors.push({
            field: 'subnet',
            message: `Subnet ${network.subnet} is already in use by network ${duplicateSubnet.id}`
        });
    }

    const duplicateBootnode = existingNetworks.find(net => net.ipBootNode === network.ipBootNode);
    if (duplicateBootnode) {
        errors.push({
            field: 'ipBootNode',
            message: `Boot node IP ${network.ipBootNode} is already in use by network ${duplicateBootnode.id}`
        });
    }

    // 3. Validar IPs de nodos duplicadas entre redes
    for (const node of network.nodes) {
        const duplicateNodeIP = existingNetworks.find(net => 
            net.nodes.some(n => n.ip === node.ip)
        );
        if (duplicateNodeIP) {
            errors.push({
                field: 'nodes',
                message: `Node IP ${node.ip} is already in use by network ${duplicateNodeIP.id}`
            });
        }
    }

    // 4. Validar formato de subnet e IPs
    if (!isValidSubnet(network.subnet)) {
        errors.push({
            field: 'subnet',
            message: `Invalid subnet format: ${network.subnet}`
        });
    }

    // 5. Validar que todas las IPs están en la subnet correcta
    if (!isIPInSubnet(network.ipBootNode, network.subnet)) {
        errors.push({
            field: 'ipBootNode',
            message: `Boot node IP ${network.ipBootNode} is not within subnet ${network.subnet}`
        });
    }

    network.nodes.forEach(node => {
        if (!isIPInSubnet(node.ip, network.subnet)) {
            errors.push({
                field: 'nodes',
                message: `Node ${node.name} IP ${node.ip} is not within subnet ${network.subnet}`
            });
        }
    });

    // 6. Validar nodos
    const nodeErrors = validateNodes(network.nodes);
    errors.push(...nodeErrors);

    // 7. Validar allocations
    const allocErrors = validateAlloc(network.alloc);
    errors.push(...allocErrors);

    return errors;
}

export function isNetwork(data: any): data is Network {
    return (
        typeof data === 'object' &&
        typeof data.id === 'string' &&
        typeof data.chainId === 'number' &&
        !RESERVED_CHAIN_IDS.has(data.chainId) &&
        typeof data.subnet === 'string' &&
        isValidSubnet(data.subnet) &&
        typeof data.ipBootNode === 'string' &&
        isValidIP(data.ipBootNode) &&
        isAllocArray(data.alloc) &&
        isNodeArray(data.nodes)
    );
}

export function isNetworkArray(data: any): data is Network[] {
    return (Array.isArray(data) && (data.every(isNetwork) || data.length === 0));
}