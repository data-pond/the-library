<script setup lang="ts">
import {Book, dump, Vote} from "@the_library/db";
import Page from "@//components/page.vue";
import {VoteAction} from "@//ts/vote.ts";

const props = defineProps({
  slotId: Number
})
const db = dump()

const hasVoteDb = db.has(Vote.type)
const votes = hasVoteDb ? Array.from(db.get(Vote.type).values()) : []

const voted = votes.filter(v => v.action == VoteAction.FavoriteSlotId && v.link2 === props.slotId).sort((a,b) => b.ts - a.ts)

const book = voted.length>0 ? Book.Load(voted[0].targetId) : null

const allVotes = votes.filter(v => v.name === VoteAction.FavoritePages)

const voteLink = allVotes.length>0 ? `/vote/selectFromFavorite/${props.slotId}` : '/help/voteBestCover'



console.log('voted', voted)
</script>

<template>


  <v-card class="pa-0 ma-0" v-if="voted.length===0">
    <slot />
    <hr />
    <v-card-title class="justify-center text-center">
      Replace this AI with a real cover
    </v-card-title>
    <v-card-actions class="justify-center">
      <v-btn color="primary" variant="outlined" :to="voteLink">
        Vote for the best Cover
      </v-btn>
    </v-card-actions>
  </v-card>
  <div v-else>
  <v-card class="pa-0 mb-3" elevation="3" >
    <v-card-title>
      <h3 class="text-primary">Contest activated</h3>
    </v-card-title>
    <v-card-title>
      You have activated a vote contest.
    </v-card-title>
    <v-card-text>
      <p>3 minutes of your time to elect the top 50</p>
      <p>Finalize your vote to see the contest result.</p>
    </v-card-text>
    <v-card-actions class="justify-center">
      <v-btn to="/finalize" color="primary" variant="outlined" disabled >Coming soon</v-btn>
    </v-card-actions>
  </v-card>
    <v-card>
    <Page :file-id="voted[0].extraData.bookPdf" :page="voted[0].extraData.selectedPage" :ratio="0.7"/>

      <v-card-actions class="justify-center">
        <v-btn color="secondary" size="large" variant="outlined" :to="`/vote/selectFromFavorite/${slotId}`">CLICK TO CHANGE</v-btn>
      </v-card-actions>


  </v-card>
  </div>
</template>

<style scoped>

</style>