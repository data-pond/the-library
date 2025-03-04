<script setup lang="ts">

import {computed, type Ref, watchEffect} from "vue";
import {
  Book,
  DownloadState,
  DownloadTagBookCovers,
  DSafeGenericFilter,
  getFile,
  getFileStatus,
  MimeTypes, Tag
} from "@the_library/db";
import Image from "@/components/image.vue";
import {useRouter} from "vue-router";

const props = defineProps({
  topicId: Number,
})

const topic = computed(() => Tag.Load(props.topicId))
const books = computed(() => topic.value.booksIds.filter((id: number) => DSafeGenericFilter(id, Book.type)).map((id: number) => Book.Load(id)))
const status = new Map<string, Ref<DownloadState>>();
watchEffect((() => {
  DownloadTagBookCovers(topic.value)
  books.value.forEach(book => {
    status.set(book.pdf, getFileStatus(book.pdf));
  })
}))


const router = useRouter()


const bookAction = (bookid: number) => {

  const book = Book.Load(bookid)
  const bookStatus = status.get(book.pdf).value

  switch (bookStatus) {
    case  DownloadState.Done:
      router.push(`/read/${book.id}`)
      break;
    case DownloadState.Error:
      alert("This book PDF is broken")
      break
    default: {
      getFile(book.pdf, MimeTypes.PDF)
      router.push(`/read/${book.id}`)
      break
    }
  }
}
</script>

<template>


  <v-row>
    <v-col cols="12" md="6" lg="4" xl="3" v-for="book in books" :key="book.id">
      <v-card elevation="4"
              @click="bookAction(book.id)"
              hover>
        <v-card-title class="bg-primary text-white  ">
          {{ book.name }}
        </v-card-title>
        <Image :file-id="book.coverImage" :ratio="0.7"/>
        <v-card-text class="text-center">

          <v-chip color="info" class="text-h6" v-if="status.get(book.pdf).value== DownloadState.Pending">Waiting
          </v-chip>
          <v-chip color="green" class="text-h6 text-green-accent-4"
                  v-else-if="status.get(book.pdf).value== DownloadState.Done">ON YOUR DEVICE
          </v-chip>
          <v-chip color="primary" class="text-h6" v-else-if="status.get(book.pdf).value== DownloadState.Unknown">CLICK
            TO DOWNLOAD
          </v-chip>
          <v-progress-linear v-else-if="status.get(book.pdf).value== DownloadState.InProgress"
                             indeterminate></v-progress-linear>
          <v-chip color="red" class="text-h5" v-else-if="status.get(book.pdf).value== DownloadState.Error">Error
          </v-chip>
          <v-chip v-else class="text-red">Undefined - fuckedup</v-chip>

        </v-card-text>

      </v-card>
    </v-col>
  </v-row>

</template>

<style scoped>

</style>