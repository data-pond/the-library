<script setup lang="ts">
const props = defineProps({
  orm: Object
})
</script>

<template>
  <v-card>
    <v-card-title class="text-primary">
      <strong><v-icon icon="mdi-eye-outline" size="1.5rem" /> Visibility</strong>
    </v-card-title>
    <v-card-text>
      <p >
        <strong>Full Control:</strong> You can hide any topic from your copy of the library.
      </p>

    </v-card-text>

    <v-card-actions>
      <v-switch
          class="ml-2"
          v-model="props.orm.deleted"
          :color="props.orm.deleted ? 'green' : 'red'"
          :label="props.orm.deleted ? `Visible` : `Hidden`"
          hide-details
      ></v-switch>

    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>