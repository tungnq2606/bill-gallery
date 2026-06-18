import * as Crypto from 'expo-crypto';

export const generateId = (): string => Crypto.randomUUID();

export const now = (): number => Date.now();
