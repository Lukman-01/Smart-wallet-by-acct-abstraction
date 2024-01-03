/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        CONTRACT_ADDRESS: "0x161Bba5B35448C5E4753B04fF91Ed4506108DbA1",
        ABI: [{ "inputs": [{ "internalType": "contract IEntryPoint", "name": "_entryPoint", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "accountImplementation", "outputs": [{ "internalType": "contract SimpleAccount", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }], "name": "createAccount", "outputs": [{ "internalType": "contract SimpleAccount", "name": "ret", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "fundWallet", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "salt", "type": "uint256" }], "name": "getTheAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }]
    }
}
module.exports = nextConfig
