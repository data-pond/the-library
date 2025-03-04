<script setup lang="ts">

// const tab = defineModel()

const props = defineProps({
  type: String,
  title: String
})

const dev = import.meta.env.MODE === "development"

</script>

<template>
  <v-app-bar   elevation="5" >

    <v-btn class="ml-4"
          color="primary" prepend-icon="mdi-arrow-left"
           variant="outlined"   to="/admin">Back</v-btn>
    <v-spacer />

    <p class="text-center pa-0 ma-0">
    <small class="text-info">TOPIC ADMIN</small>
    <br />
    <small><strong>{{props.title}}</strong></small>
    </p>

    <v-spacer />


<!--    <v-btn color="primary" variant="text" density="compact">text</v-btn>-->
<!--    <v-btn color="primary" variant="plain" density="compact">plain</v-btn>-->


<!--    <v-btn color="primary" variant="elevated" elevation="2" density="compact">elevated</v-btn>-->


    <template v-slot:extension>
      <slot name="actions"></slot>
    </template>

  </v-app-bar>
  <v-main scrollable>

    <slot></slot>
  </v-main>
</template>

<style scoped>

</style>