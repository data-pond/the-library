<script setup lang="ts">
import {computed, ref} from "vue";

import MySelf from "./TreeSubTopics.vue";
import {Tag} from "@the_library/db";

const props = defineProps({
  id: Number,
  selected: Boolean,
  subTopics: Array<any>,
  isMain: Boolean,
  isSelectable: Boolean,
  padding: Number,
  treeIsParentSelected: Function,
  treeIsSelected: Function,
  treeIsChildSelected: Function,

  expanded: Boolean,
});

const emit = defineEmits({
  update: [Number, Boolean]
})




const tag = computed(() => Tag.Load(props.id))
const originallySelected = computed(() => props.treeIsSelected(tag.value, true))
const onlyOneAncestor = computed(() => tag.value.inTagsIds.length === 1)

// const id = computed(() => props.id)
const isMain = computed(() => props.isMain)
const isSelectable = computed(() => props.isSelectable)
const selected = computed(()=> props.selected)


const expanded = ref(props.expanded || false)
const subTopics = computed(() => props.subTopics ? props.subTopics : [])
const leaf = computed(() => typeof subTopics.value === 'undefined' || subTopics.value.length === 0)

const status = computed(() => {
  if (props.treeIsParentSelected(tag.value, false)) {
    return {
      check: true,
      disabled: true
    }
  }
  return {
    disabled: false,
    check: selected.value
  }
})

const toggleTopic = () => {
  emit('update', props.id)
}

const padding = computed(() => props.padding)

const onChange = (e) => {
  emit('update', e)
}
</script>

<template>

    <v-row v-if="!leaf && id!=1"
           :class="`pa-0 ma-0  ${selected ? 'bg-blue-lighten-5' : expanded ? 'bg-grey-lighten-3' : ''}`" align="center">
      <v-col cols="10" class="pa-0 ma-0">
        <v-btn dense size="small" @click="expanded=!expanded"
               block
               density="compact"
               elevation="0"
               class="bg-transparent"

               stacked
               :class="`justify-start align-content-center`">
          <v-row dense align-content="center" class="pa-0">
            <v-col cols="12"  :class="`text-left pl-${padding*2} ma-0`" >


              <v-icon :icon="expanded ? 'mdi-menu-down' : 'mdi-menu-right'" size="large"></v-icon>
              <v-icon v-if="isMain" :icon="`mdi-home`" size="large"></v-icon>
              <span>
                {{ tag.name }} {{tag.id}}
              </span>
              <v-chip v-if="!tag.safe"  color="red" size="small" class="ml-2">
                unsafe
              </v-chip>
              <v-chip v-if="tag.deleted"  color="red"  size="small" class="ml-2">
                hidden
              </v-chip>

            </v-col>
          </v-row>
        </v-btn>
      </v-col>

      <v-col cols="2" class="pa-0 ma-0 align-content-center ">
        <v-checkbox-btn v-if="isSelectable" :model-value="status.check"
                        block
                        :disabled="status.disabled"
                        width="100%"
                        color="primary"  class="pa-1 float-end" @click="toggleTopic"></v-checkbox-btn>
<!--        <v-checkbox-btn v-if="isSelectable && !isDisabled && isDisabledIncluded" :model-value="true"-->
<!--                        block-->
<!--                        width="100%"-->
<!--                        disabled-->
<!--                         color="primary"  class="pa-1 float-end"></v-checkbox-btn>-->
<!--        <v-checkbox-btn v-if="isSelectable && !isDisabled && !isDisabledIncluded" v-model="selected"-->
<!--                        block-->
<!--                        width="100%"-->
<!--                        @change="toggleTopic"-->
<!--                        color="primary"  class="pa-1 float-end">-->
<!--        </v-checkbox-btn>-->
      </v-col>
    </v-row>
    <v-row v-if="leaf && id!=1"
           :class="`pa-0 ma-0 ${selected ? 'bg-blue-lighten-5' : ''}`" align="center">
      <v-col cols="10" class="pa-0 ma-0">
        <span :class="`pl-7 ml-${padding*3+1}`">
          {{tag.name}}
        </span>
        <v-chip v-if="!tag.safe"  color="red"  size="small" class="ml-2">
          UNSAFE
        </v-chip>
        <v-chip v-if="tag.deleted"  color="red"  size="small" class="ml-2">
          HIDDEN
        </v-chip>

      </v-col>
      <v-col cols="2" class="pa-0 ma-0 align-content-center">

        <v-checkbox-btn v-if="isSelectable" :model-value="status.check"
                        block
                        width="100%"
                        :disabled="status.disabled"
                        @click="toggleTopic"
                         color="primary"  class="pa-1 float-end"></v-checkbox-btn>
<!--        <v-checkbox-btn v-if="isSelectable && !isDisabledIncluded" v-model="selected"-->
<!--                        block-->
<!--                        width="100%"-->
<!--                        @change="toggleTopic"-->
<!--                         color="primary"  class="pa-1 float-end"></v-checkbox-btn>-->
      </v-col>
    </v-row>
    <MySelf v-for="child in subTopics" :key="child.id"
            :id="child.id"
            v-if="expanded"
            @update="onChange"
            :padding="padding+1"
            :selected="child.selected"
            :expanded="child.expanded"
            :is-selectable="child.isSelectable"
            :is-main="child.isMain"
            :tree-is-child-selected="treeIsChildSelected"
            :tree-is-parent-selected="treeIsParentSelected"
            :tree-is-selected="treeIsSelected"
            :subTopics="child.subTopics"/>




</template>

<style scoped>

</style>