<script setup lang="ts">

</script>

<template>
  <v-card elevation="3" to="/d-safe" >
    <v-card-title>
      DSafe
    </v-card-title>
    <v-card-subtitle>
      Safe for Children, Adults and Plants
    </v-card-subtitle>
    <v-card-text style="max-height: 5rem;min-height: 5rem">
      <p>
        Inherits all proprties of <a href="/d-licence" class="text-primary">the D</a>,
        A DSafe Label certifies the media published is <strong>safe for children, adults and plants</strong>
      </p>
    </v-card-text>
    <v-card-actions class="justify-start mt-2">
      <v-btn  to="/d-safe"   color="black"
             variant="tonal" rounded
              class="px-4"
             border   append-icon="mdi-chevron-right">
        <strong>learn more</strong>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>