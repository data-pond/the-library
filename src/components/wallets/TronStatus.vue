<script setup lang="ts">
// @ts-ignore
import {onMounted, ref} from "vue";
import {type PatchCollection, proResolver} from "@the_library/db";
import abi from './abi.json'
import {TronConfig} from "@//components/wallets/config.ts";

window.addEventListener('message', function (e) {
  console.log('received action message: ', e.data.message.action)
  if (e.data.message && e.data.message.action == "tabReply") {
    // console.log("tabReply event", e.data.message)

    // if(e.data.message.data.data.code ===4000){
    //   console.log("Authorization requests are being processed, please do not resubmit")
    // } else if (e.data.message.data.data.node.chain == '_'){
    //   console.log("tronLink currently selects the main chain")
    // }else{
    //   console.log("tronLink currently selects the side chain")
    // }
  }

  if (e.data.message && e.data.message.action == "setAccount") {
    console.log("setAccount event", e.data.message)
    console.log("current address:", e.data.message.data.address)

  }
  if (e.data.message && e.data.message.action == "setNode") {
    console.log("setNode event", e.data.message)
    if (e.data.message.data.node.chain == '_'){
      console.log("tronLink currently selects the main chain")
    }else{
      console.log("tronLink currently selects the side chain")
    }

    // Tronlink chrome v3.22.1 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "connect") {
      console.log("connect event", e.data.message.isTronLink)
    }

    // Tronlink chrome v3.22.1 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "disconnect") {
      console.log("disconnect event", e.data.message.isTronLink)
    }

    // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "accountsChanged") {
      console.log("accountsChanged event", e.data.message)
      console.log("current address:", e.data.message.data.address)
    }

    // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "connectWeb") {
      console.log("connectWeb event", e.data.message)
      console.log("current address:", e.data.message.data.address)
    }

    // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "accountsChanged") {
      console.log("accountsChanged event", e.data.message)
    }

    // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "acceptWeb") {
      console.log("acceptWeb event", e.data.message)
    }
    // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "disconnectWeb") {
      console.log("disconnectWeb event", e.data.message)
    }

    // Tronlink chrome v3.22.0 & Tronlink APP v4.3.4 started to support
    if (e.data.message && e.data.message.action == "rejectWeb") {
      console.log("rejectWeb event", e.data.message)
    }

  }
})

const tronlinkInstalled = ref(false)

const tronlinkConnected = ref(false)

async function getTronWeb() {
  let tronWeb;
  if (window.tronLink) {
    if (window.tronLink.ready) {
      tronWeb = tronLink.tronWeb;
    } else {
      const res = await tronLink.request({method: 'tron_requestAccounts'});
      if (res.code === 200) {
        tronWeb = tronLink.tronWeb;
      }
    }
    return tronWeb;
  }
  return null;
}

const params = encodeURIComponent(JSON.stringify({
  "url": "https://www.datapond.earth", //target DApp
  "dappIcon": "https://datapond.earth/icon.png",
  "dappName": "Test demo",
  "action": "login",
  'actionId': "no fucking clue",
  "protocol": "tronlink",
  "version": "1.0"
}))

onMounted(async () => {

  if (window.tronLink ) {
    tronlinkInstalled.value = true
    console.log('TRONLINK IS INSTALLED')
    await window.tronLink.request( {
      method: 'tron_requestAccounts',
      params: {
        websiteIcon: 'https:://datapond.earth/icon.png',
        websiteName: 'The Library',
        dappIcon: "https://datapond.earth/icon.png",
        dappName: "Test demo",
      } } ).then(res => {
      console.log('request ok? ', res)
      tronlinkConnected.value = true
    })
  } else {
    tronlinkInstalled.value = false
    console.log('TRONLINK IS NOT INSTALLED')
  }
})

const contractAddress = TronConfig.contractId;
const _tronWeb = proResolver<any>();

if (window.tronWeb) {
  _tronWeb.resolve(window.tronWeb.contract(abi.abi, contractAddress))
} else  {
  const interval = setInterval(async () => {
    if (window.tronWeb) {
      _tronWeb.resolve(window.tronWeb.contract(abi.abi, contractAddress))
      clearInterval(interval)
    }
  }, 1000)
}


const hasAccount = async (): Promise<boolean> => {
  const contract = await _tronWeb.pro
  let result = await contract.hasAccount().call();
  console.log('has account', result);
}

// minimum 5 TRX to register
const registerAccount = async (accountName: string, country: string, language: string, donation: number) => {
  const contract = await _tronWeb.pro
  let result = await contract.register(accountName, country, language, donation).call();
  console.log('registerAccount', result)
}



const loadMyAccount = async (sinceTs: number): Promise<PatchCollection> => {
  const contract = await _tronWeb.pro
  const result = await contract.loadPatches().call();
  console.log('loadMyAccount', result)
}

const savePatches = async (data: ArrayBuffer): Promise<true> => {
  const contract = await _tronWeb.pro
  const result = await contract.addPatches(data).call();
  console.log('savePatches', result)
}

</script>

<template>
  <div v-if="tronlinkConnected">
    <slot></slot>
  </div>
  <!--  <a :href='`tronlink://pull.activity?param={${params}}`'>Open DApp</a>-->
  <v-chip v-else-if="tronlinkInstalled" color="success" text-color="white">
    loading...
  </v-chip>
  <v-btn href="https://www.tronlink.org/" target="_blank" color="primary" v-else>Install</v-btn>

</template>

<style scoped>

</style>