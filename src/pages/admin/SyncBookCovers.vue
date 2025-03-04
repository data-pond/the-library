<script setup lang="ts">
import {Book, dump, getAllPatches, getFile, MimeTypes, proResolver} from '@the_library/db';
import {ref} from 'vue'
import AppLayout from "@//layout/App.vue";
import {clearInvalidCovers} from "@//db";


const loadPendingCovers = async (): Promise<Array<any>> => {
  const p = await getAllPatches()
  if (p.Book) {
    return Object.keys(p.Book).filter((bookId) => {
      return typeof p.Book[bookId].props.coverImage !== 'undefined' && p.Book[bookId].props.coverImage.startsWith('Book_local')
    }).map((bookId) => {
      try {

        const book = Book.Load(parseInt(bookId, 10));
        // const book = data.get('Book').get(bookId)
        return {
          book,
          cover: p.Book[bookId].props.coverImage
        }
      } catch (e) {
        console.error(e);
        return {
          book: {title: null},
          cover: p.Book[bookId].props.coverImage
        }
      }
    })
  } else {
    return [];
  }
}
const patches = ref([])

loadPendingCovers().then(p => patches.value = p)

const running = ref(false)
const syncProgress = ref(0);

const sync = async (patch): Promise<boolean> => {
  console.log('syncing patch ', patch)
  const data = await getFile(patch.cover, MimeTypes.IMAGE)

  // const pro = proResolver<Uint8Array>()
  // const fr = new FileReader();
  // fr.onload = () => {
  //   // It worked
  //   const array = new Uint8Array(fr.result);
  //   pro.resolve(array)
  //   // ...use the array here...
  // };
  // fr.onerror = (err) => {
  //   // The read failed, handle/report it
  //   pro.reject(err)
  // };
  // fr.readAsArrayBuffer(data.content);


  const response = await fetch("http://localhost:8080/upload-png", {
    body: new Blob([data.content]),
    method: "POST",
  });
  const json = await response.json();
  const {transactionId, status} = json

  console.log(transactionId, status)
  if (status === 202) {

    patch.book.coverImage = transactionId;
    console.log(patch.book);
    return true
  } else {
    return false
  }
}


const syncAll = async () => {
  let count = 0;
  let nbPatches = patches.value.length;
  if (nbPatches>0) {
    running.value = true
    for (let patch of patches.value) {
      await sync(patch)
      count++;
      syncProgress.value = 100*count/nbPatches;
    }
  }

  await clearInvalidCovers()

}
</script>

<template>
  <AppLayout title="Sync Book Covers">
    <v-container fill-height class="bg-blue" fluid>
      <v-row  justify="center">
        <v-col cols="12" md="6">
          <h3>{{patches.length}} covers to Upload to Arweave</h3>
          <h4>
          <v-btn v-if="!running" @click="syncAll()">Sync NOW</v-btn>
          </h4>
          <h4 v-if="running">
            Progress: {{syncProgress.toFixed(2)}}%
          </h4>
        </v-col>
      </v-row>
      <v-row  justify="center">
        <v-col cols="12" md="6">
          <v-list>
            <v-list-item v-for="patch in patches" rounded="shaped">
              <v-list-item-title>
                {{ patch.book.name }}
              </v-list-item-title>
              {{ patch.cover }}


<!--              <template v-slot:append>-->
<!--                <v-btn-->
<!--                    color="blue-darken-3"-->
<!--                    icon="mdi-sync"-->
<!--                    size="4rem"-->
<!--                    variant="text"-->
<!--                    @click="sync(patch)"-->
<!--                ></v-btn>-->
<!--              </template>-->

            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-container>
  </AppLayout>
</template>

<style scoped>

</style>