<script setup lang="ts">

// const tab = defineModel()

const props = defineProps({
  type: String,
  title: String
})


</script>

<template>
  <v-app-bar   elevation="5" >

    <v-container>
      <v-row>


    <v-btn class="ml-4"
          color="primary" prepend-icon="mdi-arrow-left"
           variant="outlined"   to="/admin">Back</v-btn>
    <v-spacer />

<!--    <template v-slot:extension>-->
<!--      <slot name="actions"></slot>-->
<!--    </template>-->

    <div class="text-warning text-h6 mr-3">
      <strong>Topic Admin</strong>
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