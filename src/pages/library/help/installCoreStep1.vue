<script setup lang="ts">

import Layout from "@//pages/library/help/Layout.vue";
import {Web3Provider} from "@ethersproject/providers";
import {onMounted, ref} from 'vue';

const metaMaskInstalled = ref(false)
const metamaskConnected = ref(false)
const coreInstalled = ref(false)
const account = ref(null)

const checkMetamaskInstalled = () => {
  if (window.ethereum) {
    console.log('metamask is installed')
    metaMaskInstalled.value = true
    connectToMetaMask();
  } else {
    console.log('metamask is NOT installed')
    metaMaskInstalled.value = false
    setTimeout(() => {
      checkMetamaskInstalled()
    }, 5000)
  }
}
const step = ref(1);

const userRejectedAppConnect = ref(false)

const connectToMetaMask = async () : Promise<boolean>=> {
  if (metaMaskInstalled.value) {
    if (!metamaskConnected.value) {

      try {
        const provider = new Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", [])
        metamaskConnected.value = true;
        account.value = accounts[0];
        step.value=2
        console.log('Your account:', account.value)
        return true
      } catch (err) {
        step.value=1;
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
        step.value=3;
        return true;
      } catch (addError) {
        console.error(`error while requesting network`, addError)
        step.value=2;
        networkError.value=addError;
        // Handle "add" error.
        return false;
      }
    }
    // Handle other "switch" errors.
  }
};

const checkBalance = () => {

}

const checkNetworkOk = async () : Promise<boolean> => {
  const provider = new Web3Provider(window.ethereum);
  const network = await provider.getNetwork()
  if (network.chainId === 1115) {
    coreInstalled.value = true
    step.value=3;
    console.log('core ready');

    console.log('provider', provider, account.value)

    const balance = await provider.getBalance( account.value )
    console.log('balance = ', balance.toString())
    return true;
  }
  coreInstalled.value = false
  step.value=2;
  return false;
};

const checker = async () => {

  checkMetamaskInstalled()

  if (!metaMaskInstalled.value) {
    const installedInterval = setInterval(async () => {
      console.log('check if metamask is installed')

      checkMetamaskInstalled()
      if (metaMaskInstalled.value) {
        clearInterval(installedInterval)
        checker();
      }
    }, 5000)
  } else {
    if (!metamaskConnected.value) {
      await connectToMetaMask();
    }

    if (!metamaskConnected.value) {
      console.error('not connected for some reason')
      return
    }

    const networkOk = await checkNetworkOk()
    if (!networkOk) {
      requestNewNetwork();

      const networkInterval = setInterval(async () => {
        const ok = await checkNetworkOk()
        if (ok) {
          clearInterval(networkInterval)
          checker();
        }
      }, 5000)
    }

  }

}

onMounted( () => {
  checker();
})

// setInterval(() => {
//   check()
// }, 1000)

</script>

<template>
<Layout>
  <v-container>


    <v-stepper-vertical v-model="step">
      <template v-slot:default="{ step }">
        <v-stepper-vertical-item
            :complete="step > 1"
            subtitle="Install & Connect Metamask"
            title="MetaMask"
            hide-actions
            :value="1"
        >
          <div v-if="!metaMaskInstalled">
          <p v-if="!metaMaskInstalled">
            MetaMask is the most used crypto wallet on the web.
          </p>

          <p  v-if="!metaMaskInstalled">
            Follow the instruction @ the official Metamask Website to install it, then come back at this page.
          </p>
          <p  v-if="!metaMaskInstalled">
            It will auto detect the installation, and go to step 2.
          </p>
          <v-btn variant="tonal" color="black"
                 :disabled="metaMaskInstalled"
                 v-if="!metaMaskInstalled"
                 href="https://metamask.io/" target="_blank"
                 append-icon="mdi-arrow-right" prepend-icon="mdi-download">
            Install MetaMask
          </v-btn>

          </div>
          <div v-else>

            <p>Accept the New Login Request in your metamask Wallet</p>

            <v-img src="/img/connectMetamask.png" height="40rem" />
          </div>


          <template v-slot:prev></template>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item
            :complete="step > 2"
            subtitle="Metamask Automatic Config of the tCORE Network"
            title="CORE Setup"
            hide-actions
            :value="2"
        >
          <p>Please Open your Metamask wallet and accept the tCORE New network.</p>

          <v-img src="/img/metamask_add_network.png" height="40rem" />

          <p>
            When you are ready, Click the check network button below.
          </p>

          <v-btn color="primary" @click="requestNewNetwork()">
            Check tCORE Network
          </v-btn>


        </v-stepper-vertical-item>

        <v-stepper-vertical-item
            subtitle="Load a free tCORE in your Wallet"
            title="1 Free tCORE"
            hide-actions
            value="3"
        >
          <v-btn>Click here to Copy your Account Key </v-btn> and paste it at the URL below.

          <br />
          <p><strong>Your Account ID:</strong> {{account}}</p>
          <br />

          <br />
          <v-btn variant="tonal" color="black"
                 :disabled="!coreInstalled"
                 href="https://scan.test.btcs.network/faucet"
                 target="_blank"
                 append-icon="mdi-arrow-right" prepend-icon="mdi-currency-usd">
            Open URL To get 1 Free coin
          </v-btn>


          <v-btn color="primary" >
            Finish
          </v-btn>

        </v-stepper-vertical-item>
      </template>
    </v-stepper-vertical>


  </v-container>
</Layout>
</template>

<style scoped>

</style>