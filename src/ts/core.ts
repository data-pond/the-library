import {ref} from "vue";
import {Web3Provider} from "@ethersproject/providers";
import LibraryArtifact from '@//components/wallets/Library2.json';
import {CoreConfig} from "@//components/wallets/config.ts";
import {Contract} from "ethers"
import {proResolver, SyncPatches, SyncProvider} from "@the_library/db";
const LibraryAbi = LibraryArtifact.abi;
const contractAddress = CoreConfig.contractId;

export const useCoreContract = () => {

    if (typeof window.ethereum === 'undefined') {
        const errFn = () => console.error(`Wallet not installed`)
        return {
            usernameExists:errFn,
            savePatches:errFn,
            hasAccount:errFn,
            register:errFn,
            getBalance:errFn,
            userRejectedAppConnect: errFn
        }
    }

    const provider = new Web3Provider(window.ethereum); // Updated to Web3Provider
    const signer = provider.getSigner();
    const contract = new Contract(contractAddress, LibraryAbi, signer);
    console.log(contract);

    const usernameExists = async (username: string) =>  await contract.hasUsername(username);

    const hasAccount = () =>  contract.hasAccount();

    const userRejectedAppConnect = ref(false)
    const register = async (username: string) => {
        try {
            userRejectedAppConnect.value = false;
            await contract.register(username, Intl.DateTimeFormat().resolvedOptions().timeZone, navigator.language, 1);
        } catch(err) {
            if (err.code === 'ACTION_REJECTED') {
                // EIP-1193 userRejectedRequest error.
                // If this happens, the user rejected the connection request.
                userRejectedAppConnect.value = true;
            } else {
                console.log('Error code ', err.code)
                console.error(err)
            }
            throw err
        }
    }

    const savePatches = async (buff: ArrayBuffer) => {

        if (buff.byteLength===0) {
            return
        }
        const patchesParameters = new Uint8Array(buff);

        console.log('contract:', contract)
        const _tx = await contract.addPatches(Array.from(patchesParameters));
        console.log('addPatches Results:', _tx);
        const tx = await _tx.getTransaction();
        await tx.wait()
        console.log('done waiting')
        await SyncPatches(SyncProvider.BTCore)

    }


    const getBalance = async () => {
        await window.ethereum.request({
            "method": "eth_getBalance",
            "params": [
                "latest"
            ],
        });
    }
    return {usernameExists, savePatches, hasAccount, register, getBalance, userRejectedAppConnect};


}

export const useCoreConnect = () => {

    const metaMaskInstalled = ref(false)
    const metamaskConnected = ref(false)
    const coreInstalled = ref(false)
    const account = ref(null)

    const checkMetamaskInstalled = () => {
        if (window.ethereum) {
            metaMaskInstalled.value = true
        } else {
            metaMaskInstalled.value = false
        }
    }

    const launchMetamaskDetection = () => {
        const pro = proResolver()
        const interval = setTimeout(() => {
            checkMetamaskInstalled()
            if (metaMaskInstalled) {
                pro.resolve(true)
                clearInterval(interval)
            }
        }, 5000)

        return pro.pro
    }
    const userRejectedAppConnect = ref(false)

    const connectToMetaMask = async () : Promise<boolean>=> {
        if (metaMaskInstalled.value) {
            if (!metamaskConnected.value) {

                try {
                    const provider = new Web3Provider(window.ethereum);
                    const accounts = await provider.send("eth_requestAccounts", [])
                    metamaskConnected.value = true;
                    account.value = accounts[0];
                    console.log('Your account:', account.value)
                    return true
                } catch (err) {
                    if (err.code === 4001) {
                        // EIP-1193 userRejectedRequest error.
                        // If this happens, the user rejected the connection request.
                        userRejectedAppConnect.value = true;
                    } else {
                        console.error(err)
                    }
                }
                return false
            } else {
                return true
            }
        } else {
            return false;
        }
    }
    const networkError = ref(null)
    const requestNewNetwork = async () => {
        const provider = new Web3Provider(window.ethereum);
        provider.on("chainChanged", (chainId) => {
            window.location.reload();
        })
        provider.on("accountsChanged", (accounts) => {
            if (accounts.length === 0) {
                // MetaMask is locked or the user has not connected any accounts.
                console.log("Please connect to MetaMask.")
            } else if (accounts[0] !== account.value) {
                account.value = accounts[0]
                console.log('Account changed', account.value)
            }
        })
        try{

            await provider.send(
                "wallet_switchEthereumChain",
                [{ chainId: "0x45b" }],
            )
            return true
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await provider.send( "wallet_addEthereumChain", [
                        {
                            chainId: "0x45b",//1115
                            chainName: "Core Blockchain Testnet",
                            rpcUrls: ["https://rpc.test.btcs.network"] ,
                            nativeCurrency: {
                                symbol: "tCORE",
                                name: "CORE",
                                decimals: 18
                            },
                            blockExplorerUrls: ["https://scan.test.btcs.network"]
                        },
                    ]);

                    await provider.send("wallet_switchEthereumChain", [{ chainId: "0x45b" }])
                    coreInstalled.value = true
                    return true;
                } catch (addError) {
                    console.error(`error while requesting network`, addError)
                    networkError.value=addError;
                    // Handle "add" error.
                    return false;
                }
            }
            // Handle other "switch" errors.
        }
    };


    const checkNetworkOk = async () : Promise<boolean> => {
        if (!metamaskConnected.value) {
            return false
        }
        const provider = new Web3Provider(window.ethereum);
        const network = await provider.getNetwork()
        if (network.chainId === 1115) {
            coreInstalled.value = true
            return true;
        }
        coreInstalled.value = false
        return false;
    };

    const check = async () => {
        checkMetamaskInstalled()
        if (!metaMaskInstalled.value) {
            return
        }
        const connected = await connectToMetaMask()

        if (connected && metamaskConnected.value) {
            await checkNetworkOk()
        }
    }
    return {
        userRejectedAppConnect,
        account,
        check,
        metamaskConnected,
        metaMaskInstalled,
        connectToMetaMask,
        checkMetamaskInstalled,
        checkNetworkOk,
        coreInstalled,
        requestNewNetwork,
        networkError
    }
}