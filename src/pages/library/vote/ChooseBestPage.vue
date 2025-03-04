<script setup lang="ts">

import Layout from "@//pages/library/help/Layout.vue";
import Page from "@//components/page.vue";
import {computed} from "vue";
import {useAccessBook} from "@//ts/book.ts";
import {Book} from "@the_library/db";

const props = defineProps({
  bookId: Number,
})
const book = computed(() => Book.Load(props.bookId))

const CoverApi = computed(() => useAccessBook(book))
</script>

<template>
  <Layout>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              Click to Choose  a Page
            </v-card-title>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="4" lg="3" v-for="page in CoverApi.max">
          <v-card elevation="3">

              <KeepAlive max="100">
                <Page :file-id="book.pdf" :page="page-1" :key="page" :ratio="0.7"></Page>
              </KeepAlive>

            <v-card-actions class="justify-center">
              <v-btn color="primary" size="x-large" :to="`/previewBestPage/${book.id}/${page}`">
                 Select Page {{page}}
              </v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>