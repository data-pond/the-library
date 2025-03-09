<script setup lang="ts">
import Layout from "@//pages/library/Layout.vue";

import {Book, GetAllActivities, Tag, ActivityAction} from "@the_library/db";
import {ref} from "vue";
import {Activity} from "@the_library/db";
import {addTopicNavigation} from "@//ts/navigation.ts";

const loaded = ref(false)
const myTopics = ref([])
GetAllActivities().then(data => {

  console.log(data)
  const list = data.map(value => {
    return new Activity(value)
  }, {})

  const index = list.reduce((acc, activity: Activity) => {
    if (typeof acc[activity.action] === 'undefined') {
      acc[activity.action] = {}
    }
    if (typeof acc[activity.action][activity.objectId] === 'undefined') {
      acc[activity.action][activity.objectId] = []
    }
    acc[activity.action][activity.objectId].push(activity)
    return acc;
  }, {});

  myTopics.value = index[ActivityAction.VisitTopic] ? Object.keys(index[ActivityAction.VisitTopic]).map(key => {
    const id = parseInt(key, 10)
    return {
      tag: Tag.Load(id),
      score: index[ActivityAction.VisitTopic][key].length,
    }
  }) : [].sort((a, b) => b.score - a.score)


  console.log('index', index)
  loaded.value = true
});

const topicLink = (topic: Tag) => {
  if (topic.booksIds.length > 0) {
    return `/bookList/${topic.id}`
  } else {
    return `/topic/${topic.id}`
  }
}



</script>

<template>
<Layout>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-text class="text-center">
            <h1>Your favorite Topics</h1>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6" lg="4"
             v-for="topic in myTopics"
             :key="topic.tag.id">
        <v-card
                variant="flat"
                elevation="2"
                color="white"
                min-height="13rem">
          <v-card-title class="bg-white">
            {{ topic.tag.name }}
          </v-card-title>
          <v-card-text   class="bg-white text-grey-darken-3" style="min-height: 5rem;max-height: 5rem;overflow: hidden;">
            <p class="text-subtitle-1" v-if="topic.tag.description.length>0">
              {{ topic.tag.description }}
            </p>
            <p v-else>
              no description available yet.
              <br />
              <small>Add a description in the CONTRIBUTOR MODE.</small>
            </p>
          </v-card-text>
          <v-card-actions class="justify-space-between mt-2">
            <v-btn color="primary-darken-2"
                   :to="`/admin/tagAdmin/${topic.tag.id}`"
                   variant="tonal" rounded border
                   append-icon="mdi-chevron-right"
                   class="ml-2 px-4">
              <strong>Admin</strong>
            </v-btn>
            <v-btn color="black"
                   class="mr-2 px-4"
                   :to="`/topic/${topic.tag.id}`"
                   variant="tonal" rounded
                   border   append-icon="mdi-chevron-right">
              <strong>Open</strong>
            </v-btn>
          </v-card-actions>


          <!--          <Image :file-id="topic.coverImage" />-->
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</Layout>
</template>

<style scoped>

</style>