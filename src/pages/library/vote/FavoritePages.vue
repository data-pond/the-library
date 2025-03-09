<script setup lang="ts">

import Layout from "@//pages/library/help/Layout.vue";
import {Book} from "@the_library/db";

import Page from "@//components/page.vue";
import {ref} from "vue";
import {ProcessPdfPage} from "@the_library/db";
import {loadFavoritePageVotes} from "@//ts/vote.ts";

const allVotes = loadFavoritePageVotes().map(v => ({
  vote: v,
  book: Book.Load(v.link1)
}));

allVotes.forEach(({vote, book}) => {
  console.log(vote)
  console.log(`calling processPdfPage for ${book.pdf}, page=${vote.link2}`)
  ProcessPdfPage(book.pdf, vote.link2)
})
const activeVoteId = ref(null)
const interactWith = (vote:any) => {
  activeVoteId.value = vote.vote.id;
}
</script>

<template>
  <Layout>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card elevation="3">
            <v-card-title>
              Favorite Pages Election
            </v-card-title>
            <v-card-subtitle>
              Those are the pages that you have selected to participate for the international best page contest.
            </v-card-subtitle>
            <v-card-actions class="justify-end">
              <v-btn disabled>Coming soon - Best Cover Contest</v-btn>
            </v-card-actions>

          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="3"  style="height:100%">

            <v-card-text class="justify-center align-content-center fill-height text-center">
              <v-icon icon="mdi-palette" color="secondary" size="10rem" ></v-icon>
              <br />
              <h3 class="text-secondary">Personalize your Library</h3>
              <br />
              <p>You can replace the illustration of those two pages.</p>
              <br />

              <v-btn size="large" color="secondary" class="mx-1" to="/vision?edit">VISION</v-btn>
              <v-btn size="large" color="secondary" class="mx-1" to="/d-licence?edit">The D.</v-btn>
            </v-card-text>


          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card elevation="3"  style="height:100%">

            <v-card-text class="justify-center align-content-center fill-height text-center">
              <v-icon icon="mdi-playlist-plus" color="primary" size="10rem" ></v-icon>
              <br />
              <h3 class="text-primary">Vote for your favorite page</h3>
              <br />
              <v-btn size="large" color="primary" to="/help/voteBestCover">learn more</v-btn>
            </v-card-text>


          </v-card>
        </v-col>

        <v-col cols="12" md="4" v-for="vote in allVotes">
          <v-card @click="interactWith(vote)">


            <Page :file-id="vote.book.pdf" :page="vote.vote.link2" :ratio="0.7"/>

            <v-row class=" position-absolute text-center"
                   align-content="space-around"
                   justify="space-between"
                 v-if="activeVoteId==vote.vote.id"
                 style="width: 100%; height: 100%;top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.7)">


              <v-col cols="12" class=" text-center">
              <v-btn :to="`/read/${vote.book.id}`"
                     color="primary" size="x-large" variant="elevated">Open Book</v-btn>
              </v-col>
              <v-col cols="12">
              <v-btn color="secondary" variant="elevated" disabled size="x-large">zoom</v-btn>
              </v-col>
              <v-col cols="12">
              <v-btn color="red" variant="elevated" disabled size="x-large">remove</v-btn>
              </v-col>
            </v-row>
            <hr/>

          </v-card>
        </v-col>

      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>