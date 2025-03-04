<script setup lang="ts">

</script>

<template>
  <v-card  class="align-content-space-between" color="primary">

    <v-card-title >
      <strong>Library  Connect</strong>
    </v-card-title>
    <v-card-text class="flex">
      <p>
        Connect with the vibrant community of like minded people around the world.
      </p>

      <br />
      <v-row>
        <v-col cols="8" sm="6" md="4">
          <v-btn href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdatapond.earth"
                 target="_blank"
                 block
                 color="primary" class="bg-white mr-2" variant="outlined"  >
            <small>share</small> <strong>facebook</strong>
          </v-btn>
        </v-col>
        <v-col cols="8" sm="6" md="4">
          <v-btn :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent('#datapond Check this Web3 Library project: https://datapond.earth')}`" target="_blank"
                 color="primary"
                 block
                 class="bg-white mr-2" variant="outlined"  >
            <small>share</small> <strong>twitter</strong>
          </v-btn>
        </v-col>
        <v-col cols="8" sm="6" md="4">
          <v-btn href="https://t.me/+JN-P3f1t4ao3YzJl" target="_blank"
                 block
                 color="primary" class="bg-white mr-2" variant="outlined"  >
            <small>join</small> <strong>telegram</strong>
          </v-btn>
        </v-col>
      </v-row>

    </v-card-text>


  </v-card>
</template>

<style scoped>

</style>