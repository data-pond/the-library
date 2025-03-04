<script setup lang="ts">

import {SyncedSelection, useSyncSettings} from "@the_library/db";

const selected = useSyncSettings()

</script>

<template>
  <v-card elevation="3" class="my-3">
    <v-card-title>
      Choose your backup option
    </v-card-title>
    <v-card-subtitle>

    </v-card-subtitle>


  </v-card>

  <v-card elevation="3" class="my-3" :active="selected===SyncedSelection.Arweave">
    <v-card-title>
      <h3>AO Sync</h3>
    </v-card-title>

    <v-card-subtitle>
      BlockChain Backup
    </v-card-subtitle>

    <v-card-text>
      Save your vote directly into the Super Computer AO
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn color="primary" size="large" variant="outlined">activate ao</v-btn>
    </v-card-actions>

  </v-card>

  <v-card class="my-3" elevation="3">
    <v-card-title>
      <h3>Local Only</h3>
    </v-card-title>

    <v-card-subtitle>
      No Backup
    </v-card-subtitle>

    <v-card-text>
      Both options are Free.
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn color="secondary" size="large" variant="outlined">continue</v-btn>
    </v-card-actions>

  </v-card>
</template>

<style scoped>

</style>