<script setup lang="ts">

import TronStatus from "@//components/wallets/TronStatus.vue";
import Layout from "@//pages/library/Layout.vue";
</script>

<template>
  <Layout>
    <v-container>
      <v-row>
        <v-col cols="12" >
          <TronStatus />
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>