import { Node, typeOptions } from '../types/node'

interface NodeValidationError {
    field: string;
    message: string;
}

function isTypeOptions(data: any): data is typeOptions {
    return (
        data === 'rpc' || 
        data === 'miner' ||
        data === 'normal'
    );
}

function isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
    });
}

function isValidPort(port: number | null, type: typeOptions): boolean {
    if (type === 'rpc' && (port === null || port < 1024 || port > 65535)) {
        return false;
    }
    if ((type === 'miner' || type === 'normal') && port !== null) {
        return false;
    }
    return true;
}

export function validateNodes(nodes: Node[]): NodeValidationError[] {
    const errors: NodeValidationError[] = [];
    const usedIPs = new Set<string>();
    const usedNames = new Set<string>();
    const usedPorts = new Set<number>();

    nodes.forEach(node => {
        // Validar IP
        if (!isValidIP(node.ip)) {
            errors.push({
                field: 'ip',
                message: `Invalid IP format: ${node.ip}`
            });
        }

        // Validar IPs duplicadas
        if (usedIPs.has(node.ip)) {
            errors.push({
                field: 'ip',
                message: `Duplicate IP: ${node.ip}`
            });
        }
        usedIPs.add(node.ip);

        // Validar nombres duplicados
        if (usedNames.has(node.name)) {
            errors.push({
                field: 'name',
                message: `Duplicate node name: ${node.name}`
            });
        }
        usedNames.add(node.name);

        // Validar puertos
        if (node.port !== null) {
            if (usedPorts.has(node.port)) {
                errors.push({
                    field: 'port',
                    message: `Duplicate port: ${node.port}`
                });
            }
            usedPorts.add(node.port);
        }

        // Validar puerto según tipo de nodo
        if (!isValidPort(node.port, node.type)) {
            errors.push({
                field: 'port',
                message: `Invalid port for node type ${node.type}: ${node.port}`
            });
        }
    });

    // Validar que existe al menos un nodo minero
    if (!nodes.some(node => node.type === 'miner')) {
        errors.push({
            field: 'nodes',
            message: 'Network must have at least one miner node'
        });
    }

    return errors;
}

export function isNode(data: any): data is Node {
    return (
        typeof data === 'object' &&
        isTypeOptions(data.type) &&
        typeof data.name === 'string' &&
        typeof data.ip === 'string' &&
        (typeof data.port === 'number' || data.port === null) &&
        isValidIP(data.ip) &&
        isValidPort(data.port, data.type)
    );
}

export function isNodeArray(data: any): data is Node[] {
    return (Array.isArray(data) && 
            data.length > 0 && 
            data.every(isNode));
}