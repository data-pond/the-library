<script setup lang="ts">

const props = defineProps({
  bookId: Number
})


</script>

<template>
  <v-card elevation="3" class="my-2" :to="`/voteBookPage/${bookId}`" color="primary">
    <v-card-title>
      Elect Book Cover Vision
    </v-card-title>
    <v-card-text>
      Participate @  the <strong >best page contest</strong>
    </v-card-text>

    <v-card-actions class="justify-end">
      <v-btn color="white" variant="elevated"
             prepend-icon="mdi-file-pdf-box">
        Click to vote

      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>

</style>