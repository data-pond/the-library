<script setup lang="ts">

import {getAllPatchesSince,Tag, loadSyncedData, SyncProvider, ActivityAction, Activity, Book} from "@the_library/db";
import {ref} from 'vue'
/**
 * export enum ActivityAction {
 *     VisitBook,
 *     VisitTopic,
 *     DownloadPdf,
 *     VisitPage
 *
 * }
 */
const voteBooks = ref([])
const voteTopics = ref([]);
const votePages = ref([])
const loading = ref(true);

loadSyncedData().then((data) => {
  const counter = data.syncCounter.patch[SyncProvider.BTCore]
  getAllPatchesSince(counter).then(patchCollection => {
    // Activities
    const bookVisited = {};
    const topicVisited = {};
    const downloads = {};
    const pagesVisited = {};
    if (patchCollection[Activity.type] && Object.values(patchCollection[Activity.type]).length > 0) {
      Object.values(patchCollection[Activity.type]).forEach((patch) => {
        const {action, objectId} = patch.props;
        switch (action) {
          case ActivityAction.VisitBook:
            if (typeof bookVisited[objectId] === "undefined") {
              bookVisited[objectId] = 0;
            }
            bookVisited[objectId]++
            break;
          case ActivityAction.VisitTopic:
            if (typeof topicVisited[objectId] === "undefined") {
              topicVisited[objectId] = 0;
            }
            topicVisited[objectId]++
            break;
          case ActivityAction.DownloadPdf:
            if (typeof downloads[objectId] === "undefined") {
              downloads[objectId] = 0;
            }
            downloads[objectId]++
            break;
          case ActivityAction.VisitPage:
            if (typeof pagesVisited[objectId] === "undefined") {
              pagesVisited[objectId] = 0;
            }
            pagesVisited[objectId]++
            break;
        }
      })
    }

    voteBooks.value = Object.keys(bookVisited).map((bookId) => {
      const score = bookVisited[bookId]
      return {
        score,
        book: Book.Load(parseInt(bookId, 10))
      }
    })

    voteTopics.value = Object.keys(topicVisited).map((topicId) => {
      const score = topicVisited[topicId]
      return {
        score,
        tag: Tag.Load(parseInt(topicId, 10))
      }
    })

    votePages.value = Object.keys(pagesVisited).map((pageId) => {
      const score = pagesVisited[pageId]
      return {
        score,
        pageId
      }
    })

    loading.value = false;
    console.log('patchCollection', patchCollection)
  })
})

</script>

<template>
<v-row>

  <v-col cols="12">
    <h1>Review your next vote!</h1>
    <hr />
    <h2>Topic Votes</h2>
  </v-col>

  <v-col cols="12">
  <v-card elevation="2" outlined>
    <v-card-title class="text-primary">
      <strong>My Topic Votes</strong>
    </v-card-title>
    <v-card-item>
      <v-row>
      <v-col cols="12" md="4" v-for="data in voteTopics">

        <v-card elevation="3" class="pa-2">
          <v-card-title>
            {{data.tag.name}}
          </v-card-title>
          <v-card-text>
            Score: {{data.score}}
          </v-card-text>
        </v-card>
      </v-col>
      </v-row>
    </v-card-item>
  </v-card>

  </v-col>
  <v-col cols="12">

  <v-card elevation="3">
    <v-card-title class="text-primary">
      <strong>My Book votes </strong>
    </v-card-title>
    <v-card-item>


        <v-col cols="12" md="6" v-for="data in voteBooks">

          <v-card elevation="3" class="pa-2">
            <v-card-title>
              {{data.book.name}}
            </v-card-title>
            <v-card-text>
              Score: {{data.score}}
            </v-card-text>
          </v-card>
        </v-col>

    </v-card-item>
    <v-card-actions>
      <v-btn color="primary" size="x-large" append-icon="mdi-chevron-right" variant="tonal" rounded class="px-4">VOTE NOW</v-btn>
    </v-card-actions>

  </v-card>

  </v-col>
  <v-col cols="12">
    <v-card elevation="3" color="primary">
      <v-card-title>
        <strong>Confirm</strong>
      </v-card-title>

      <v-card-actions class="bg-white py-6">
        <v-btn variant="tonal" rounded>
          Vote Now
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</v-row>


</template>

<style scoped>

</style>