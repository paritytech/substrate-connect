// Enumerations
export enum NetworkEnum {
    kusama = 'kusama',
    polkadot = 'polkadot',
    westend = 'westend',
    kulupu = 'kulupu',
}

// Types
export type NetworkTypes = 'kusama' | 'polkadot' | 'westend' | 'kulupu'

// Functions
export const capitalizeFirstLetter = (val: string): string => val[0].toUpperCase() + val.slice(1);
export const isEmpty = (obj: any): boolean => (Object.keys(obj).length === 0 && obj.constructor === Object)
