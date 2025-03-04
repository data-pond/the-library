<script setup lang="ts">

import {computed,  ref, watch} from "vue";
import { Tag} from "@the_library/db";
import Layout from './Layout.vue';
import {DSafeFilter} from "@the_library/db";
import {addTopicNavigation, GetLastNavigationParentOf} from "@//ts/navigation.ts";
import TopicDirectory from "@//pages/library/TopicDirectory.vue";

const {topicId} = defineProps({
  topicId: Number
})

console.log(`topicId: ${topicId}`)

const topTopic = ref(Tag.Load(topicId));


const nav = ref(GetLastNavigationParentOf(topicId))

const Parenttag = computed(() => nav.value ? Tag.Load(nav.value) : null)

watch(
    () => topicId,
    (newTopicId) => {
      topTopic.value = Tag.Load(newTopicId)
      nav.value = GetLastNavigationParentOf(topicId)
    })


</script>

<template>
  <Layout>
    <v-container fluid>
      <v-row v-if="topTopic!==null">
        <v-col cols="12" class="pa-0 ma-0">
          <TopicDirectory :parent-id="topTopic.id" />
        </v-col>
      </v-row>
      <v-row v-else>
        <h1>Loading... no ID defined</h1>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>