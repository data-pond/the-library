<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import ContributorMode from "@//pages/library/info/ContributorMode.vue";
import Vision from "@//pages/library/info/Vision.vue";
import DSafe from "@//pages/library/info/DSafe.vue";
</script>

<template>
  <Layout>

    <v-container>
      <v-row>
        <v-col cols="12" md="8">

          <v-card elevation="3" class="ma-0 pa-0">

            <v-card-title>
              100% Web3 Tech
            </v-card-title>
            <v-card-text >
              The Library is built with durable technologies and extensible to adapt to other crypto techs.
            </v-card-text>
            <v-card-text >
              All Books and book covers storage is prepaid for 250 years using <a href="https://arweave.org/" target="_blank" class="text-primary">Arweave</a>.
            </v-card-text>

            <v-card-text >
              Your progress is synchronized and shared using the <a href="https://coredao.org/" target="_blank"> bitcoin CORE</a> smart contract.
            </v-card-text>

            <v-card-text >
              The Library is a 100% standalone web3 decentralized app.
            </v-card-text>



<!--            <v-card-text class="pa-0 ma-0">-->
<!--              <v-img src="/img/AO.png" width="100%"/>-->

<!--            </v-card-text>-->
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <ContributorMode class="mb-6"/>
          <Vision  class="mb-6"/>
          <DSafe  class="mb-6"/>
        </v-col>

      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>