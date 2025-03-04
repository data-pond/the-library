<script setup lang="ts">

import Layout from "@//pages/library/help/Layout.vue";
import {Book, DateUtils, dump, NewVote, Vote} from "@the_library/db";

import Page from "@//components/page.vue";
import {useRouter} from "vue-router";

const props = defineProps({
  slotId: Number
})



const data = dump().get(Vote.type)
const allVotes = data ? Array.from(data.values()).filter(v => v.name === 'Best Page Vote Contest').map(v => ({
  vote: v,
  book: Book.Load(v.targetId)
})) : []


const router = useRouter();

const select = (vote: {vote: Vote, book: Book}) => {
  const newVote = NewVote();
  newVote.action = `Attach favorite page to slotId`
  newVote.targetId = vote.book.id;
  newVote.targetType = Book.type;
  newVote.ts=DateUtils.now()
  newVote.link1 = vote.vote.extraId
  newVote.link2 = props.slotId
  newVote.confirmed = false;
  router.push(`/vote/confirm/${newVote.id}`)
}

</script>

<template>
  <Layout>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card elevation="3">
            <v-card-title>
              Select your Image
            </v-card-title>
            <v-card-text>
              Those are the pages that you have selected to participate for the international best page contest.
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="6" md="4">
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

        <v-col cols="6" md="4" v-for="vote in allVotes">
          <v-card @click="select(vote)" elevation="3">

            <v-card-text>
              <Page :file-id="vote.book.pdf" :page="vote.vote.link1" :ratio="0.7"/>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn color="primary" size="large" variant="tonal">CLICK TO SELECT</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>