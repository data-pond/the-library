<script setup lang="ts">

import Layout from "@//pages/library/help/Layout.vue";
import {onMounted, ref} from 'vue';
import {useCoreConnect} from "@//ts/core.ts";

const {
connectToMetaMask,
metamaskConnected,
metaMaskInstalled,
checkMetamaskInstalled,
coreInstalled,
checkNetworkOk,
account,
userRejectedAppConnect,
requestNewNetwork,
networkError
} = useCoreConnect();

const step = ref(1)
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
    step.value = 2;

    const networkOk = await checkNetworkOk()
    if (!networkOk) {
      requestNewNetwork();

      const networkInterval = setInterval(async () => {
        const ok = await checkNetworkOk()
        if (ok) {
          clearInterval(networkInterval)
          step.value = 3;
          checker();
        }
      }, 5000)
    } else {
      step.value = 3;
    }

  }

}



onMounted( () => {
  checker();
})

const freeTCoreLinkClicked = ref(false)
const  copyToClipboard = () =>  {
  const input = document.createElement('input');
  input.value = account.value;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}

// setInterval(() => {
//   check()
// }, 1000)

</script>

<template>

  <v-container>

    <v-row justify="center">
      <h1 class="py-2">Get Started with tCORE</h1>
    </v-row>


    <v-row justify="center" >
    <h3 class="text-grey-darken-2 mb-4">Follow these steps to setup your crypto wallet and get your free tCORE token</h3>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card elevation="6">
          <v-card-item>

            <v-row class="mb-3">
            <v-col cols="1" class="align-content-center justify-center text-center">
              <v-icon size="3rem" icon="mdi-numeric-1-circle-outline" color="primary"></v-icon>
            </v-col>
            <v-col>
              <h2>MetaMask</h2>
              <h4>Install & Connect Metamask</h4>
            </v-col>
            </v-row>
          </v-card-item>

          <v-card-text>
            MetaMask is the most used crypto wallet on the web
          </v-card-text>
          <v-card-text>
            Follow the instruction @ the official Metamask Website to install it, then come back at this page.
          </v-card-text>

          <v-card-text>
            it will auto detect the installation, and go to step2.
          </v-card-text>

          <v-card-actions>
            <v-btn variant="tonal" color="black"
                   v-if="!metaMaskInstalled"
                   href="https://metamask.io/" target="_blank"
                   append-icon="mdi-arrow-right" prepend-icon="mdi-download">
              Install MetaMask
            </v-btn>
            <v-btn variant="elevated" color="success"
                   v-else
                   append-icon="mdi-check-bold" prepend-icon="mdi-download">
              Installed
            </v-btn>


          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12">
      <v-card elevation="6" :disabled="step<2">
        <v-card-item class="mb-3">

          <v-row>
            <v-col cols="1" class="align-content-center justify-center text-center">
              <v-icon size="3rem" icon="mdi-numeric-2-circle-outline" color="primary"></v-icon>
            </v-col>
            <v-col>
              <h2>CORE Setup</h2>
              <h4>Metamask Automatic Config of the tCORE Network</h4>
            </v-col>
          </v-row>
        </v-card-item>

        <v-card-text v-if="!metamaskConnected">
          Please open your Metamask wallet and accept the datapond.earth connection request.
        </v-card-text>
        <v-card-text v-if="!coreInstalled && metamaskConnected">
          Please open your Metamask wallet and accept the tCORE New network. When you are ready, click the check network button below.
        </v-card-text>
        <v-card-text v-if="coreInstalled">
          Your tCORE network settings are fully configured.
        </v-card-text>

        <v-card-text>


        <v-banner color="primary" class="bg-blue-lighten-5">
          <v-banner-text class=" text-primary">
            <strong>
              <v-icon icon="mdi-cog" color="primary" size="2rem" />
              The tCORE network will be automatically configured in your MetaMask wallet
            </strong>
          </v-banner-text>
        </v-banner>
        </v-card-text>
        <v-card-actions>

          <v-btn variant="elevated" color="primary"
                 v-if="!coreInstalled"
                 @click="requestNewNetwork()"
                 prepend-icon="mdi-cog" append-icon="mdi-chevron-right">
            CHECK  NETWORK
          </v-btn>
          <v-btn variant="elevated" color="success"
                 v-if="coreInstalled"
                 append-icon="mdi-check-bold" prepend-icon="mdi-cog">

            Core SETup Operational

          </v-btn>

        </v-card-actions>


      </v-card>
      </v-col>

      <v-col cols="12">
        <v-card elevation="6" :disabled="step<3">
          <v-card-item>

            <v-row>
              <v-col cols="1" class="align-content-center justify-center text-center">
                <v-icon size="3rem" icon="mdi-numeric-3-circle-outline" color="primary"></v-icon>
              </v-col>
              <v-col>
                <h2>1 Free tCORE </h2>
                <h4>Claim your free tCORE token and start your journey</h4>
              </v-col>
            </v-row>
          </v-card-item>

          <v-card-item class="bg-grey-lighten-3 ma-4">
            <p>
              Your Core Chain Address:
            </p>

            <v-row class="bg-white my-3 pa-2">
              <v-col cols="10">

                {{account}}
              </v-col>
              <v-col cols="2" class="justify-end text-right">
                <v-btn size="small" prepend-icon="mdi-content-copy" @click="copyToClipboard">
                  Copy
                </v-btn>
              </v-col>
            </v-row>

          </v-card-item>

          <v-card-item>
            Copy your CoreChain Address, and then click the CLAIM YOUR FREE tCORE button below. Paste your address, and you will receive 1 Free tCORE.
          </v-card-item>

          <v-card-actions>
            <v-btn variant="elevated" color="accent"
                   href="https://scan.test.btcs.network/faucet"
                   target="_blank"
                   @click="freeTCoreLinkClicked=true"
                   block prepend-icon="mdi-gift" append-icon="mdi-chevron-right">

              Claim your free tCORE
            </v-btn>
          </v-card-actions>
          <v-card-actions>
            <v-btn variant="elevated" color="primary"
                   :disabled="!freeTCoreLinkClicked"
                   to="/wallet/registerTCore"
                   block prepend-icon="mdi-party-popper" append-icon="mdi-chevron-right">

              Finish Setup
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card elevation="6" >
          <v-card-actions>
            <v-btn variant="elevated" color="red-darken-4"
                   to="/account"
                   block prepend-icon="mdi-clock" append-icon="mdi-chevron-right">

              Finish Later
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>