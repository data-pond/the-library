<script setup lang="ts">
import { Web3Provider } from '@ethersproject/providers'; // Updated import for Web3Provider
import {onMounted, ref} from 'vue'
import CoreInteraction from "@//components/wallets/CoreInteraction.vue";


const loading = ref(false)
const waitingForAction = ref(false)
const error = ref(null)
const contract =ref(null)
const entries = ref(null)
const check = async () => {

  loading.value = true
  if (window.ethereum) {
    try {
      waitingForAction.value = true
      console.log("Connecting to MetaMask...");
      const provider = new Web3Provider(window.ethereum); // Updated to Web3Provider

      await provider.send("eth_requestAccounts", []);

      const network = await provider.getNetwork();
      if (network.chainId !== 1115) {
        error.value = "Network Error";
        return
      }



    } catch (error) {
      console.error("Error connecting to contract:", error);
      error.value = error.message;
      setTimeout(() => {
        check();
      }, 1000)
    } finally {
      loading.value = false
      waitingForAction.value = false

    }
  } else {
    console.error("Please install MetaMask!");
    error.value = "Please install MetaMask!";
    loading.value = false;
    setTimeout(() => {
      check();
    }, 10000)
  }
}

onMounted(() => {
  check();
})



</script>

<template>
<v-row>
 <v-col cols="12">
   <div v-if="error">
     <v-card v-if="error===`Please install MetaMask!`">
       <v-card-title>
         Your Environment is not setup
       </v-card-title>
       <v-card-text>
         CORE needs a plugin, and some manual settings to be applied.
       </v-card-text>
       <v-card-text>
         <i>Estimated time: 5 min</i>
       </v-card-text>
       <v-card-actions>
         <v-btn>Start Setup Now</v-btn>
       </v-card-actions>
     </v-card>

     <v-card v-else>
       <v-card-text>
         Error: {[error}}
       </v-card-text>
     </v-card>
   </div>
   <div v-else>

     <div v-if="waitingForAction">
       <v-card>
         <v-card-title>
           Waiting for your input
         </v-card-title>
         <v-card-text>
           Please accept the request in your <strong>metamask</strong> wallet.
         </v-card-text>
       </v-card>

     </div>
     <div v-else>

       <CoreInteraction />

     </div>
   </div>



 </v-col>
</v-row>
</template>

<style scoped>

</style>