<script setup lang="ts">

import {ref} from "vue";

import {proResolver} from "@the_library/db";

// Since v1.5.1 you're now able to call the init function for the web version without options. The current URL path will be used by default. This is recommended when running from a gateway.

const uploadOpened = ref<boolean>(false)
const savingImage = ref(false)
const newUpload = ref(null)

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
    console.log(data)
    localStorage.setItem("arKeys", JSON.stringify(data));

    savingImage.value = false;
    uploadOpened.value = false;
      console.log('File saved')

  })
}


</script>

<template>

  <v-btn @click="uploadOpened=true">Add ArWeave Key</v-btn>

  <v-dialog max-width="800" v-model="uploadOpened" width="auto" >


    <v-card :loading="savingImage">
      <v-card-title>
        <h3>Select Your Arweave Key</h3>
      </v-card-title>
      <v-card-text>
        <v-file-upload clearable
                       browse-text="Local FileSystem"
                       divider-text="or choose locally"
                       icon="mdi-upload"
                       accept="application/json"
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