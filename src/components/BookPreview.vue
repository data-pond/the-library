<script setup lang="ts">

import {
  Book,
  getRecord,
} from "@the_library/db";
import Image from "@//components/image.vue";

const {bookId} = defineProps({
  bookId: Number
});

const book = getRecord(Book.type, bookId)

</script>

<template>
  <v-card elevation="3"
          density="compact"
          :to="`/admin/bookAdmin/${book.id}`"
          border  >
      <v-card-subtitle>
        <v-chip color="black" density="compact"
                variant="outlined" elevation="3" class="ma-2">
          {{book.nbPages}} pages
        </v-chip>
      </v-card-subtitle>
    <Image :file-id="book.coverImage" :ratio="0.8"/>
    <v-card-subtitle class="py-3">
      <span v-if="book.deleted" class="text-red-darken-2 pa-1">
        HIDDEN
      </span>
      <span v-if="!book.safe" class="text-red-darken-2 pa-1">
        UNSAFE
      </span>
      <span v-if="book.safe" class="text-green-darken-2 pa-1">
        D-SAFE
      </span>
    </v-card-subtitle>
  </v-card>
</template>

<style scoped>

</style>