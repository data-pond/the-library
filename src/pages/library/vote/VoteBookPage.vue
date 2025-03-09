<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import {computed, ref} from "vue";
import {Book, DateUtils, VoteAction} from "@the_library/db";
import Page from "@//components/page.vue";
import {useAccessBook} from "@//ts/book.ts";
import {NewVote, Vote} from "@the_library/db";
import {useRoute, useRouter} from "vue-router";


const props = defineProps({
  bookId: Number
})
const book = computed(() => Book.Load(props.bookId))
const pageNumber = ref(null)
const show = ref(false)

const coverApi = useAccessBook(book)

const step = ref(0)

const cardImageClick = (page: number) => {

  if(step.value === 0) {
    pageNumber.value = page
    step.value = 1
    return
  }
  return true
}
const cancelChoice = (e) => {
  e.preventDefault()
  e.stopPropagation()
  console.log(e)
  step.value=0
  console.log('cancelled')
}
const router = useRouter()

const newVote = () => {
  const vote: Vote = NewVote();
  vote.ts = DateUtils.now()
  vote.link1 = book.value.id
  vote.action = VoteAction.FavoritePages
  vote.link2 = parseInt(pageNumber.value, 10);
  vote.link3 = -1;
  vote.confirmed = false;
  console.log('New Vote: ', vote)
  return vote
}

const confirmVote = (p: number) => {
  if(step.value === 1) {
    pageNumber.value = p
    step.value = 2

    newVote();
    router.push(`/vote/bestCovers`)
    return
  }
  return true
}
const voteNumberError = ref(false)
const voteErrorMessage = ref(null)
const setPage = () => {
  if (pageNumber.value == null) {
    voteNumberError.value = true
    voteErrorMessage.value='you must enter the Page Number to vote'
  } else if (pageNumber.value >= book.value.nbPages) {
    voteNumberError.value = true
    voteErrorMessage.value='Invalid Page Number'
  } else {
    voteNumberError.value = false
    voteErrorMessage.value = null;
    const vote: Vote = newVote()
    router.push(`/vote/bestCovers`)
    return
  }
}

</script>

<template>
<Layout>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" md="8">
        <v-card >
          <v-card-title>
            Vote for the best page
          </v-card-title>
          <v-card-subtitle>
            Welcome to the contest
          </v-card-subtitle>
          <v-card-text>
            To choose a page from this book, you can use the builtin pdf viewer,
            which is limited to the first 14 pages, or directly specify the page number for larger books.
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="8"  v-if="!show">
        <v-card @click="show=!show">
        <v-card-title>
          Preview the pages
        </v-card-title>
          <v-card-subtitle>
            Choose the winner from the first 14 pages
          </v-card-subtitle>
          <v-card-actions class="justify-end">
            <v-btn color="primary" variant="outlined" size="large">CLICK to choose from 14 Pages</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <v-container fluid >

        <v-row v-if="show">
          <v-col cols="12" md="6" lg="4" v-for="count in coverApi.max" >
            <v-card elevation="3" @click="cardImageClick(count-1)">
              <v-card-text>
                <KeepAlive :max="100">
                  <Page :file-id="book.pdf" :page="count-1" :ratio="0.7"/>
                </KeepAlive>
              </v-card-text>
              <v-card-actions class="justify-space-between">
                <v-btn color="secondary" variant="outlined" @click="cancelChoice($event)"
                       v-if="step==1 && pageNumber==count-1">Cancel</v-btn>
                <v-btn color="primary" variant="outlined" @click="confirmVote(count-1)"
                       v-if="step==1 && pageNumber==count-1 ">Confirm</v-btn>
                <v-btn color="primary" variant="outlined"
                       v-if="step==0">click image to Vote</v-btn>
              </v-card-actions>
            </v-card>

          </v-col>
        </v-row>

  </v-container>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">

        <v-card>
          <v-card-title>
            Enter the page number
          </v-card-title>
          <v-card-subtitle>
            Manual input
          </v-card-subtitle>
          <v-card-text>
            Download and read the PDF, then manually enter  the page number here.
          </v-card-text>
          <v-card-text>

            <v-number-input v-model="pageNumber"
                            :min="1" :max="book.nbPages"
                            label="Page Number"  :error="voteNumberError" :error-messages="voteErrorMessage"/>


          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn class="primary" variant="outlined" size="large" @click="setPage">
              Vote NOW
            </v-btn>
            <v-btn  color="red" size="large" variant="outlined">click to Download PDF</v-btn>
          </v-card-actions>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</Layout>
</template>

<style scoped>

</style>