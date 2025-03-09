<script setup lang="ts">

</script>

<template>
  <v-card elevation="3" to="/admin" >
    <v-card-title>
      Contributor Mode
    </v-card-title>
    <v-card-subtitle>
      Unlock the contributor admin UX
    </v-card-subtitle>
    <v-card-text  style="max-height: 5rem;min-height: 5rem">
      <p>Use this collaborative book management system to improve the Library, and earn voting reputation.</p>
    </v-card-text>
    <v-card-actions class="justify-start">
      <v-btn to="/admin"  color="black"
             variant="tonal" rounded
             class="px-4"
             border   append-icon="mdi-chevron-right">

        <strong>learn More</strong>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>