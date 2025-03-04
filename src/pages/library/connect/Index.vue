<script setup lang="ts">
import Layout from "@//pages/library/Layout.vue";
import TronStatus from "@//components/wallets/TronStatus.vue";
import {compressIfNot, GetPatchesToSync, type PatchCollection, proResolver, SyncProvider} from "@the_library/db";
import abi from "@//components/wallets/abi.json";
import { ref} from "vue";
import {getAllPatchesSince, loadSyncedData} from "@the_library/db";
import {TronConfig} from "@//components/wallets/config.ts";

const loadPatchesToSync = () => {
  GetPatchesToSync(SyncProvider.Tron).then(async (patches) => {
    console.log("Patches loaded", patches)
    const [original, compressed] = await compressIfNot(new Uint8Array<ArrayBufferLike>(patches))
    console.log('compressed',  compressed.length, compressed.byteLength)
  })
}

const loadTronPatchesStats = async () => {
  const syncedData = await loadSyncedData()
  const patches = await getAllPatchesSince(syncedData.syncCounter[SyncProvider.Tron])
  let nb= 0;
  Object.keys(patches).forEach(objectName => {
    nb += Object.keys(patches[objectName]).length;
  })
  return nb
}

const contractAddress = TronConfig.contractId;
const _tronWeb = proResolver<any>();

if (window.tronLink && window.tronLink.tronWeb) {
  _tronWeb.resolve(window.tronWeb.contract(abi.abi, contractAddress))
} else  {
  const interval = setInterval(async () => {
    if (window.tronLink && window.tronLink.tronWeb) {
      _tronWeb.resolve( window.tronLink.tronWeb.contract(abi.abi, contractAddress))
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
  if ( hasAccount.value) {
    const patches = await loadTronPatchesStats()
    nbPatches.value = patches
    console.log('patches', patches)
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
  let result = await contract.register(userName.value, 'australia', 'en',1).send();
  console.log('registerAccount', result)
  checkHasAccount()
}
const loadMyAccount = async (sinceTs: number): Promise<PatchCollection> => {
  const contract = await _tronWeb.pro
  const result = await contract.loadPatches().call();
  console.log('loadMyAccount', result)
}
function i2hex(i) {
  return ('0' + i.toString(16)).slice(-2);
}
const syncTron = async () => {
  GetPatchesToSync(SyncProvider.Tron).then(async (patches) => {
    console.log("Patches loaded", patches);
    const [original, compressed] = await compressIfNot(new Uint8Array<ArrayBufferLike>(patches));
    const contract = await _tronWeb.pro;
    const parameters = Array.from(compressed);

    // console.log('parameters array length',Array.from(compressed).length);
    // const f32Arr = new Float32Array(compressed.buffer.slice(0, 4*Math.floor(compressed.byteLength / 4)));
    // console.log(`f32Arr length`, f32Arr.length)
    // const chunks = [];
    // const chunkSize = 10;
    // let counter = 0
    // let ok = true
    // while (ok) {
    //   if (compressed.byteLength - counter < chunkSize*8) {
    //
    //     if (compressed.byteLength - counter % 8 ==0 ) {
    //       chunks.push(new BigUint64Array(compressed.buffer.slice(counter, compressed.byteLength)))  ;
    //     }
    //     ok = false
    //   } else {
    //     chunks.push(new BigUint64Array(compressed.buffer.slice(counter, counter + chunkSize*8)));
    //     counter += chunkSize*8
    //   }
    // }
    // console.log('Chunks ', chunks)
    //
    // const u64Arr = new BigUint64Array(compressed.buffer.slice(0, 8*Math.floor(compressed.byteLength / 8)));
    // console.log(`u64Arr length`, u64Arr.length)
    // const tmpArray = Array.from(u64Arr);
    // const tmp64 = new BigUint64Array(tmpArray);
    // console.log(`tmp64 length`, tmp64.length, u64Arr.length)
    // tmp64.forEach((val, key) => {
    //   if (val !== u64Arr[key]) {
    //     console.warn(`invalid: `, key, val, u64Arr[key])
    //   }
    // })
    // 3523
    // 3508 => 15US$ for
    // 3495 => 13US$

    // Reset
    // 3284$: pre-register 603 Bandwidth & 112.000 Energy
    // 3273$: 11$
    // 603 Bandwidth 130.000Energy
    // 3261$: 12$ Sync Float64[10]
    // Reset this time mapping with counter
    // 3041$ Pre sync
    // 3029$ 12$


    // const result = await contract.addPatches(`0x${parameters}`).send();
    const result = await contract.addPatches(parameters).send();
    console.log('savedPatches', result);
    const fromContract = await contract.loadPatches().call();
    console.log('fromContract', fromContract);
  });
}

const userName = ref('')

</script>

<template>
  <Layout>
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              test Patches
            </v-card-title>
            <v-card-actions>
              <v-btn @click="loadPatchesToSync">
                Load Patches
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              Tron Status
            </v-card-title>
            <v-card-text>
              <TronStatus>
                Tron Link is Connected
              </TronStatus>
            </v-card-text>
            <v-card-text v-if="hasAccount && !loading">
              UserName: {{tronInfos.username}}
              <br />
              Patch needed to Sync: {{nbPatches}}
            </v-card-text>
            <v-card-text v-if="!hasAccount && !loading">
              <v-text-field label="Username" v-model="userName" placeholder="Your Username" />
              <v-btn @click="registerAccount()">Register</v-btn>
            </v-card-text>
            <v-card-actions class="justify-end"  v-if="hasAccount && !loading">
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
              <br />
              <a href="/#/libraryConnect/share">
                https://datapond.earth/#/share/USERNAME
              </a>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn >
                CLICK TO SYNC NOW
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              AO Status
            </v-card-title>
            <v-card-text>
              Todo
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>
              BTCore Status
            </v-card-title>
            <v-card-text>
              Todo
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>