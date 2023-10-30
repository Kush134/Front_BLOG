import {Token} from "@/components/donate/donate";

export const baseCoin = "KUSH";
export const possibleTokens: Token[] = [
    {symbol: "USDT", address: '0x5eAD2D2FA49925dbcd6dE99A573cDA494E3689be'},
    {symbol: "USDC", address: '0x953b8279d8Eb26c42d33bA1Aca130d853cb941C8'},
    {symbol: "BUSD", address: '0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814'},
]

// todo maybe fix it
export const symbolByAddress = new Map<`0x${string}`, string>();
export const addressBySymbol = new Map<string, `0x${string}`>();
possibleTokens.forEach(token => {
    symbolByAddress.set(token.address, token.symbol);
    addressBySymbol.set(token.symbol, token.address);
});