<script setup lang="ts">

import AppLayout from "@//layout/App.vue";
import {Book, dump, LoadPreferences, Tag, clearAllPatches} from "@the_library/db";
import {ref, toRaw} from "vue";
import {newCatalogUrl, getCatalorUrlHistory} from "@//ts/catalog.ts";

const db = dump()

const catalogHistory = getCatalorUrlHistory();

const generateTopicJSON = async () => {

  const tagRecords = Array.from(db.get(Tag.type).values()).sort((a, b) => a.id - b.id).map(tag => toRaw(tag))
  const bookRecords = Array.from(db.get(Book.type).values()).sort((a, b) => a.id - b.id).map(book => toRaw(book))

  const tagResponse = await fetch("http://localhost:8080/generate-catalog-file-gz", {
    body: JSON.stringify(tagRecords),
    method: "POST",
  });
  const tagJson = await tagResponse.json();

  const bookResponse = await fetch("http://localhost:8080/generate-catalog-file-gz", {
    body: JSON.stringify(bookRecords),
    method: "POST",
  });
  const bookJson = await bookResponse.json();

  const catalog = {
    "en": [
      "The D-Safe Library",
      "The great Library content - https://datapond.earth - is safe for children, adults and plants.",
      [2,16,36,43,60,65,90,106,110,114,139,168,176,199,212,224,232],
      tagJson.transactionId,
      bookJson.transactionId
    ]
  }
  const catalogResponse = await fetch("http://localhost:8080/generate-catalog-file", {
    body: JSON.stringify(catalog),
    method: "POST",
  });
  const catalogJson = await catalogResponse.json();

  // console.log(tagJson)
  // console.log(bookJson)
  // console.log(catalogJson)
  await clearAllPatches();
  newCatalogUrl(catalogJson.transactionId)
}

const fixing = ref(false)

const fixIntroduction = async (version: string) => {
  fixing.value = true;
  const catalogResponse = await fetch("http://localhost:8080/makeIntroductionTags", {
    method: "POST",
    body: JSON.stringify(version),
  });
  console.log(catalogResponse)
  const json = await catalogResponse.json();
  console.log(json);

  // await clearAllPatches();
  newCatalogUrl(json.catalogIndex)

  fixing.value = false;


}
</script>

<template>
  <AppLayout title="catalog Admin">
    <v-container fill-height fluid>
      <v-row  justify="center">
        <v-col cols="12" md="6">


          <v-btn @click="generateTopicJSON()">Generate Topic JSON</v-btn>
          <hr class="my-5"/>

          <br />
          <v-card>
            <v-card-title>
              <h3>Catalog History</h3>
            </v-card-title>
            <v-list >
              <v-list-item v-for="item in catalogHistory" rounded="shaped">
                <v-list-item-title>
                  {{item}}
                </v-list-item-title>
                <v-list-item-action>
                  <v-btn @click="fixIntroduction(item)" color="primary"  tile elevation="3" border>fix</v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>


        </v-col>
      </v-row>
    </v-container>
  </AppLayout>
</template>

<style scoped>

</style>