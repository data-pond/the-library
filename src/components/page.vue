<script setup lang="ts">


import {computed, ref, watchEffect} from "vue";
import {getMuStatus} from "@the_library/db";
import {LoadPdfPage} from "@the_library/db";

const props = defineProps({
  fileId: String,
  page: Number,
  ratio: Number,
})

const fileId = props.fileId
const page =  props.page

const ratio =  props.ratio || 1 / 2

const muStatus = getMuStatus(fileId)

const pageAvailable = computed(() => muStatus.value && muStatus.value.dimensions[page] && muStatus.value.dimensions[page].width > 0)

const src = ref(null)
const loaded = ref(false)
watchEffect(() => {
  if (pageAvailable.value) {
    LoadPdfPage(fileId, page).then((data: any) => {
      console.log('Loaded page ', data)
      src.value = URL.createObjectURL(new Blob([data.content.buffer]))
      console.log('src', src.value)
      loaded.value = true
    })
  }
})


</script>

<template>
  <v-img v-if="loaded" :src="src" :ratio="ratio" :alt="`Page ${page+1}`"/>
  <v-responsive :aspect-ratio="ratio" v-else content-class="align-center align-content-center">
    <v-row justify="center" align="center" align-content="center" >
      <v-col cols="12" class="text-center text-h5" align-self="center">
        <v-progress-circular indeterminate color="primary" :size="50" class="my-4"></v-progress-circular>
      </v-col>
    </v-row>
  </v-responsive>
</template>