<script setup lang="ts">
// @ts-ignore
import {onMounted, ref} from "vue";
import {
  GetActivitiesToSync, getAllPatchesSince,
  GetPatchesToSync, GetSyncStats, loadSyncedData,

  proResolver,
  SyncPatches,
  SyncProvider
} from "@the_library/db";
import abi from './abi.json'
import {TronConfig} from "@//components/wallets/config.ts";
//
// window.addEventListener('message', function (e) {
//   console.log('received action message: ', e.data)
//   return;
// })

const tronlinkInstalled = ref(false)

const tronlinkConnected = ref(false)

const nbRecordsToSync = ref(0)
loadSyncedData().then(syncedData => {
  getAllPatchesSince(syncedData.syncCounter.patch.tron).then((patchCollection) => {
    const total = Object.values(patchCollection).reduce((acc, value) => {
      return acc + Object.keys(value).length
    }, 0);
    nbRecordsToSync.value = total;
  })

});


onMounted(async () => {

  if (window.tronLink) {
    tronlinkInstalled.value = true
    console.log('TRONLINK IS INSTALLED')
    await window.tronLink.request({
      method: 'tron_requestAccounts',
      params: {
        websiteIcon: 'https:://datapond.earth/icon.png',
        websiteName: 'The Library',
        dappIcon: "https://datapond.earth/icon.png",
        dappName: "The Library",
      }
    }).then(res => {
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
} else {
  const interval = setInterval(async () => {
    if (window.tronWeb) {
      _tronWeb.resolve(window.tronWeb.contract(abi.abi, contractAddress))
      clearInterval(interval)
    }
  }, 1000)
}

const hasAccount = ref(false)
const loading = ref(false)
const nbPatches = ref(0);
const tronInfos = ref({})
const checkHasAccount = async (): Promise<boolean> => {

  loading.value = true
  console.log('Window tronlink', window.tronLink);
  const contract = await _tronWeb.pro
  let result = await contract.hasAccount().call();
  console.log('has account', result);
  hasAccount.value = result[0]
  if (hasAccount.value) {
    const myInfos = await contract.myInfos().call();
    console.log('myInfos', myInfos)
    tronInfos.value = myInfos.info
  }
  loading.value = false
}
checkHasAccount();
// minimum 5 TRX to register
const registerAccount = async () => {
  if (userName.value.length < 3) {
    return false
  }
  loading.value = true
  const contract = await _tronWeb.pro
  let result = await contract.register(userName.value, 'australia', 'en', 1).send();
  console.log('registerAccount', result)
  checkHasAccount()
}

const error = ref(null)
const executing = ref(false)
const waitingForWalletAction = ref(false)
const syncTron = async () => {
  executing.value = true
  const patches = await GetPatchesToSync(SyncProvider.BTCore)
  console.log("Patches loaded Length:", patches)
  if (patches === null) {
    return
  }
  console.log('patches ', patches)
  try {
    const patchesParameters = new Uint8Array(patches);
    waitingForWalletAction.value = true;
    const contract = await _tronWeb.pro;
    const result = await contract.addPatches(patchesParameters).send();
    waitingForWalletAction.value = false;
    console.log('synced Results:', result);

    const patchesFromContract = await contract.loadPatches().call();
    console.log('All Patches', patchesFromContract);
    const activityFromContract = await contract.loadActivity().call();
    console.log('All Activities', activityFromContract);

    await SyncPatches(SyncProvider.Tron)
    console.log('patch counter synced')
    await checkHasAccount()
    console.log('stats reloaded')
  } catch (e) {
    error.value = {
      e,
      msg: 'Error while saving your votes'
    }
  }

  executing.value = false;
}


const userName = ref('')
</script>

<template>
  <div v-if="tronlinkConnected">
    <v-card>
      <v-card-title>
        Tron Status
      </v-card-title>
      <v-card-text>

        Tron Link is Connected

      </v-card-text>
      <v-card-text v-if="hasAccount && !loading">
        UserName: {{ tronInfos.username }}
        <br/>
        Patch needed to Sync: {{ nbRecordsToSync }}
      </v-card-text>
      <v-card-text v-if="!hasAccount && !loading">
        <v-text-field label="Username" v-model="userName" placeholder="Your Username"/>
        <v-btn @click="registerAccount()">Register</v-btn>
      </v-card-text>
      <v-card-actions class="justify-end" v-if="hasAccount && !loading">
        <v-btn variant="outlined" @click="syncTron()">
          CLICK TO SYNC NOW
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card class="mt-2">
      <v-card-title>
        Share Your version
      </v-card-title>
      <v-card-text>
        here is a generated link for you to share with your friends.
        <br/>
        <a href="/#/libraryConnect/share">
          https://datapond.earth/#/tron/USERNAME
        </a>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn>
          CLICK TO SYNC NOW
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  <!--  <a :href='`tronlink://pull.activity?param={${params}}`'>Open DApp</a>-->
  <v-chip v-else-if="tronlinkInstalled" color="success" text-color="white">
    loading...
  </v-chip>
  <v-btn href="https://www.tronlink.org/" target="_blank" color="primary" v-else>Install</v-btn>

</template>

<style scoped>

</style>