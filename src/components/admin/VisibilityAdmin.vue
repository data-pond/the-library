<script setup lang="ts">
const props = defineProps({
  orm: Object
})
</script>

<template>
  <v-card>
    <v-card-title>
      Visibility
    </v-card-title>
    <v-card-text>
      <p class="text-primary">
        <strong>Full Control:</strong> You can hide any book from your copy of the library.
      </p>

    </v-card-text>

    <v-card-actions>
      <v-checkbox-btn v-model="props.orm.deleted">
        <template v-slot:label>
                      <span class="text-primary">
                      Hidden
                      </span>
        </template>
      </v-checkbox-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>