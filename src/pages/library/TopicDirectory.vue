<script setup lang="ts">

import {Book, DSafeFilter, DSafeGenericFilter, Tag} from "@the_library/db";
import {computed} from "vue";
import {addTopicNavigation} from "@//ts/navigation.ts";

const props = defineProps({
  parentId: Number
})


const topLevels: Array<Tag>= computed(() => {
  if (props.parentId ) {
    return Tag.Load(props.parentId).tags.filter(DSafeFilter<Tag>)
  }
  return []
})


const totalBooks = (tag: Tag): number => {
  const nbBooks = tag.booksIds.filter(id => DSafeGenericFilter(id, Book.type)).length
  return tag.tags.filter(DSafeFilter).reduce((acc, tag) => {
    return acc + totalBooks(tag)
  }, nbBooks);
}

const totalTopics = (tag: Tag): number => {
  const tags = tag.tags.filter(DSafeFilter)
  const nbTopics = tags.length
  return tags.reduce((acc, tag) => {
    return acc + totalTopics(tag)
  }, nbTopics)
}


const getTopicUrl = (tag: Tag) => {
  if (tag.books.filter(DSafeFilter<Book>).length > 0) {
    return `/bookList/${tag.id}`
  } else if (tag.tags.filter(DSafeFilter<Tag>).length > 0) {
    return `/topic/${tag.id}`
  } else {
    return `#`
  }
}
</script>

<template>
  <v-container fluid class="bg-blue-grey-lighten-4">
    <v-row>
      <v-col cols="12" md="6" lg="4"
             v-for="topic in topLevels"
             :key="topic.id">
        <v-card :to="getTopicUrl(topic)"
                @click="addTopicNavigation(props.parentId, topic.id)"
                variant="flat"
                elevation="2"
                color="white"
                min-height="13rem">
          <v-card-title class="bg-white">
             {{ topic.name }}
          </v-card-title>
          <v-card-text   class="bg-white text-grey-darken-3" style="min-height: 5rem;max-height: 5rem;overflow: hidden;">
            <p class="text-subtitle-1" v-if="topic.description.length>0">
              {{ topic.description }}
            </p>
            <p v-else>
              no description available yet.
              <br />
              <small>Add a description in the CONTRIBUTOR MODE.</small>
            </p>
          </v-card-text>
          <v-card-actions v-if="totalTopics(topic) >0" class="justify-space-between mt-2">
            <v-btn color="primary-darken-2"
                   variant="tonal" rounded border
                   append-icon="mdi-chevron-right"
                   class="ml-2 px-4">
              <strong>{{ totalBooks(topic) }} books</strong>
            </v-btn>
            <v-btn color="black"
                   class="mr-2 px-4"
                   variant="tonal" rounded
                   border   append-icon="mdi-chevron-right">
              <strong>{{ totalTopics(topic) }} topics</strong>
            </v-btn>
          </v-card-actions>
          <v-card-actions v-else>
            <v-btn color="black"
                   variant="tonal" rounded border
                   append-icon="mdi-chevron-right"
                   class="ml-2 px-4">
            {{ totalBooks(topic) }} books
            </v-btn>
          </v-card-actions>

          <!--          <Image :file-id="topic.coverImage" />-->
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>