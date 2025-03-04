<script setup lang="ts">

const props = defineProps({
  bookId: Number
})


</script>

<template>
  <v-card elevation="3" class="my-2" :to="`/voteBookPage/${bookId}`">
    <v-card-title>
      Elect Book Cover Vision
    </v-card-title>
    <v-card-text>
      Participate in @ best page of the Library contest
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn color="primary" variant="elevated"
             prepend-icon="mdi-file-pdf-box">
        Click to start

      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>