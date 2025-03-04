<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import ContributorMode from "@//pages/library/info/ContributorMode.vue";
import TheD from "@//pages/library/info/TheD.vue";
import DSafe from "@//pages/library/info/DSafe.vue";
import Vision from "@//pages/library/info/Vision.vue";
import WebTech from "@//pages/library/info/WebTech.vue";
import ShareAndConnect from "@//components/help/ShareAndConnect.vue";
import Donate from "@//components/help/Donate.vue";


</script>

<template>

  <Layout>
    <v-container >
      <v-row>

        <v-col cols="12" md="4" >
          <Vision min-height="100%"/>

        </v-col>

        <v-col cols="12" md="4" >
          <DSafe min-height="100%"/>
        </v-col>
        <v-col cols="12" md="4" >
          <ContributorMode min-height="100%"/>
        </v-col>
        <v-col cols="12" md="4" >
          <WebTech min-height="100%"/>
        </v-col>
        <v-col cols="12" md="8" xl="4" >
          <ShareAndConnect  class="align-content-space-around" height="100%"/>
        </v-col>

        <v-col cols="12" md="8" xl="4">
          <Donate  class="align-content-space-around" height="100%"/>
        </v-col>

        <v-col cols="12" md="4" min-height="100%">
          <TheD />
        </v-col>





      </v-row>

    </v-container>
  </Layout>
</template>

<style scoped>

</style>