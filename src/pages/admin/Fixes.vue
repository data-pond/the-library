<script setup lang="ts">

import {
  Book,
  type BookData,
  DateUtils,
  dump,
  getFile,
  getMuStatus,
  LoadPdfPage,
  MimeTypes,
  storeLocalFile
} from "@the_library/db";
import Layout from "@//layout/App.vue";
import {PatchInstance} from "@the_library/db";
import type {Ref} from "vue";
import {FieldType, Op} from "@the_library/db";
import {addInvalidBookCover, isInvalidCover} from "@//db";
const db = dump();

const bookWithLocal: Array<Book> = Array.from(db.get(Book.type).values()).filter((b) => b.coverImage.startsWith('Book_local'))


const pdfParsed = (dimensions: Array<any>, max: number) => {
  for (let i=0; i<max; i++) {
    if (dimensions[i] == null) {
      return false
    }
  }
  return true
}
/*
const pdfStatus: Ref<BookData> = getMuStatus(book.pdf);

const max = book.nbPages<9 ? book.nbPages : 9


const pdfReady = computed(() => {
  return pdfStatus.value!==null && pdfParsed(pdfStatus.value.dimensions)
})

const pdfFileStatus = getFileStatus(book.pdf)

if (!pdfReady.value && pdfFileStatus.value === DownloadState.Done) {
  getFile(book.pdf, MimeTypes.PDF)
}


 */

for (const book of bookWithLocal) {
  const pdfStatus: Ref<BookData> = getMuStatus(book.pdf);
  const max = book.nbPages<9 ? book.nbPages : 9
  if (pdfStatus.value!==null && pdfParsed(pdfStatus.value.dimensions, max)) {

    const operation = {
      op: Op.replace,
      type: FieldType.prop,
      value: book.coverImage,
      name: 'coverImage'
    }
    console.log(book.id, operation)
    console.log(PatchInstance.data)
    // PatchInstance.addPatch('Book',book.id, operation)


  } else {
    getFile(book.pdf, MimeTypes.PDF)
    addInvalidBookCover(book.id).catch(e => {})

  }
}
const check = async () => {

  for (const book of bookWithLocal) {
    const pdfStatus: Ref<BookData> = getMuStatus(book.pdf);
    const max = book.nbPages<9 ? book.nbPages : 9
    if (pdfStatus.value!==null && pdfParsed(pdfStatus.value.dimensions, max)) {

      const index = parseInt(book.coverImage.split('_')[2], 10);
      console.log('index', book.coverImage, index)
      const data:any = await LoadPdfPage(book.pdf, index)
      await storeLocalFile({
        local: true,
        content: data.content,
        mime: MimeTypes.IMAGE,
        creationTime: DateUtils.now(),
        id: `Book_local_${index}_${book.id}`,
        sizeKb: data.content.byteLength / 1024
      });

      const operation = {
        op: Op.replace,
        type: FieldType.prop,
        value: book.coverImage,
        name: 'coverImage'
      }
      // console.log(book.id, operation)
      PatchInstance.addPatch('Book',book.id, operation)
    }
  }
}
</script>

<template>

  <Layout title="fixes">

    <h1>{{bookWithLocal.length}} inconsistencies</h1>
    <v-btn @click="check">Check</v-btn>
    <v-list>
      <v-list-item v-for="book in bookWithLocal" :key="book.id">
        <v-list-item-title>
          {{book.name}}
        </v-list-item-title>
        {{book.coverImage}}
      </v-list-item>
    </v-list>
  </Layout>
</template>

<style scoped>

</style>