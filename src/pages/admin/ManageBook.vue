<script setup lang="ts">

import Layout from "@//layout/BookAdmin.vue";
import {
  Book,
  getMuStatus,
  Tag,
} from "@the_library/db";
import {computed, ref, watchEffect} from "vue";
import {onBeforeRouteLeave, onBeforeRouteUpdate, useRoute} from "vue-router";
import {useDownload} from "@//ts/download.ts";
import {useAccessBook} from "@//ts/book.ts";
import Page from "@//components/page.vue";
import {useGoTo} from "vuetify";
import VisibilityAdmin from "@//components/admin/VisibilityAdmin.vue";
import DSafeAdmin from "@//components/admin/DSafeAdmin.vue";
import TreeBookTopics from "@//components/TreeBookTopics.vue";
import VoteBookCover from "@//pages/library/vote/VoteBookCover.vue";

const props = defineProps({
  bookId: Number
})

const book = computed(() => Book.Load(props.bookId))

const selectedTags = ref({
  added: [],
  removed: []
})


const selection = ref(book.value.inTagsIds)

const isInSelection = (id: number): boolean => {
  return selection.value.includes(id)
}
const contains = (_tag: Tag, ids: Array<number>): boolean => {
  if (ids.includes(_tag.id) && !_tag.deleted) {
    console.log(_tag.id, `contains ${_tag.name} A`, ids)
    return true
  }
  for (let __tag of _tag.tags) {
    if (ids.includes(__tag.id)) {
      console.log(`contains ${_tag.name} B`)
      return true
    }
    if (contains(__tag, ids)) {
      console.log(`contains ${_tag.name} C`)
      return true
    }
  }
  return false
}
const edgeCase = (t: Tag): boolean => {
  return book.value.inTagsIds.length == 1 && book.value.inTagsIds[0] == t.id
}
const items = computed(() => {
  const ids = book.value.inTagsIds
  const mapper = (_tag: Tag) => {


    return _tag.tagsIds.length == 0 ? {
      id: _tag.id,
      expanded: contains(_tag, ids),
      selected: isInSelection(_tag.id) && !(edgeCase(_tag) && !book.value.deleted),
      subTopics: []
    } : {
      id: _tag.id,
      expanded: contains(_tag, ids),
      selected: isInSelection(_tag.id) && !(edgeCase(_tag) && !book.value.deleted),
      subTopics: _tag.tags.map(mapper) ,
    }
  }

  return {
    id: 1,
    selected: true,
    expanded: true,
    subTopics: Tag.Load(1).tags.map(mapper)
  }
})

console.log('Items', items.value)

// const selectedTopics = computed(() => selection.value.map(id => Tag.Load(id)))

const confirmChanges = ref(false)
const confirmRedirectDone = ref(null)

const handleSelect = (id) => {

  const selectedTag = Tag.Load(id)
  if (selection.value.includes(id)) {
    console.log('already selected -< toggle OFF', selectedTag.name)
    selection.value = selection.value.filter(t => t !== id)
  } else {
    console.log('not in selection -> toggle ON', selectedTag.name)
    selection.value = selection.value.concat([id])
  }
  const selected = selection.value.includes(id)
  const isEdgeCase = edgeCase(selectedTag)
  const originallySelected = book.value.inTagsIds.includes(id)

  console.log('handle Select', id, selected)

  const edgeAction = () => {
    if (selected) {
      // ORIGINAL SELECTED
      if (originallySelected) {
        selectedTags.value = {
          added: selectedTags.value.added.concat([selectedTag]),
          removed: selectedTags.value.removed
        };
      } else {
        selectedTags.value = {
          added: selectedTags.value.added,
          removed: selectedTags.value.removed.filter(t => t.id !== id)
        };
      }
    } else {
      if (originallySelected) {
        selectedTags.value = {
          added: selectedTags.value.added.filter(t => t.id !== id),
          removed: selectedTags.value.removed
        };
      } else {
        selectedTags.value = {
          added: selectedTags.value.added,
          removed: selectedTags.value.removed.concat([selectedTag])
        };
      }
    }
  }
  const action = () => {
    if (selected) {
      // ORIGINAL SELECTED
      if (originallySelected) {
        selectedTags.value = {
          added: selectedTags.value.added,
          removed: selectedTags.value.removed.filter(t => t.id !== id)
        };
      } else {
        selectedTags.value = {
          added: selectedTags.value.added.concat([selectedTag]),
          removed: selectedTags.value.removed
        };
      }
    } else {
      if (originallySelected) {
        selectedTags.value = {
          added: selectedTags.value.added,
          removed: selectedTags.value.removed.concat([selectedTag])
        };
      } else {
        selectedTags.value = {
          added: selectedTags.value.added.filter(t => t.id !== id),
          removed: selectedTags.value.removed
        };
      }
    }
  }

  if (isEdgeCase) {
    edgeAction()
  } else {
    action()
  }
}
const resetTopics = () => {
  selectedTags.value = {
    added: [],
    removed: []
  }
  selection.value = book.value.inTagsIds
  confirmRedirectDone.value(true)
  confirmChanges.value = false
}

const applyTopicChanges = () => {
  selectedTags.value.added.forEach((t: Tag) => {
    if (edgeCase(t)) {
      book.value.deleted = false
    }
    t.addBook(book.value.id, true)
  })
  selectedTags.value.removed.forEach((t: Tag) => {
    if (edgeCase(t)) {
      book.value.deleted = true
    } else {
      t.removeBook(book.value.id, true)
    }
  })
  selectedTags.value = {
    added: [],
    removed: []
  }
  selection.value = book.value.inTagsIds
  confirmRedirectDone.value(true)
  confirmChanges.value = false
}


//// END TOPICS

const tab = ref(0)

const route = useRoute()

const {downloading, download} = useDownload(book.value, route)


const bookData = computed(() => getMuStatus(book.value.pdf));

const selectedCover = ref(0)

const CoverApi = useAccessBook(book)

const fixCover = () => {
  CoverApi.markInvalid()
}
const ggo = useGoTo()



const readPage = (page: number) => {
  selectedCover.value = page
  document.getElementById('carousel')?.scrollIntoView(true)
}

watchEffect(() => {
  console.log('Selected cover', selectedCover.value)
  if (selectedCover.value ===75) {
    selectedCover.value=CoverApi.max-1
  }
  if (selectedCover.value >= CoverApi.max) {
    selectedCover.value=0
  }
  if (selectedCover.value<0){
    selectedCover.value=CoverApi.max-1
  }
})

onBeforeRouteLeave((to, from, next) =>{
  if (selectedTags.value.added.length>0 || selectedTags.value.removed.length>0) {
    console.log('onBeforeRouteLeave', to, from)
    confirmChanges.value = true
    confirmRedirectDone.value = next
  } else {
    next(true)
  }
})


</script>

<template>
  <Layout :title="book.name" v-model="tab">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h3>{{book.name}}</h3>
        </v-col>

      </v-row>
      <v-tabs
          v-model="tab"
          color="primary"
          density="compact"
      >

        <v-tab text="Settings" :value="0"></v-tab>
        <v-tab text="Preview" :value="1"></v-tab>
        <v-tab text="Topic" :value="2"></v-tab>
      </v-tabs>
    </v-container>
    <v-tabs-window v-model="tab">

      <!-- Settings -->
      <v-tabs-window-item :value="0">
        <v-container>
          <v-row align="center" justify="center">

            <v-col cols="12" >
              <v-card elevation="3" density="compact">
              <v-card-title class="text-primary" >
                <strong><v-icon icon="mdi-file-document-edit-outline" size="1.5rem"/>  Naming</strong>
              </v-card-title>
              <v-card-text>
                You can edit the name and description of the topic.

                <label for="InputTitle" >
                  <strong>Name</strong>
                </label>
                <v-text-field  tile single-line
                               class="mt-3"
                               density="compact"
                               v-model="book.name" id="InputTitle"></v-text-field>
              </v-card-text>
<!--              <v-card-text>-->
<!--                <label for="InputDescription" >-->
<!--                  <strong>Description</strong>-->
<!--                </label>-->
<!--                <v-textarea density="compact"-->
<!--                            class="mt-3" v-model="book.description"-->
<!--                            id="InputDescription"></v-textarea>-->
<!--              </v-card-text>-->

              </v-card>


            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4" bordered class="border-2">
              <VisibilityAdmin :orm="book" />
            </v-col>
            <v-col cols="12" md="8" bordered class="border-2">
              <DSafeAdmin :orm="book" />
            </v-col>
          </v-row>
        </v-container>
      </v-tabs-window-item>

      <!--    BOOK COVER-->
      <v-tabs-window-item :value="1">
        <v-container fluid>
<!--          <v-row>-->
<!--            <v-col cols="12" md="7">-->

<!--              <v-card elevation="3" class="my-2">-->
<!--                <v-card-title>-->
<!--                  Adjust the Book Cover-->
<!--                </v-card-title>-->

<!--                <v-card-text>-->
<!--                  <p class="text-info">-->
<!--                    Some book could have a better cover image.-->
<!--                  </p>-->

<!--                  <p class="text-info">-->
<!--                    This interface allows you to select an alternative book page from the first 9 pages of the book.-->
<!--                  </p>-->
<!--                  <pre>-->
<!--                    {{CoverApi}}-->
<!--                  </pre>-->
<!--                </v-card-text>-->

<!--                <v-card-actions>-->
<!--                  <v-btn color="primary" :variant="'outlined'" @click="fixCover()">-->
<!--                    Fix Cover-->
<!--                  </v-btn>-->
<!--                </v-card-actions>-->
<!--              </v-card>-->
<!--            </v-col>-->

<!--          </v-row>-->
          <v-row>
            <v-col cols="12" md="6">
              <v-card elevation="3" class="my-2">
                <v-card-title>
                  Previewing the Book
                </v-card-title>

                <v-card-text v-if="book.nbPages>=CoverApi.max">
                  Previewing the first 14 pages.This book has {{book.nbPages}} pages.
                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn>Click on any page to open it</v-btn>
                </v-card-actions>
              </v-card>

            </v-col>
            <v-col cols="12" md="6">
              <v-card elevation="3" class="my-2">
                <v-card-title>
                  Get the book
                </v-card-title>
                <v-card-text>
                  Use your device PDF reader to open the book
                </v-card-text>
                <v-card-actions class="justify-space-between">

                  <span v-if="downloading" class="text-red-darken-3 pl-2">
                    Downloading PDF...
                  </span>
                  <span v-else class="text-primary pl-2">
                    PDF Ready
                  </span>
                  <v-btn color="red-darken-3" variant="elevated"
                         @click="download()"
                         :disabled="downloading"
                         prepend-icon="mdi-file-pdf-box">
                    <v-progress-circular indeterminate v-if="downloading"></v-progress-circular>
                    <span v-else>
              CLICK HERE TO GET PDF
            </span>

                  </v-btn>


                </v-card-actions>

              </v-card>

            </v-col>

            <v-col cols="3" md="2" lg="1" v-for="count in CoverApi.max">
              <v-card @click="readPage(count-1)">
                <v-card-text>
                  <KeepAlive max="100">
                    <Page  :file-id="book.pdf" :page="count-1" :ratio="0.7"/>
                  </KeepAlive>
                </v-card-text>
              </v-card>

            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col cols="12" md="6" >
              <VoteBookCover :book-id="book.id" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-card id="carousel">
                <v-carousel v-model="selectedCover"
                            v-if="bookData.value && bookData.value.dimensions.length>0"
                            height="100vh"
                            hide-delimiter-background
                            hide-delimiters
                            show-arrows-on-hover class="pa-4">
                  <v-carousel-item
                      v-for="(_, i) in bookData.value.dimensions"
                      :key="i"
                      :value="i"
                  >
                    <v-sheet
                        height="100%"
                        tile
                    >
                      <div class="d-flex fill-height justify-center align-center">
                        <KeepAlive max="100">
                          <Page :file-id="book.pdf" :page="i" :ratio="0.8" />
                        </KeepAlive>

                      </div>
                    </v-sheet>
                  </v-carousel-item>
                </v-carousel>

              </v-card>

            </v-col>
          </v-row>

        </v-container>


      </v-tabs-window-item>

      <!-- Topics -->
      <v-tabs-window-item :value="2">
        <v-container fluid>
          <v-row align="center" justify="center">


              <v-col cols="12" md="7" >
                <v-card elevation="3" v-if="confirmChanges" >
                  <v-card-title>
                   Book Topics Edition
                  </v-card-title>
                  <v-card-subtitle>
                    Modify this book's categories.
                  </v-card-subtitle>
                  <v-card-text>
                    <h4>Added topics</h4>
                    <div v-for="_tag in selectedTags.added">
                      <v-icon color="primary" icon="mdi-plus"/>
                      {{ _tag.name }}
                    </div>
                    <p v-if="selectedTags.added.length===0">
                      -> You have not added any topics to this book.
                    </p>
                    <h4>Unlinked topics</h4>
                    <div v-for="_tag in selectedTags.removed">
                      <v-icon color="red" icon="mdi-minus"/>
                      {{ _tag.name }}
                    </div>
                    <p v-if="selectedTags.removed.length===0">
                      -> You have not removed any topics from this book.
                    </p>
                  </v-card-text>
                  <v-card-actions class="justify-space-between"
                                  v-if="selectedTags.added.length>0 || selectedTags.removed.length>0">
                    <v-btn color="red-darken-3" @click="resetTopics" variant="outlined">
                      Cancel Changes
                    </v-btn>
                    <v-btn color="primary" variant="outlined" @click="applyTopicChanges">
                      Confirm
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            <v-col cols="12" md="7">
              <v-card v-if="!confirmChanges" elevation="3">
                <v-card-text>

                  <TreeBookTopics
                        @update="handleSelect"
                        :id="items.id"
                        :selected="true"
                        :subTopics="items.subTopics"
                        :padding="0"
                        :expanded="true"
                  />

                </v-card-text>
              </v-card>
            </v-col>

          </v-row>
        </v-container>
      </v-tabs-window-item>



    </v-tabs-window>


  </Layout>
</template>

<style scoped>

</style>