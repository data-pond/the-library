<script setup lang="ts">

import {Tag, getTopLevels} from "@the_library/db";
import {ref, shallowRef, watchEffect} from "vue";

const topLevels = shallowRef<Array<Tag>>([])
import {useRoute, useRouter} from 'vue-router'

import TagCoverUploader from '../../components/TagCoverUpload.vue';
import Image from '../../components/image.vue';
import AppLayout from '../../layout/App.vue';
import TopicManagement from "@//components/TopicManagement.vue";

const route = useRoute()

const topTag = ref<Tag>(null)

watchEffect(() => {
  const topLevelId = route?.params?.id


  console.log(route)
  if (topLevelId) {
    topTag.value = Tag.Load(parseInt(topLevelId, 10))
    topLevels.value = Tag.Load(parseInt(topLevelId, 10)).tags
  } else {
    topLevels.value = getTopLevels()
  }

})


const selectedTag = ref<number>(null)
const selectTag = (tag: Tag) => {
  selectedTag.value = tag.id
}

const manageTopicSelectedIds = ref([])

const router = useRouter()
const openTopic = (topic) => {
  if (topic.booksIds.length >0) {
    router.push(`/admin/tagAdmin/${topic.id}?tab=2`)
  } else if (topic.tagsIds.length > 0) {
    router.push(`/admin/tagAdmin/${topic.id}?tab=1`)
  } else {
    return
  }
}
</script>

<template>
  <AppLayout :title="topTag ? topTag.name : 'Topic index'" >


    <template v-slot:actions>
      <v-btn :to="`/admin/listTopics/${topic.id}`"
             v-if="topTag"
             class="mx-2"
             density="compact"
             v-for="topic in topTag.inTags" border elevation="3"  variant="outlined">
        UP
      </v-btn>

      <v-btn v-if="topTag && topTag.booksIds.length>0"
             :to="`/admin/listBooks/${topTag.id}`"
             border elevation="3" class="mx-2"
             density="compact" variant="outlined">
         {{topTag.booksIds.length}} Books
      </v-btn>
    </template>


<!--    <FileUploadStatus />-->
<!--    <TagCoverUploader v-if="topLevels.length>0" :tagId="selectedTag" />-->
    <v-container fluid>
    <v-row>
      <v-col v-for="tag in topLevels"  cols="12" md="6" lg="4" xl="3"  align-self="end" >
        <v-card elevation="1"
                variant="flat"
                @click="openTopic(tag)" color="white" class="clickable">

            <v-card-title  class="bg-white">
              {{tag.name}}
            </v-card-title>
            <v-card-text  class="bg-white text-grey-darken-3">
              {{tag.description}}
            </v-card-text>
<!--          <v-card-text  class="bg-white">-->
<!--            <Image :fileId="tag.coverImage" />-->
<!--            <v-btn @click="selectTag(tag)" color="primary"  tile elevation="3" border>-->
<!--              Edit Image-->
<!--            </v-btn>-->
<!--          </v-card-text>-->
          <v-card-text class="bg-white pa-2 " >

            <v-btn v-if="tag.tags.length>0" color="black"
                   variant="tonal" rounded
                    border   append-icon="mdi-chevron-right">
               <strong>{{tag.tags.length}} sub topics</strong>
            </v-btn>

            <v-btn v-if="tag.books.length>0" color="primary-darken-2"
                   variant="tonal" rounded border
                   append-icon="mdi-chevron-right"
                   class="ml-2">
              <strong>{{tag.books.length}} Books</strong>
            </v-btn>

          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    </v-container>
  </AppLayout>
</template>

<style scoped lang="scss">
.clickable {
  &:hover {
    background-color: #fff !important;
  }
}
</style>

