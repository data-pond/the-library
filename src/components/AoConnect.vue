<script setup lang="ts">

import {ref} from "vue";

const props = defineProps({
  wallet: Object,
})


import {connect} from "@permaweb/aoconnect";


const msg = ref("Default Message")



</script>

<template>
  <v-card elevation="3">
    <v-card-title>
      AO Connect
    </v-card-title>
    <v-card-text v-if="arweaveWallet ==null">
      <v-img to="https://www.wander.app/" target="_blank"
             src="https://docs.wander.app/~gitbook/image?url=https%3A%2F%2F3409696580-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252Fr0kB58Nzgp0D86vLjlOO%252Fuploads%252Fgit-blob-3ed01db338935378f81168d1288567c18fe9adbd%252FDocs-Home.png%3Falt%3Dmedia&width=400&dpr=3&quality=100&sign=b219800d&sv=2"
             height="200px"/>
      <v-btn href="https://www.wander.app/" target="_blank" color="primary" size="large">Install Wander</v-btn>
    </v-card-text>
    <v-card-text v-else>
      <!--    <pre>-->
      <!--      reward pass quit alter doctor film poem essay journey eight shell dog-->
      <!--    </pre>-->
      <v-btn @click="sendAoMessage" color="primary" size="large">Send AO Message</v-btn>

      <v-text-field v-model="msg"/>

      <v-btn @click="Broadcast" color="primary" size="large">broadCast message</v-btn>
    </v-card-text>
  </v-card>
</template>

<style scoped>

</style>