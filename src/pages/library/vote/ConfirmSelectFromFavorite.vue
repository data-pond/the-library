<script setup lang="ts">
import {Book, dump, ProcessPdfPage, Vote} from "@the_library/db";

import TheD from "@//components/cms/TheD.vue";
import Page from "@//components/page.vue";
import Vision from "@//components/cms/Vision.vue";
import {useRouter} from "vue-router";
import {ImageVotePlaceHolders} from "@the_library/db";

const props = defineProps({
  voteId: Number
})
const allVotes = dump().get(Vote.type)

const vote = allVotes ? allVotes.get(parseInt(props.voteId, 10)) : null
const router = useRouter();

if (vote ===null) {
  router.push('/')
}

const book = Book.Load(vote.link1)
ProcessPdfPage(book.pdf, vote.link2)

const confirm = () => {
  vote.confirmed = true;
  switch (parseInt(vote.link3, 10)) {
    case ImageVotePlaceHolders.TheD:
      router.push('/d-licence');
      return
    case ImageVotePlaceHolders.Vision:
      router.push('/vision');
      return
  }
}

const cancel = () => {
  router.back()
}

</script>

<template>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" md="8">
        <v-card elevation="3" color="primary">
          <v-card-title>
            <h3>Review your changes.</h3>
          </v-card-title>
          <v-card-text>
            <p class="text-h6">This picture is now the main visual for the following page.</p>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn @click="cancel" size="large" color="secondary" variant="elevated">Cancel</v-btn>
            <v-btn @click="confirm" size="large" color="positive" variant="elevated">Confirm</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <hr  class="my-3"/>
    <v-row>
      <v-col cols="12" md="7">
        <TheD v-if="vote.link3 == ImageVotePlaceHolders.TheD"/>
        <Vision v-else-if="vote.link3 == ImageVotePlaceHolders.Vision"/>
      </v-col>
      <v-col cols="12" md="5" class="align-content-center">
        <v-card elevation="3" >
          <Page :page="vote.link2" :file-id="book.pdf" :ratio="0.7"/>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
</style>