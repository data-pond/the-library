<script setup lang="ts">

import {ref} from "vue";
import {
  DateUtils,
  GetActivitiesToSync,
  GetPatchesToSync,
  GetSyncStats,
  SyncPatches,
  SyncProvider
} from "@the_library/db";
import {Contract} from "ethers";
import {Web3Provider} from "@ethersproject/providers";

const contractAddress = CoreConfig.contractId;

import {getAllPatchesSince, loadSyncedData} from "@the_library/db";

import LibraryArtifact from './Library2.json';
import {CoreConfig} from "@//components/wallets/config.ts";
import ReviewVotes from "@//components/vote/ReviewVotes.vue";

const LibraryAbi = LibraryArtifact.abi;


const nbRecordsToSync = ref(0)
loadSyncedData().then(syncedData => {
  getAllPatchesSince(syncedData.syncCounter.patch.btc).then((patchCollection) => {
    const total = Object.values(patchCollection).reduce((acc, value) => {
      return acc + Object.keys(value).length
    }, 0);
    nbRecordsToSync.value = total;
  })

});

const provider = new Web3Provider(window.ethereum); // Updated to Web3Provider
const signer = provider.getSigner();
const contract = new Contract(contractAddress, LibraryAbi, signer);

const hasAccount = ref(false)
const loading = ref(false)
const infos = ref({})
const checkHasAccount = async (): Promise<boolean> => {

  loading.value = true

  let result = await contract.hasAccount();
  console.log('has account', result);

  hasAccount.value = result
  if (hasAccount.value) {
    const myInfos = await contract.myInfos();
    console.log('myInfos', myInfos)

    infos.value = {
      username: myInfos[0],
      // registrationDate: DateUtils.fromNumber(myInfos[1]),
      country: myInfos[2],
      language: myInfos[3],
    }

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

  await contract.register(userName.value, 'australia', 'en', 1);
  await checkHasAccount()
}

const error = ref(null)
const executing = ref(false)
const waitingForWalletAction = ref(false)
const sync = async () => {
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

    const _tx = await contract.addPatches(Array.from(patchesParameters));
    console.log('addPatches Results:', _tx);
    const tx = await _tx.getTransaction();

    await tx.wait()
    console.log('done waiting')
    waitingForWalletAction.value = false;
    // const activityFromContract = await contract.loadActivity().call();
    // console.log('All Activities', activityFromContract);

    await SyncPatches(SyncProvider.BTCore)
    await checkHasAccount()
  } catch (e) {
    error.value = {
      e,
      msg: 'Error while saving your votes'
    }
  }
  executing.value = false

}

const userName = ref('')


</script>

<template>
  <ReviewVotes v-if="!executing && !waitingForWalletAction"/>
  <v-row>
    <v-col cols="12">
      <v-card v-if="!executing && !waitingForWalletAction">
        <v-card-title>
          Core Status
        </v-card-title>
        <v-card-text>
          Core is Connected
        </v-card-text>
        <v-card-text v-if="hasAccount && !loading">
          UserName: {{ infos.username }}
          <br/>
          Patch needed to Sync: {{ nbRecordsToSync }}

        </v-card-text>
        <v-card-text v-if="!hasAccount && !loading">
          <v-text-field label="Username" v-model="userName" placeholder="Your Username"/>
          <v-btn @click="registerAccount()">Register</v-btn>
        </v-card-text>
        <v-card-text v-if="hasAccount && !loading && nbRecordsToSync==0">
          <h1>All Synced Now</h1>
        </v-card-text>
        <v-card-actions class="justify-end" v-if="hasAccount && !loading && nbRecordsToSync>0">
          <v-btn variant="outlined" @click="sync()">
            CLICK TO SYNC NOW
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>

  </v-row>
</template>

<style scoped>

</style>