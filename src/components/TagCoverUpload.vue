<script setup lang="ts">

import {computed, ref, watch, watchEffect} from "vue";
import {DateUtils, getRecord, MimeTypes, proResolver, storeLocalFile, Tag} from "@the_library/db";
import {Dialog, hideDialog, registerDialog, registerOpened, showDialog} from "@//ts/dialog.ts";


const {opened, props} = registerOpened(Dialog.TagCoverUpload)

const selectedTag = ref(null)

const savingImage = ref(false)
const newUpload = ref<File>(null)
watch(() => props, () => {
  if (props.value.tagId) {
    selectedTag.value = Tag.Load(props.value.tagId)
  }
})



function readImage(file: File): Promise<any> {
  const imgResolve = proResolver();
  // Check if the file is an image.
  if (file.type && !file.type.startsWith('image/')) {
    console.log('File is not an image.', file.type, file);
    imgResolve.reject(`File is not an image. ${file.type} - ${file}`);
    return imgResolve.pro
  }

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    // @ts-ignore
    imgResolve.resolve(event.target.result);
  });
  reader.readAsDataURL(file);
  return imgResolve.pro;
}

const onFileChoose = (file: File) => {
  console.log(file);
  savingImage.value = true;
  readImage(file).then(data => {
    storeLocalFile({
      local: true,
      content: data,
      mime:MimeTypes.IMAGE,
      creationTime: DateUtils.now(),
      sizeKb: file.size / 1024,
      id: `Tag_local_${selectedTag.value.id}`
    }).then(() => {
      selectedTag.value.coverImage = `Tag_local_${selectedTag.value.id}`
      savingImage.value = false;
      hideDialog(Dialog.TagCoverUpload)
      console.log('File saved')
    })

  })
}


</script>

<template>
  <v-dialog max-width="800" v-model="opened" width="auto" >


    <v-card :loading="savingImage">
      <v-card-title>
        <h3>{{selectedTag.name}}</h3>
      </v-card-title>
      <v-card-subtitle>Select an image that represent the topic <strong>{{selectedTag.name}}</strong></v-card-subtitle>
      <v-card-text>
        <v-file-upload clearable
                       browse-text="Local FileSystem"
                       divider-text="or choose locally"
                       icon="mdi-upload"
                       accept="image/png, image/jpeg"
                       @update:model-value="onFileChoose"
                       :disabled="savingImage"
                       show-size
                       :multiple="false"
                       v-model="newUpload"></v-file-upload>
      </v-card-text>
    </v-card>

  </v-dialog>

</template>

<style scoped>

</style>