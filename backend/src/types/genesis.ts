export interface GenesisConfig {
    chainId: number;
    homesteadBlock: number;
    eip150Block: number;
    eip155Block: number;
    eip158Block: number;
    byzantiumBlock: number;
    constantinopleBlock: number;
    petersburgBlock: number;
    istanbulBlock?: number;
    berlinBlock?: number;
    londonBlock?: number;
    clique?: {
        period: number;
        epoch: number;
    };
    ethash?: {};
}

export interface GenesisAlloc {
    [key: string]: {
        balance: string;
    };
}

export interface GenesisFile {
    config: GenesisConfig;
    difficulty: string;
    gasLimit: string;
    extradata: string;
    alloc: GenesisAlloc;
}