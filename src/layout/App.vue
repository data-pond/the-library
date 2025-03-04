<script setup lang="ts">


const {title} = defineProps({
  title: String,
})

const dev = false && import.meta.env.MODE === "development"

</script>

<template>
  <v-app-bar   elevation="5">

    <div class="pl-5 text-h6">Library Admin</div>

    <v-spacer />
    <slot name="actions"></slot>
    <v-spacer />

<!--    <v-btn color="primary" variant="text" density="compact">text</v-btn>-->
<!--    <v-btn color="primary" variant="plain" density="compact">plain</v-btn>-->
<!--    <v-btn color="primary" variant="outlined" class="mx-2" to="/admin">Home</v-btn>-->
    <v-btn v-if="dev" color="primary" variant="tonal"  class="mx-2" elevation="2" to="/admin/bookCoversSync">Sync Covers</v-btn>
    <v-btn v-if="dev" color="primary" variant="flat"  class="mx-2" elevation="2" to="/admin/catalogAdmin" >Catalog</v-btn>
    <v-btn v-if="dev" color="primary" variant="flat"  class="mx-2" elevation="2" to="/admin/fixes" >Fixes</v-btn>

    <v-btn color="primary"  size="small" variant="flat"  class="mx-2" elevation="2" to="/" >open Public Library</v-btn>
<!--    <v-btn color="primary" variant="elevated" elevation="2" density="compact">elevated</v-btn>-->


  </v-app-bar>
  <v-main scrollable>

    <slot></slot>
  </v-main>
</template>

<style scoped>

</style>