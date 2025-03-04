<script setup lang="ts">
import {Book, dump, Vote} from "@the_library/db";

import TheD from "@//components/cms/TheD.vue";
import Page from "@//components/page.vue";
import Vision from "@//components/cms/Vision.vue";
import {useRouter} from "vue-router";
import {ImageVotePlaceHolders} from "@the_library/db";

const props = defineProps({
  voteId: Number
})
console.log(dump())
const allVotes = dump().get(Vote.type)

console.log(allVotes.values())

const vote = allVotes.get(parseInt(props.voteId, 10))

const book = Book.Load(vote.targetId)

const router = useRouter();



const confirm = () => {
  vote.confirmed = true;
  switch (vote.link2) {
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
    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="3" color="primary">
          <v-card-title>
            Confirm your vote
          </v-card-title>
          <v-card-text>
            This is a preview of your changes. You must confirm or cancel to continue.
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn @click="cancel" size="large" color="secondary" variant="elevated">Cancel</v-btn>

            <v-btn @click="confirm" size="large" color="positive" variant="elevated">Confirm</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="7">
        <TheD v-if="vote.link2 === ImageVotePlaceHolders.TheD"/>
        <Vision v-else-if="vote.link2 === ImageVotePlaceHolders.Vision"/>
      </v-col>
      <v-col cols="12" md="5" class="align-content-center">
        <Page :page="vote.link1" :file-id="book.pdf" :ratio="0.7"/>
      </v-col>

    </v-row>
  </v-container>
</template>

<style scoped>

</style>