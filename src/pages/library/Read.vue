<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import {computed, ref, watchEffect} from "vue";
import {Book, getMuStatus} from "@the_library/db";
import {useRoute} from "vue-router";
import {useDownload} from "@//ts/download.ts";
import Page from "@//components/page.vue";
import {useAccessBook} from "@//ts/book.ts";
import {useGoTo} from "vuetify";

const props = defineProps({
  bookId: Number
})

const bookId = computed(() => props.bookId)
const book = computed(() => Book.Load(bookId.value))
const route = useRoute()

const bookData = computed(() => getMuStatus(book.value.pdf));

const { downloading,  download} = useDownload(book.value, route)

const selectedCover = ref(0)

const CoverApi = useAccessBook(book)

const fixCover = () => {
  CoverApi.markInvalid()
}
const ggo = useGoTo()

const readPage = (page: number) => {
  selectedCover.value = page
  document.getElementById('carousel')?.scrollIntoView(true)
}
import {useMediaQuery} from '@vueuse/core';
import VoteBookCover from "@//pages/library/vote/VoteBookCover.vue";

const isPhone = useMediaQuery('(orientation: portrait) and (max-width: 800px)')

const height = computed(() => isPhone.value ? '80vh' : '150vh')

watchEffect(() => {
  console.log('Selected cover', selectedCover.value)
  if (selectedCover.value ===75) {
    selectedCover.value=CoverApi.max-1
  }
  if (selectedCover.value >= CoverApi.max) {
    selectedCover.value=0
  }
  if (selectedCover.value<0){
    selectedCover.value=CoverApi.max-1
  }
})


</script>

<template>

  <Layout>
    <v-container fluid>
      <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="3" class="my-2">
          <v-card-title>
            Previewing the Book
          </v-card-title>

          <v-card-text v-if="book.nbPages>=CoverApi.max">
           This book has {{book.nbPages}} pages.
            <br />
            Previewing the first {{CoverApi.max> book.nbPages ? book.nbPages : CoverApi.max}} pages.
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn>Click on any page to open it</v-btn>
          </v-card-actions>
        </v-card>

      </v-col>
      <v-col cols="12" md="6">
        <v-card elevation="3" class="my-2" >
          <v-card-title>
            Get the book
          </v-card-title>
          <v-card-text>
            Use your device PDF reader to open the book
          </v-card-text>
          <v-card-actions class="justify-space-between">
                  <span v-if="!downloading" class="text-primary pl-2">
                    PDF Ready
                  </span>
                  <span v-if="downloading" class="text-red-darken-3 pl-2">
                    Downloading PDF...
                  </span>
            <v-btn color="red-darken-3" variant="elevated"
                   @click="download()"
                   :disabled="downloading"
                   prepend-icon="mdi-file-pdf-box">
              <v-progress-circular indeterminate v-if="downloading"></v-progress-circular>
              <span v-else>
              CLICK HERE TO GET PDF
            </span>

            </v-btn>


          </v-card-actions>

        </v-card>
      </v-col>
        <v-col cols="12" md="6">
          <VoteBookCover :book-id="book.id" />
      </v-col>
      </v-row>
<v-row class="pa-2">
      <v-col cols="3" md="2" lg="1" v-for="count in CoverApi.max" class="pa-1 ma-0">
        <v-card @click="readPage(count-1)" class="pa-0 ma-0" elevation="3">

          <v-card-text  class="pa-0 ma-0">
            <KeepAlive max="100">
              <Page  :file-id="book.pdf" :page="count-1" :ratio="0.7"/>
            </KeepAlive>
          </v-card-text>
          <v-card-text class="justify-center text-center">
            page {{count}}
          </v-card-text>

        </v-card>
      </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-card id="carousel">
            <v-carousel v-model="selectedCover"
                        v-if="bookData.value && bookData.value.dimensions.length>0"
                        :height="height"
                        hide-delimiter-background
                        hide-delimiters
                        show-arrows-on-hover class="pa-4">
              <v-carousel-item
                  v-for="(_, i) in bookData.value.dimensions"
                  :key="i"
                  :value="i"
              >
                <v-sheet
                    height="100%"
                    tile
                >
                  <div class="d-flex fill-height justify-center align-center">
                    <KeepAlive max="100">
                      <Page :file-id="book.pdf" :page="i" :ratio="0.8" />
                    </KeepAlive>

                  </div>
                </v-sheet>
              </v-carousel-item>
            </v-carousel>

          </v-card>

        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>