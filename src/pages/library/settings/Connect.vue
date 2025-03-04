<script setup lang="ts">

import Layout from "@//pages/library/help/Layout.vue";
import {computed, ref} from "vue";
import {loadSyncedData, StoreKey, storeValue, type SyncedData, SyncedSelection} from "@the_library/db";
import {useRouter} from "vue-router";
import {initAoAccount} from "@//ts/wallets.ts";

const useSyncSettings = () => {
  const data = ref<SyncedData>(null);
  loadSyncedData().then(val => {data.value=val}).catch(console.error) ;
  const selected =  computed({
    get: () => data.value ? data.value.selected : SyncedSelection.None,
    set: (value) => {
      data.value.selected = value;
      storeValue(StoreKey.SyncData, {
        key: StoreKey.SyncData,
        value: data.value
      })
    }
  })
  return {selected, data}
}

const aoSyncUrl = computed(() => '/aoSyncSetup')

const router = useRouter();

const {selected, data} = useSyncSettings()
console.log("Selected", selected.value)
const select = (name: SyncedSelection) => {
  selected.value = name
  if (name === SyncedSelection.Arweave) {
    initAoAccount(data.value.emptyArWeaveKey).then(account => {
      console.log('INIT OK')
    }).catch(console.error)
  }
  // router.push(aoSyncUrl.value)
}
</script>

<template>
  <Layout>
    <v-container>
      <v-row>

        <v-col cols="12" md="7" class="justify-center text-center align-content-center align-center">

          <v-card elevation="3" class="my-3">
            <v-card-title>
              Choose your backup option
            </v-card-title>
            <v-card-subtitle></v-card-subtitle>
          </v-card>
        </v-col>

        <v-col cols="12" md="7">



          <v-card elevation="3" @click="select(SyncedSelection.Arweave)" :color="selected==SyncedSelection.Arweave?'primary':'white'" >
            <v-card-title class="justify-space-between">
              <span>AO Sync</span>

              <v-btn v-if="selected==SyncedSelection.Arweave" class="float-right" variant="flat">Selected</v-btn>
            </v-card-title>

            <v-card-subtitle>
              BlockChain Backup
            </v-card-subtitle>

            <v-card-text>
              Save your vote directly into the Super Computer AO
            </v-card-text>

            <v-card-text>
              Create a durable link to your personalized Library to share with your groups
            </v-card-text>

            <v-card-text>
              Access extra community data, such as all Library user stats, vote results, and more.
            </v-card-text>

            <v-card-actions class="justify-end" v-if="selected!==SyncedSelection.Arweave">
              <v-btn class="primary" variant="outlined">click to Select</v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
        <v-col cols="12" md="7">
          <v-card elevation="3" @click="select(SyncedSelection.None)" :color="selected==SyncedSelection.None?'primary':'white'">
            <v-card-title class="justify-space-between">
              <span>
              Local Only
              </span>
              <v-btn v-if="selected==SyncedSelection.None" class="float-right" variant="flat">Selected</v-btn>
            </v-card-title>

            <v-card-subtitle>
              No Backup
            </v-card-subtitle>

            <v-card-text>
              The Library acts as a local app that doesn't get backed up.
            </v-card-text>
            <v-card-text>
              You cannot access any community features, because it requires access to your anonymous data..
            </v-card-text>
            <v-card-actions class="justify-end" v-if="selected!==SyncedSelection.None">
              <v-btn class="primary" variant="outlined">click to Select</v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>