<script setup lang="ts">
import {Book} from "@the_library/db";
import Page from "@//components/page.vue";
import {ProcessPdfPage} from "@the_library/db";
import {hasStartedBestBookCoverContest, loadVotesForSlot} from "@//ts/vote.ts";

const props = defineProps({
  slotId: Number
})
const voted = loadVotesForSlot(props.slotId)
const book = voted.length>0 ? Book.Load(voted[0].link1) : null

const voteLink = hasStartedBestBookCoverContest() ? `/vote/selectFromFavorite/${props.slotId}` : '/help/voteBestCover'

if (voted.length>0) {
  console.log(`calling processPdfPage for ${book.pdf}, page=${voted[0].link2}`)
  ProcessPdfPage(book.pdf, voted[0].link2)
}

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
  <v-card class="pa-0 my-3" elevation="3" color="secondary">
    <v-card-title>
      <h3><u>Contest activated</u></h3>
    </v-card-title>
    <v-card-title>
      You are invited in a group vote review.
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
    <Page :file-id="book.pdf" :page="voted[0].link2" :ratio="0.7"/>

      <v-card-actions class="justify-center">
        <v-btn color="secondary" size="large" variant="outlined" :to="`/vote/selectFromFavorite/${slotId}`">CLICK TO CHANGE</v-btn>
      </v-card-actions>


  </v-card>
  </div>
</template>

<style scoped>

</style>