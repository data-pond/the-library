<script setup lang="ts">


import {computed, ref, watchEffect} from "vue";
import {DownloadState, getFile, getFileStatus, MimeTypes} from "@the_library/db";

const props = defineProps({
  fileId: String,
  ratio: Number,
})

const fileId = computed(() => props.fileId)

const ratio = computed(() => props.ratio || 1 / 2)
const status = computed<DownloadState>(() => getFileStatus(fileId.value).value)


const src = ref(null)


// console.log('FileId: ', fileId, '')

if (status.value === DownloadState.Unknown) {
  // getFile(fileId, MimeTypes.IMAGE)
}

watchEffect(async () => {

  if (status.value === DownloadState.Done) {
    const fileData = await getFile(fileId.value, MimeTypes.IMAGE)


    if (fileData.content instanceof Uint8Array) {
      src.value = URL.createObjectURL(new Blob([fileData.content.buffer]/* (1) */));
    } else {
      src.value = fileData.content
    }
  }
})

</script>

<template>

  <v-img v-if="status === DownloadState.Done" :src="src" :aspect-ratio="ratio"/>
  <v-responsive :aspect-ratio="ratio" v-else content-class="align-center align-content-center">
    <v-row justify="center" align="center" align-content="center" >


      <v-col cols="12" class="text-center text-h5" align-self="center">

        <div v-if="status === DownloadState.Unknown">

        </div>
        <div v-else-if="status === DownloadState.Error">
          Error... {{ fileId }}
        </div>
        <div v-else-if="status === DownloadState.Pending">

        </div>
        <div v-else-if="status === DownloadState.InProgress">

        </div>
        <div v-else>
          Unknown {{ fileId }}
        </div>
        <br />
        <v-progress-circular indeterminate color="primary" :size="50" class="my-4"></v-progress-circular>
      </v-col>

    </v-row>
  </v-responsive>

</template>