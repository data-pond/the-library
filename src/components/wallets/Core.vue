<script setup lang="ts">
import { watchEffect} from 'vue'
import CoreInteraction from "@//components/wallets/CoreInteraction.vue";
import {useLevel} from "@//ts/level.ts";
import {useCoreConnect} from "@//ts/core.ts";
import {useRouter} from "vue-router";


const {levelUp, loading: levelLoading} = useLevel()
const {coreInstalled, check, account} = useCoreConnect()


const router = useRouter();

watchEffect(() => {
  if (!levelLoading.value) {
    check().then(async () => {
      if (levelUp.value === false) {
        router.push('/account')
      } else if(!coreInstalled.value) {
        router.push('/account')
      }
    });
  }
})



</script>

<template>
<v-row>
 <v-col cols="12">
     <CoreInteraction />
 </v-col>
</v-row>
</template>

<style scoped>

</style>