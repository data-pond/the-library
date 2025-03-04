<script setup lang="ts">
import {FileStatus} from "@the_library/db";



</script>

<template>
  <v-card
      class="mx-auto"
      max-width="300"
  >
    <v-list>
      <v-list-item
          v-for="(item, i) in Object.keys(FileStatus)"
          :key="i"
          color="primary"
      >
        <v-list-item-title >
          {{item}} - {{FileStatus[item].value}}
        </v-list-item-title>
      </v-list-item>
    </v-list>

  </v-card>
</template>

<style scoped>

</style>