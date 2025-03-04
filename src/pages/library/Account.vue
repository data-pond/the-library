<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import {Book, GetAllActivities, Tag} from "@the_library/db";
import {ref} from "vue";
import {Activity} from "@the_library/db";
import {ActivityAction} from "@//ts/activity.ts";

const loaded = ref(false)
const myTopics = ref([])
const myBooks = ref([])
const mySuggestions = ref([])
GetAllActivities().then(data => {

  console.log(data)
  const list = data.map(value => {
    return new Activity(value)
  }, {})

  const index = list.reduce((acc, activity: Activity) => {
    if (![ActivityAction.LibraryDownload, ActivityAction.LibraryTopic, ActivityAction.LibraryRead].includes(activity.action)) {
      return acc
    }
    if (typeof acc[activity.action] === 'undefined') {
      acc[activity.action] = {}
    }
    if (typeof acc[activity.action][activity.objectId] === 'undefined') {
      acc[activity.action][activity.objectId] = []
    }
    acc[activity.action][activity.objectId].push(activity.activityTs)
    return acc;
  }, {
    [ActivityAction.LibraryTopic]: {},
    [ActivityAction.LibraryRead]: {},
    [ActivityAction.LibraryDownload]: {},
  });

  myTopics.value = Object.keys(index[ActivityAction.LibraryTopic]).map(key => {
    const id = parseInt(key, 10)
    return {
      tag: Tag.Load(id),
      score: index[ActivityAction.LibraryTopic][key].length,
    }
  }).sort((a, b) => b.score - a.score)

  myBooks.value = Object.keys(index[ActivityAction.LibraryDownload]).map(key => {
    const id = parseInt(key, 10)
    return {
      book: Book.Load(id),
      score: index[ActivityAction.LibraryDownload][key].length,
    }
  }).sort((a, b) => b.score - a.score);

  mySuggestions.value = Object.keys(index[ActivityAction.LibraryRead]).map(key => {
    const id = parseInt(key, 10)
    return {
      book: Book.Load(id),
      score: index[ActivityAction.LibraryRead][key].length,
    }
  }).sort((a, b) => b.score - a.score);
  loaded.value = true
});


const topicLink = (topic: Tag) => {
  if (topic.booksIds.length >0) {
    return `/bookList/${topic.id}`
  } else {
    return `/topic/${topic.id}`
  }
}
</script>

<template>

  <Layout>
    <v-container fluid>


      <div v-if="loaded">

        <v-row>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>
                Suggestions
              </v-card-title>
              <v-card-subtitle>
                You have visited these books in the past.
              </v-card-subtitle>
              <v-card-text>
                <v-list v-if="mySuggestions.length>0">
                  <v-list-item v-for="suggestion in mySuggestions"

                               rounded="shaped"
                               :to="`/read/${suggestion.book.id}`">
                    <v-list-item-title>
                      {{ suggestion.book.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ suggestion.score }} visits
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <div v-else class="text-primary">
                  No Suggestions yet
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>Downloaded Books</v-card-title>

              <v-card-subtitle>Those books are already downlaoded on your device</v-card-subtitle>
              <v-card-text>
                <v-list v-if="myBooks.length>0">
                  <v-list-item v-for="book in myBooks" rounded="shaped">
                    <v-list-item-title>
                      {{ book.book.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ book.score }} visits
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <div v-else class="text-primary">
                  No Books downloaded yet
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>Favorite Topics</v-card-title>

              <v-card-subtitle>Those are the topics you most often visit</v-card-subtitle>
              <v-card-text>

                <v-list v-if="myTopics.length>0">
                  <v-list-item v-for="topic in myTopics" rounded="shaped"
                               :to="topicLink(topic.tag)">
                    <v-list-item-title>
                      {{ topic.tag.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ topic.score }} visits
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <div v-else class="text-primary">
                  No Topics visited yet
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

      </div>


    </v-container>
  </Layout>
</template>

<style scoped>

</style>