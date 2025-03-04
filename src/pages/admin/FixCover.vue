<script setup lang="ts">

import {
  type Book,
  type BookData,
  DateUtils,
  DownloadState,
  getFile, getFileStatus, getMuStatus,
  LoadPdfPage,
  MimeTypes,
  storeLocalFile
} from "@the_library/db";
import {computed, type Ref, ref} from "vue";
import {addInvalidBookCover, isInvalidCover} from "@//db";

const props = defineProps({
  bookId: Number
})

const book =  Book.Load(props.bookId)

const invalidCover = ref(false)
const pdfStatus: Ref<BookData> = getMuStatus(book.pdf);

const max = book.nbPages<9 ? book.nbPages : 9

const pdfParsed = (dimensions: Array<any>) => {
  for (let i=0; i<max; i++) {
    if (dimensions[i] == null) {
      return false
    }
  }
  return true
}

const pdfReady = computed(() => {
  return pdfStatus.value!==null && pdfParsed(pdfStatus.value.dimensions)
})

const pdfFileStatus = getFileStatus(book.pdf)

if (!pdfReady.value && pdfFileStatus.value === DownloadState.Done) {
  getFile(book.pdf, MimeTypes.PDF)
}



const markInvalid = () => {
  invalidCover.value = true
  getFile(book.pdf, MimeTypes.PDF)
  addInvalidBookCover(book.id)
}
const selectedIndex = ref(null)
if (book.coverImage.startsWith('Book_local')) {
  selectedIndex.value = parseInt(book.coverImage.split('_')[2])
}
const loading = ref(false)
const setPage = (index) => {
  selectedIndex.value = index
  loading.value = true
  LoadPdfPage(book.pdf, index-1).then(({content}) => {
    storeLocalFile({
      local: true,
      content,
      mime: MimeTypes.IMAGE,
      creationTime: DateUtils.now(),
      id: `Book_local_${index-1}_${book.id}`,
      sizeKb: Math.ceil(content.byteLength / 1024)
    }).then(() => {
      book.coverImage = `Book_local_${index-1}_${book.id}`
      loading.value = false
    })
  })
}

const toggleDelete = () => {
  book.deleted = !book.deleted
}

isInvalidCover(book.id).then(valid => {
  invalidCover.value = valid;
});
</script>

<template>
  <div v-if="pdfFileStatus === DownloadState.Done">
    <div v-if="pdfReady">
      <v-btn v-for="index in max" @click="setPage(index)"
             size="small"
             class="ml-1 mt-1"
             color="primary"
             border
             elevation="1"
             :variant="index == selectedIndex ? 'tonal' : 'outline'">
        {{index}}
      </v-btn>
    </div>
    <div v-else>
      <v-progress-linear
          color="lime"
          height="10"
          indeterminate
          class="q-my-2"
          striped
      ></v-progress-linear>
      <br />
      <h4>Processing pages</h4>
    </div>
  </div>
  <div v-else>
    <v-progress-linear
        color="lime"
        height="10"
        indeterminate
        class="q-my-2"
        striped
    ></v-progress-linear>
    <br />
    <h4>Downloading</h4>
  </div>
</template>

<style scoped>

</style>