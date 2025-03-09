<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";

import {Book, GetAllActivities, Tag, ActivityAction} from "@the_library/db";
import {ref} from "vue";
import {Activity} from "@the_library/db";
import {useBookList} from "@//ts/book.ts";
import MyBooksTab from "@//pages/library/MyBooksTab.vue";
import MyBooksIdsTab from "@//components/MyBooksIdsTab.vue";

const loaded = ref(false)
const ids = ref([])
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

  ids.value = index[ActivityAction.VisitBook] ? Object.keys(index[ActivityAction.VisitBook])
      .sort((a, b) => index[ActivityAction.VisitBook][b].length - index[ActivityAction.VisitBook][a].length)
      .map(key => parseInt(key, 10)) : []


  loaded.value = true
});

</script>

<template>
  <Layout>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class=" text-center">
              Your visited books
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>

      <MyBooksIdsTab :book-ids="ids" v-if="loaded"/>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>