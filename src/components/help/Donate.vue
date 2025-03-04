<script setup lang="ts">

</script>

<template>
  <v-card class="align-content-space-between" color="primary">

    <v-card-title >
      <strong>Preview Access</strong>
    </v-card-title>
    <v-card-text class="flex">

      <p>
        Any small donation will make a big difference
      </p>
      <br />
      <v-row>
        <v-col cols="8" sm="6" md="4">
          <v-btn href="https://buymeacoffee.com/datapond" target="_blank"
                 block
                 color="primary" class="bg-white mr-2" variant="outlined" >Buy Me a coffee</v-btn>
        </v-col>
        <v-col cols="8" sm="6" md="4">
          <v-btn disabled color="secondary"
                 block
                 class="bg-white mr-2" variant="outlined"  >Kick Starter</v-btn>
        </v-col>
        <v-col cols="8" sm="6" md="4">
          <v-btn disabled color="secondary"
                 block
                 class="bg-white mr-2" variant="outlined" >Crypto</v-btn>
        </v-col>
      </v-row>



    </v-card-text>


  </v-card>
</template>

<style scoped>

</style>