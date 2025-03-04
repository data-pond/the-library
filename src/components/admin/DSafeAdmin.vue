<script setup lang="ts">
const props = defineProps({
  orm: Object
})
</script>

<template>
  <v-card>

    <v-card-title>
      Safe for children, adults and plants
    </v-card-title>
    <v-card-text>
      <p class="text-primary">
        <strong>no Spiritual content, No sexual content, No history, No illegal content, No Stolen
          Content, No Fictional content.</strong>
      </p>
    </v-card-text>
    <v-card-actions>
      <v-checkbox-btn v-model="props.orm.safe">
        <template v-slot:label>
                      <span class="text-primary">
                      D-Safe
                      </span>
        </template>
      </v-checkbox-btn>
    </v-card-actions>


  </v-card>
</template>

<style scoped>

</style>