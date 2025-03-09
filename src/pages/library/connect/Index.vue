<script setup lang="ts">
import Layout from "@//pages/library/Layout.vue";
import Core from "@//components/wallets/Core.vue";
import {ref} from 'vue'
import {Web3Provider} from "@ethersproject/providers";


const tronOperational = ref(false)

if (window.tronLink && window.tronLink.tronWeb) {
  tronOperational.value = true;
} else  {
  const interval = setInterval(async () => {
    if (window.tronLink && window.tronLink.tronWeb) {
      tronOperational.value = true;
      clearInterval(interval)
    }
  }, 1000)
}

const metamaskAvailable = ref(false)
const coreReady = ref(false)
if (window.ethereum) {
  metamaskAvailable.value = true;
  try {

    console.log("Connecting to MetaMask...");
    const provider = new Web3Provider(window.ethereum); // Updated to Web3Provider
    provider.send("eth_requestAccounts", []).then((sendResult) => {
      console.log('sendResult', sendResult);
      provider.getNetwork().then(network => {
        if (network.chainId === 1115) {
          coreReady.value = true;
        }
      });
    }).catch(e => {
      metamaskAvailable.value = false;
    });

  } catch(e) {

  }
}

</script>

<template>
  <Layout>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-text>
              <h1>Choose your Crypto tech</h1>
              <hr class="my-3"/>
              <p>When using crypto payment, it guarantees no intermediary between your data which becomes a public D-Safe permanently availaible vote.</p>
              <hr class="my-3"/>
              <p>The price depends on your usage.</p>
              <p>The lower bound is one registration, and a one time vote</p>
              <p>The high bound is for the upcoming virtual room activity.</p>
              <hr class="my-3"/>


              <h3>tCore</h3>
              <p>Using Satoshi Plus protocol, it integrates BTC with the ETH protocol.</p>
              <p>Price: between 1$ and 50 $</p>

              <hr class="my-3"/>
              <h3>TRX</h3>
              <p>ETH/TRON network based solution, using the Energy/Bandwidth paradigm.</p>
              <p>Price: between 100$ and 5000$</p>
              <hr class="my-3"/>
              <h3>
                AO - coming soon
              </h3>
              <p>AO is a decentralized computer using the Arweave permanent storage</p>
              <p>Price: between 10c and 5$</p>
            </v-card-text>
          </v-card>

        </v-col>
      </v-row>
      <v-row>


        <v-col cols="12" md="4">

          <v-card :to="coreReady ? '/wallet/core' : metamaskAvailable ? '/wallet/installCore' : '/wallet/installMetamask'" elevation="2">
            <v-card-title>
              Core Connect
            </v-card-title>
            <v-card-text v-if="coreReady">
              Core Is READY
            </v-card-text>
            <v-card-text v-else-if="metamaskAvailable">
              Manual Setup of Core on your Metamask wallet
              <br />
              <br />
              Click To Start the setup process
            </v-card-text>
            <v-card-text v-else>
              You need to manually add Core Network in your metamask.
              <br />

              Click here to access the setup instructions.
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="outlined" size="x-large" v-if="coreReady">
                Open
              </v-btn>
              <v-btn variant="outlined" size="x-large" v-else>
                Setup Now
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card :to="tronOperational ? '/wallet/tron' : '/wallet/tronSetup'" elevation="3">
            <v-card-title>
              TRON Connect
            </v-card-title>
            <v-card-text v-if="tronOperational">
              Tron Is READY
            </v-card-text>
            <v-card-text v-else>
              Tron is Not ready.
              <br />
              You Need to setup Tron before continuing.
              <br />
              Click To Start the setup process
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="outlined" size="x-large" to="/wallet/tron" v-if="tronOperational">
                Open
              </v-btn>
              <v-btn variant="outlined" size="x-large" to="/wallet/tron" v-if="!tronOperational">
                Setup Now
              </v-btn>
            </v-card-actions>
          </v-card>

        </v-col>
        <v-col cols="12" md="4">
          <v-card disabled elevation="3">
            <v-card-title>
              AO Connect
            </v-card-title>
            <v-card-text>
              Coming soon
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="outlined" size="x-large">
                Coming Soon
              </v-btn>

            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>