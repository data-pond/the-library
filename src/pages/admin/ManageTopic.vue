<script setup lang="ts">

import {DownloadTagBookCovers, dump, Tag} from "@the_library/db";
import {computed, reactive, ref, watchEffect} from "vue";
import Layout from "@//layout/TagAdmin.vue";
import TreeSubTopics from "@//components/TreeSubTopics.vue";
import BookPreview from "@//components/BookPreview.vue";
import {useRoute, useRouter} from "vue-router";
import DSafeAdmin from "@//components/admin/DSafeAdmin.vue";
import VisibilityAdmin from "@//components/admin/VisibilityAdmin.vue";
import Page from "@//components/page.vue";

const props = defineProps({
  topicId: Number
})
const route = useRoute();

const tag = computed(() => Tag.Load(props.topicId))
const unlinkDialog = ref(false)
const selectedTag = ref(null)

const selection = ref(tag.value.tags.map(t => t.id))
const isInSelection = (id: number): boolean => {
  return selection.value.includes(id)
}
const tab = ref(route.query.tab ? parseInt(route.query.tab as string, 10) : 0)
const LayoutType = computed(() => tag.value.booksIds.length > 0 ? 'books' : 'topics')
/**
 *
 * @param _tag
 * @param ids
 */
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
const recompute = ref(0)


const buildDeletedState = () => Array.from(dump().get(Tag.type).values()).reduce((acc, value) => {
  acc[value.id] = value.deleted
  return acc
}, {})

const deleted = ref(buildDeletedState())


const edgeCase = (t: Tag): boolean => {
  return deleted.value[t.id] && t.inTagsIds.length == 1 && t.inTagsIds[0] == tag.value.id
}
const items = computed(() => {
  const ids = tag.value.tagsIds
  const mapper = (_tag: Tag) => {

    const selectable = () => {
      if (_tag.id == tag.value.id) {
        return false
      }
      return !contains(_tag, [tag.value.id])
    }

    return _tag.tagsIds.length == 0 ? {
      id: _tag.id,
      name: _tag.name,
      isSelectable: selectable(),
      selected: isInSelection(_tag.id)
    } : {
      id: _tag.id,
      name: _tag.name,
      expanded: contains(_tag, ids),
      selected: isInSelection(_tag.id) ,
      subTopics: _tag.tags.map(mapper),
      isSelectable: selectable(),
    }
  }

  return {
    id: 1,
    name: `Root`,
    selected: true,
    expanded: true,
    isSelectable: false,
    subTopics: Tag.Load(1).tags.map(mapper)
  }
})

console.log('ITEMS', items.value)

watchEffect(() => {
  DownloadTagBookCovers(tag.value)
  console.log('route.query.tab', route.query.tab)
  tab.value = parseInt(route.query.tab as string, 10)
  setTimeout(() => {
    tab.value = parseInt(route.query.tab as string, 10)
  }, 100)

})

const selectedTags = ref({
  added: [],
  removed: []
})

const resetSubTopics = () => {

  const customEvent = new CustomEvent('ResetTreeValues', {})
  window.dispatchEvent(customEvent)
  selectedTags.value = {
    added: [],
    removed: []
  }
  recompute.value++
}

const removeAllSubTopicsFromSelection = (tags: Array<Tag>) => {
  for (let t of tags) {
    tag.value.removeTag(t.id, true)
    removeAllSubTopicsFromSelection(t.tags)
  }
}
const applySubTopicChanges = () => {
  selectedTags.value.added.forEach((t: Tag) => {
    if (edgeCase(t)) {
      t.deleted = false
    }
    // keep the deleted flag ON if already set
    removeAllSubTopicsFromSelection(t.tags)
    t.addIntoTag(tag.value.id, true)
  })
  selectedTags.value.removed.forEach((t: Tag) => {
    if (t.inTagsIds.length == 1) {
      t.deleted = true
    } else {
      t.removeFromTag(tag.value.id, true)
    }
  })
  selectedTags.value = {
    added: [],
    removed: []
  }
  deleted.value = buildDeletedState()
  selection.value = tag.value.tags.map(t => t.id)
  recompute.value++
}


// mutate selectedTags
const toggleCheck = (id) => {
  const selectedTag = Tag.Load(id)
  if (selection.value.includes(id)) {
    console.log('already selected -< toggle OFF', selectedTag.name)
    selection.value = selection.value.filter(t => t !== id)
  } else {
    console.log('not in selection -> toggle ON', selectedTag.name)
    selection.value = selection.value.concat([id])
  }

  const selected = selection.value.includes(id)
  const originallySelected = tag.value.tagsIds.includes(id)
  const isEdgeCase = edgeCase(selectedTag)


  console.log(`selected ${selectedTag.name}: ${selected}`)

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
const intersect = <A>(a: Array<A>, b: Array<A>): Array<A> => {
  var setB = new Set(b);
  return [...new Set(a)].filter(x => setB.has(x));
}
const treeIsParentSelected = (topic: Tag, original = false): boolean => {

  for (let parent of topic.inTags) {
    if (original) {
      if (tag.value.inTagsIds.includes(parent.id)) {
        if (topic.id===38) {
          console.log(`treeIsParentSelected ${topic.name} -  original`)
        }
        return true
      }
    } else {
      if (selection.value.includes(parent.id)) {
        if (topic.id===38) {
          console.log(`treeIsParentSelected ${topic.name} - not original`)
        }
        return true
      }
    }
    if (treeIsParentSelected(parent, original)) {
      return true
    }
  }
  if (topic.id===38) {
    console.log(`NOT treeIsParentSelected ${topic.name}`, topic)
    console.log(`selection`, selection.value)
    console.log(`tag.value.tagsIds`, tag.value.tagsIds)
  }
  return false
}

const treeIsSelected = (topic: Tag, original = false): boolean => {
  if (original) {
    tag.value.inTagsIds.includes(topic.id)
  }
  return selection.value.includes(topic.id)
}
const treeIsChildSelected = (topic: Tag, original = false, deep = true): boolean => {
  for (let child of topic.tags) {
    if (treeIsSelected(child, original)) {
      return true
    }
    if (deep && treeIsChildSelected(child, original, deep)) {
      return true
    }
  }
  return false
}

const unlink = (tag) => {
  selectedTag.value = tag
  unlinkDialog.value = true
}

const hideTopic = () => {
  selectedTag.value.deleted = true
  unlinkDialog.value = false
}
const moveTopic = () => {
  // todo
  unlinkDialog.value = false
}
const router = useRouter();

const topicLink = (topic) => {
  if (topic.booksIds.length > 0) {
    return `/admin/tagAdmin/${topic.id}?tab=2`
  } else if (topic.tagsIds.length > 0) {
    return `/admin/tagAdmin/${topic.id}?tab=1`
  } else {
    return null
  }
}
const openTopic = (topic) => {
  const link = topicLink(topic)
  if (link) {
    router.push(link)
  }
}

const zoomvalues = [
  {
    xs: 6,
    md: 4,
    lg: 3,
    xl: 2
  },
  {
    xs: 12,
    md: 6,
    lg: 4,
    xl: 3
  },
]
const zoom = ref(zoomvalues[0])

const toggleZoom = () => {
  if (zoom.value.md === zoomvalues[0].md) {
    zoom.value = zoomvalues[1]
  } else {
    zoom.value = zoomvalues[0]
  }
}

const updateTab = () => {
  console.log('updateTab', tab.value)
  router.push(`/admin/tagAdmin/${tag.value.id}?tab=${tab.value}`)
}
</script>

<template>
  <Layout >

    <v-container>
<v-row>
  <v-col cols="12">
    <h3>{{tag.name}}</h3>
  </v-col>

</v-row>
    <v-tabs
        v-model="tab"
        color="primary"
        class="mb-4"
        align-tabs="align-tabs"
        @click="updateTab"
    >
      <v-tab text="Settings" :value="0"></v-tab>
      <v-tab text="Topics" :value="1" v-if="LayoutType == 'topics'"></v-tab>
      <v-tab text="Pro" :value="3" v-if="LayoutType == 'topics'"></v-tab>
      <v-tab text="Books" :value="2" v-if="LayoutType == 'books'"></v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <!-- NAMING + DSAFE + Visibility-->
      <v-tabs-window-item :value="0">
        <v-container>
          <v-row>
            <v-col cols="12" md="7" class="px-0">
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
                                 v-model="tag.name" id="InputTitle"></v-text-field>
                </v-card-text>
                <v-card-text>
                  <label for="InputDescription" >
                    <strong>Description</strong>
                  </label>
                  <v-textarea density="compact"
                              class="mt-3" v-model="tag.description"
                              id="InputDescription"></v-textarea>
                </v-card-text>

              </v-card>
            </v-col>
            <v-col cols="12" md="5">
              <v-card elevation="3">
                <v-card-title class="text-primary">
                  <strong><v-icon icon="mdi-book-open-variant-outline" size="1.5rem"/> Topics</strong>
                </v-card-title>
                <v-card-text>
                  <p>This is a sub-topic - which belongs to the following main topics</p>
                  <v-list>
                    <v-list-item
                        ripple
                        v-for="topic in tag.inTags"  class="ma-3"
                                 :to="`/admin/tagAdmin/${topic.id}?tab=1`">
                      <v-list-item-title>
                        {{ topic.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        Click to open
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
              <v-card class="mt-6" elevation="3">
                <v-card-title class="text-primary ">
                  <strong><v-icon icon="mdi-link-variant" size="1.5rem"/> Link more top topics</strong>
                </v-card-title>

                <v-card-text>
                  <p>You can add more parent topic to "<strong>{{ tag.name }}</strong>". Open the parent topic, and on
                    the "Topic" tab, select {{ tag.name }} to include it as a subtopic.</p>

                </v-card-text>

              </v-card>
            </v-col>
            <v-col cols="12" md="7" class="px-0">
              <DSafeAdmin :orm="tag" elevation="3" class="px-0"/>
            </v-col>
            <v-col cols="12" md="5" >
              <VisibilityAdmin :orm="tag" elevation="3" />
            </v-col>
          </v-row>
        </v-container>
      </v-tabs-window-item>

      <!-- SUB TOPICS FOR TOP TOPIC -->
      <v-tabs-window-item :value="1" v-if="LayoutType == 'topics'">
        <v-container>
          <v-row>
            <v-col cols="12" v-if="tag.tags.length>0" class="pa-0 ma-0 mb-2">
              <v-card elevation="3">

                <v-card-text>
                  <h4 class="text-primary">Sub-categories of </h4>
                  <h2>{{ tag.name }}</h2>
                  <hr class="my-2"/>
                  <p>
                    These are the categories that "<strong class="text-black">{{ tag.name }}</strong>" is parent
                    of.
                    <!--                  Choose carefully which topics you want to link to "<strong class="text-black">{{ tag.name }}</strong>"-->
                  </p>
                  <p>
                    Click on them to preview and edit them.
                  </p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row>

            <v-col cols="12" md="6" lg="4"
                   v-for="subTopic in tag.tags"
                   v-if="tag.tags.length>0" class="pa-1 ma-0 mb-2">
              <v-card elevation="3" :to="topicLink(subTopic)" rounded hover>

                <v-card-title>
                  <small>{{ subTopic.name }}</small>
                </v-card-title>
                <v-card-actions class="justify-start">
                  <v-btn v-if="subTopic.tags.length>0" color="primary"
                         variant="outlined"
                         elevation="3" border
                         bg-color="white"
                         prepend-icon="mdi-folder-arrow-right">
                    {{ subTopic.tags.length }} sub topics
                  </v-btn>

                  <v-btn v-else-if="subTopic.books.length>0" color="secondary"
                         variant="outlined" elevation="3" border
                         bg-color="white"
                         prepend-icon="mdi-file-document-multiple-outline">
                    {{ subTopic.books.length }} Books
                  </v-btn>

                  <v-btn disabled color="primary" v-else class="float-right" variant="elevated">
                    Coming Soon
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tabs-window-item>

      <!-- TOPIC ADMIN FOR TOP TOPICS -->
      <v-tabs-window-item :value="3" v-if="LayoutType == 'topics'">
        <v-container>
          <v-dialog max-width="500" v-model="unlinkDialog">

            <v-card title="Confirm ">
              <v-card-text v-if="selectedTag.inTagsIds.length===1">

                <v-alert
                    icon="mdi-family-tree"
                    title="This Topic has only one Ancestor"

                    type="warning"
                    variant="tonal"
                >
                  Unlinking "<strong>{{ selectedTag.name }}</strong>" from its only top topic will make it lost.
                </v-alert>

                <p>You can Choose to <strong>hide</strong> it instead, or you can <strong>move</strong> it to another
                  topic.</p>

                <hr class="my-4"/>

                <v-btn size="large"
                       color="red"
                       variant="outlined"
                       @click="hideTopic()"
                       class="align-content-center float-left"
                >
              <span>
                <v-icon icon="mdi-folder-remove" size="2.5rem" color="red"></v-icon>
                <strong>Hide topic</strong>
              </span>
                </v-btn>

                <v-btn color='primary' size="large"
                       class="align-content-center float-right"
                       @click="moveTopic()"
                       variant="outlined">

              <span>
                <v-icon icon="mdi-folder-heart-outline" size="2.5rem" color="pink"/>
                <strong>
                  Move topic
                </strong>

              </span>

                </v-btn>


              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn

                    size="large"
                    variant="outlined"
                    @click="unlinkDialog = false"
                >
              <span>

                <strong>Cancel</strong>
              </span>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-row align="center" justify="center">
            <v-col cols="12" md="8" v-if="tag.tags.length>0" class="pa-0 ma-2">
              <v-card elevation="3">
                <v-card-title>
                  Sub Category Admin
                </v-card-title>
                <v-card-subtitle>
                  Add & Remove this topic's sub categories.
                </v-card-subtitle>
                <v-card-text>
                  <h4>Added topics</h4>
                  <div v-for="_tag in selectedTags.added">
                    <v-icon color="primary" icon="mdi-plus"/>
                    {{ _tag.name }}
                  </div>
                  <p v-if="selectedTags.added.length===0">
                    -> You have not added any topics to this category.
                  </p>
                  <h4>Unlinked topics</h4>
                  <div v-for="_tag in selectedTags.removed">
                    <v-icon color="red" icon="mdi-minus"/>
                    {{ _tag.name }}
                  </div>
                  <p v-if="selectedTags.removed.length===0">
                    -> You have not removed any topics from this category.
                  </p>
                </v-card-text>
                <v-card-actions class="justify-space-between"
                                v-if="selectedTags.added.length>0 || selectedTags.removed.length>0">
                  <v-btn color="red-darken-3" @click="resetSubTopics" variant="outlined">
                    Cancel Changes
                  </v-btn>
                  <v-btn color="primary" variant="outlined" @click="applySubTopicChanges">
                    Confirm
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" md="8" v-if="tag.tags.length>0" class="pa-0 ma-0">
              <v-card density="compact" elevation="3" variant="outlined">
                <v-card-text class="pa-0 ma-0">
                  <!--                <v-list border density="compact">-->
                  <TreeSubTopics :subTopics="items.subTopics"
                        @update="toggleCheck"
                        :tree-is-child-selected="treeIsChildSelected"
                        :tree-is-parent-selected="treeIsParentSelected"
                        :tree-is-selected="treeIsSelected"
                        :selected="false"
                        :expanded="true"
                        :id="items.id"
                        :padding="0"/>
                  <!--                </v-list>-->
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-tabs-window-item>
      <!-- BOOK LIST FOR SUB TOPICS -->
      <v-tabs-window-item :value="2" v-if="LayoutType == 'books'">

        <v-container fluid>
          <v-row align="center" justify="center">
            <v-col cols="12" md="9" v-if="tag.books.length>0">

              <v-card>
                <v-card-title>
                  Layout settings
                </v-card-title>
                <v-card-text>
                  <p class="text-primary">
                    Toggle the zoom level for your best preference.
                  </p>
                  <p class="text-primary">
                    Click on one book to access the Book Admin UI.
                  </p>
                </v-card-text>
                <v-card-actions>

                  <v-btn color="primary" variant="tonal" @click="toggleZoom()">
                    Toggle Zoom
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" md="6" v-if="tag.books.length===0">
              <v-banner>
                <v-banner-text>
                  There are no books available in "{{ tag.name }}" category.
                </v-banner-text>

              </v-banner>
            </v-col>
            <v-col :cols="zoom.xs" :md="zoom.md" :xl="zoom.xl" v-for="book in tag.books">
              <BookPreview :bookId="book.id"/>
            </v-col>

          </v-row>
        </v-container>
      </v-tabs-window-item>
    </v-tabs-window>

    </v-container>
  </Layout>
</template>

<style scoped>

</style>