import { Alloc } from '../types/alloc'

interface AllocValidationError {
    field: string;
    message: string;
}

function isAlloc(data: any): data is Alloc {
    const errors: AllocValidationError[] = [];
    
    if (typeof data !== 'object') {
        errors.push({
            field: 'alloc',
            message: 'Allocation must be an object'
        });
        return false;
    }

    // Validar dirección Ethereum (debe comenzar con 0x y tener 42 caracteres en total)
    if (typeof data.address !== 'string' || 
        !data.address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        errors.push({
            field: 'address',
            message: 'Invalid Ethereum address format'
        });
        return false;
    }

    if (typeof data.value !== 'number' || data.value <= 0) {
        errors.push({
            field: 'value',
            message: 'Value must be a positive number'
        });
        return false;
    }

    return true;
}

export function validateAlloc(alloc: Alloc[]): AllocValidationError[] {
    const errors: AllocValidationError[] = [];
    
    // Verificar direcciones duplicadas
    const addresses = new Set<string>();
    alloc.forEach(allocation => {
        if (addresses.has(allocation.address.toLowerCase())) {
            errors.push({
                field: 'address',
                message: `Duplicate address: ${allocation.address}`
            });
        }
        addresses.add(allocation.address.toLowerCase());
    });

    return errors;
}

export function isAllocArray(data: any): data is Alloc[] {
    return (Array.isArray(data) && 
            data.length > 0 && 
            data.every(isAlloc));
}