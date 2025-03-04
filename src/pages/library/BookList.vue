<script setup lang="ts">
import Layout from './Layout.vue';
import MyBooksTab from "@//pages/library/MyBooksTab.vue";

const props = defineProps({
  topTopicId: Number
})
</script>

<template>
  <Layout>

    <MyBooksTab :topicId="props.topTopicId"/>
  </Layout>

</template>

<style scoped>

</style>