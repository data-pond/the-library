<script setup lang="ts">

import {ref} from "vue";
import {useLevel} from "@//ts/level.ts";
import ReviewVotes from "@//components/vote/ReviewVotes.vue";


const {levelUp, level, progress, loading: levelLoading} = useLevel()


</script>

<template>
  <v-row justify="center" align="center" v-if="levelLoading">
    Loading
  </v-row>
  <div v-else>
    <ReviewVotes v-if="levelUp"/>
    <v-row v-else justify="center" align="center" v-if="levelLoading">
      <h1>Level Up To ACCESS THIS PAGE</h1>
    </v-row>
  </div>

</template>

<style scoped>

</style>