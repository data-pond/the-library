<script setup lang="ts">

import {Book, DSafeFilter, DSafeGenericFilter, Tag} from "@the_library/db";
import {computed, onMounted} from "vue";
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
                variant="elevated"
                hover
                min-height="13rem">
          <v-card-title class="text-primary">


             {{ topic.name }}

          </v-card-title>
          <v-card-text style="min-height: 5.5rem">
            <p class="text-subtitle-1">
              {{ topic.description }}
            </p>
          </v-card-text>
          <v-card-text v-if="totalTopics(topic) >0">
            {{ totalBooks(topic) }} books and {{ totalTopics(topic) }} topics.
          </v-card-text>
          <v-card-text v-else>
            {{ totalBooks(topic) }} books
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn color="primary">
              click to visit
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