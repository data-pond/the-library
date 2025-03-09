<script setup lang="ts">


import {useRouter} from "vue-router";

const tab = defineModel()

const props = defineProps({
  title: String
})

const dev = import.meta.env.MODE === "development"
const router = useRouter()
const back = () => {
  router.back()
}
</script>

<template>
  <v-app-bar   elevation="5" >

    <v-container>
      <v-row>
    <v-btn class="ml-4"
          color="primary" prepend-icon="mdi-arrow-left"
           variant="outlined"  @click="back()">Back </v-btn>
    <v-spacer />


<!--    <v-btn color="primary" variant="text" density="compact">text</v-btn>-->
<!--    <v-btn color="primary" variant="plain" density="compact">plain</v-btn>-->


<!--    <v-btn color="primary" variant="elevated" elevation="2" density="compact">elevated</v-btn>-->

    <div class="text-warning text-h6 mr-3">
      <strong>Book Admin</strong>
    </div>
      </v-row>
    </v-container>
  </v-app-bar>
  <v-main scrollable>

    <slot></slot>
  </v-main>
</template>

<style scoped>

</style>