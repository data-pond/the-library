<script setup lang="ts">

import {Book, Tag} from "@the_library/db";
import {type Reactive, ref, type ShallowRef, shallowRef} from "vue";
import AppLayout from '../../layout/App.vue'
import {useRoute} from "vue-router";
import {DownloadTagBookCovers} from "@the_library/db";
import BookPreview from "@//components/BookPreview.vue";
import TopicManagement from "@//components/TopicManagement.vue";

const route = useRoute()





const load = (): [Reactive<Tag>, ShallowRef<Array<Reactive<Book>>>] => {
  console.time('load books')
  const topLevelId = route?.params?.id
  const tag = Tag.Load(parseInt(topLevelId, 10))
  const books = shallowRef(tag.books)
  console.timeEnd('load books')
  console.log('Books', books)
  DownloadTagBookCovers(tag)
  return [tag, books]
}

let [tag, books] = load()

console.log('ready to render')
//
// watchEffect(() => {
//   const [t, b] = load();
//   tag = t;
//   books.value = b.value;
// })
const showDeleted = ref(false);
const showDSafe = ref(true)
const showBook = book =>  ((showDeleted && book.deleted) || (!book.deleted && !showDeleted)) && ((showDSafe && book.safe) || (!showDSafe && !book.safe))


</script>

<template>
  <AppLayout :title="tag.name">
    <template v-slot:actions>
      <v-btn :to="`/admin/listTopics/${topic.id}`" v-for="topic in tag.inTags" border elevation="3" prepend-icon="mdi-folder-arrow-up"> {{topic.name}}</v-btn>
    </template>
  <v-container fill-height class="bg-grey-lighten-3" fluid>

    <TopicManagement />

    <v-row  >
      <v-col v-for="book in books" :key="book.id"
             cols="12" md="4" lg="3" xl="2" align-self="end" >
        <KeepAlive :max="500">
          <BookPreview :bookId="book.id" />
        </KeepAlive>
      </v-col>
    </v-row>
  </v-container>
  </AppLayout>

</template>

<style scoped>

</style>
