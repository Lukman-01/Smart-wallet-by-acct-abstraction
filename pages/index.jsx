
import { ethers } from "ethers";
// A single Web3 / Ethereum provider solution for all Wallets
import Web3Modal from "web3modal";
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const contractAddress = process.env.CONTRACT_ADDRESS
  // application binary interface is something that defines structure of smart contract deployed.
  const abi = process.env.ABI

  // hooks for required variables
  const [provider, setProvider] = useState();

  const web3ModalRef = useRef();
  // Check if wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // current  metamask address
  const [currentAddress, setCurrentAddress] = useState("");

  // the variable is used to invoke loader
  const [storeLoader, setStoreLoader] = useState(false)
  const [retrieveLoader, setRetrieveLoader] = useState(false)

  // Address of the receiver
  const [receiver, setReceiver] = useState("");
  // Address of account to fund
  const [accountToFund, setAccountToFund] = useState("");

  // Amount to fund address with
  const [amountToFund, setAmountToFund] = useState(0);
  const [serialNumber, setAccountSerialNumber] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [accountToGet, setAccountToGet] = useState("");


  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getCurrentAddress()
    }
  }, [walletConnected]);


  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();

    const web3Provider = new ethers.BrowserProvider(provider);
    setProvider(web3Provider)

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId.toString() !== '11155111') {
      console.log(chainId.toString())
      window.alert("Change the network to Sepolia");
      throw new Error("Change network to Sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
        connectWallet: Connects the MetaMask wallet
      */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Get the current address of a
  const getCurrentAddress = async () => {
    const signer = await getProviderOrSigner(true);
    setCurrentAddress(signer.address);
  }

  /**
* Get address of an account
*  
*/
  async function getAddress() {


    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigneer = smartContract.connect(signer);

      const txn = await contractWithSigneer.getTheAddress(currentAddress, serialNumber);
      console.log("Signer is ", provider)
      console.log("Serial no ", serialNumber)
      console.log("Address gotten is", txn)

      setStoreLoader(false)

      alert(`The address is ${txn}`)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }


  /**
* Create an account
*  
*/
  async function createWallet() {
    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      const createAccount = await contractWithSigner.createAccount(currentAddress, serialNumber);
      // console.log(createAccount)
      const response = await createAccount.wait()
      console.log(response.to)
      setStoreLoader(false)

      alert("Account created. Click 'Get account' to get the address")
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }


  /**
 * Fund wallet
 *  
 */
  async function fundWallet() {

    try {
      setStoreLoader(true)
      const signer = await getProviderOrSigner(true);
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);

      const fundWallet = await contractWithSigner.fundWallet(accountToFund, { value: ethers.parseEther(amountToFund) });
      // console.log(fundWallet)
      const response = await fundWallet.wait()
      //console.log(response)
      setStoreLoader(false)

      alert(`Wallet funded with ${amountToFund} `)
      return

    } catch (error) {
      alert(error)
      setStoreLoader(false)
      return
    }
  }

  /**
   * Get balance
  */
  async function getBalance(provider) {
    try {
      setRetrieveLoader(true)
      const signer = await getProviderOrSigner(true);

      // initalize smartcontract with the essentials detials.
      const smartContract = new ethers.Contract(contractAddress, abi, provider);
      const contractWithSigner = smartContract.connect(signer);
      // interact with the methods in smart contract
      const getBalance = await contractWithSigner.balanceOf(accountToGet);

      setCurrentBalance(ethers.formatEther(getBalance))
      setRetrieveLoader(false)
      return
    } catch (error) {
      alert(error)
      console.log(error)
      setRetrieveLoader(false)
      return
    }
  }


  function handleOnFormSubmit(e) {
    e.preventDefault()
  }
  
  return (
    <div className="bg-gray-800 min-h-screen flex flex-col items-center justify-center p-4">
      {/* <NavigationBar /> */}
      <div className="w-full max-w-4xl p-6 space-y-4">
        <h2 className="text-3xl md:text-4xl text-center text-white font-bold mb-6">
          Simple Wallet Creation Using Acct Abstraction
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h4 className="text-blue-600 text-lg font-bold mb-2">
            {accountToGet ? accountToGet : "Your"} current balance is: 
            <span className='font-bold'>{currentBalance ? currentBalance : 0}</span>
          </h4>

          <input 
            onChange={(e) => setAccountToGet(e.target.value)}
            name={'name'} required maxLength={"100"}
            type='text'
            className="px-4 py-2 w-full mb-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Address"
          />

          <button 
            className='mb-5 w-full py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300'
            onClick={() => getBalance(provider)}
          >
            {retrieveLoader ? "Loading..." : "GET"}
          </button>

          {/* Create Wallet Section */}
          <div className="border-t border-b border-gray-200 py-4">
            <form onSubmit={handleOnFormSubmit} className="space-y-4">
              <input 
                onChange={(e) => setAccountSerialNumber(e.target.value)}
                name={'name'} required maxLength={"10"}
                type='number'
                className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the number you want to tag the account"
              />

              <button 
                onClick={createWallet} 
                className='mt-4 mb-5 w-full py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300'
              >
                {storeLoader ? "Processing..." : "Create a Wallet"}
              </button>
            </form>
          </div>

          {/* Get Address Section */}
          <div className="border-t border-b border-gray-200 py-4">
            <form onSubmit={handleOnFormSubmit} className="space-y-4">
              <input 
                onChange={(e) => setAccountSerialNumber(e.target.value)}
                name={'name'} required maxLength={"10"}
                type='number'
                className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the number tag of the account"
              />

              <button 
                onClick={getAddress} 
                className='mt-4 mb-5 w-full py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300'
              >
                {storeLoader ? "Loading..." : "Get Address"}
              </button>
            </form>
          </div>

          {/* Fund Wallet Section */}
          <div className="border-t border-b border-gray-200 py-4">
            <form onSubmit={handleOnFormSubmit} className="space-y-4">
              <input 
                onChange={(e) => setAmountToFund(e.target.value)}
                name={'name'} required maxLength={"10"}
                type='number'
                step="0.1"
                className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Amount in ETH"
              />

              <input 
                onChange={(e) => setAccountToFund(e.target.value)}
                name={'account'} required maxLength={"100"}
                type='text'
                className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Address to fund"
              />

              <button 
                onClick={fundWallet} 
                className='mt-4 mb-5 w-full py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-300'
              >
                {storeLoader ? "Processing..." : "Fund Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
