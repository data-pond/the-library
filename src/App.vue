<script setup lang="ts">
import {computed, ref, onMounted} from "vue";

import {initMuWorker, LoadDataSet, LoadPreferences} from "@the_library/db";
import {getCatalogUrl} from "@//ts/catalog.ts";
import {ClearDb} from "@the_library/db";

const catalogUrl = getCatalogUrl()

const loading = ref(true)

onMounted(() => {
  console.log('App Mounted')
  console.time('LoadDataSet')
  // @ts-ignore
  initMuWorker(new URL("/muWorker.js", import.meta.url)).then(() => {
    console.log(`Mu Worker ready`)
  }).catch((e) => {
    console.error(`error loading MuPDf worker`, e)
  })
  // @ts-ignore
  LoadDataSet(new URL("/worker.js", import.meta.url), catalogUrl).then(() => {
    console.timeEnd('LoadDataSet')
    console.time('loadPreferences')
    LoadPreferences(catalogUrl).then(() => {
      console.timeEnd('loadPreferences')
      loading.value = false
      setTimeout(() => {

        // @ts-ignore
        document.appLoaded();
      }, 1000)

    })
  }).catch(err => {
    console.error(`ERROR LOADING APPLICATIONS TATE - RESETTING STORAGE`, err)

    // alert('Error - please refresh Page')
    ClearDb().then(() => {
      localStorage.clear()
      location.reload()
    }).catch(e => {
      location.reload()
    })
  });
})
// const toggle = ref(false)
// const theme = ref('light')
//
// function toggleTheme() {
//   theme.value = theme.value === 'light' ? 'dark' : 'light'
// }
</script>

<template>


  <v-app >

    <router-view v-slot="{ Component }">
      <component :is="Component" v-if="!loading"/>
    </router-view>
  </v-app>
</template>

