<script setup lang="ts">
import {computed, ref} from "vue";

import MySelf from "./TreeBookTopics.vue";
import {Tag} from "@the_library/db";

const props = defineProps({
  id: Number,
  selected: Boolean,
  subTopics: Array<any>,
  padding: Number,
  expanded: Boolean,
});

const emit = defineEmits({
  update: [String]
})




const tag = computed(() => Tag.Load(props.id))

// const id = computed(() => props.id)
const selected = computed(()=> props.selected)


const expanded = ref(props.expanded || false)
const subTopics = computed(() => props.subTopics ? props.subTopics : [])
const leaf = computed(() => typeof subTopics.value === 'undefined' || subTopics.value.length === 0)

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
    </v-row>
    <v-row v-if="leaf && id!=1"
           :class="`pa-0 ma-0 ${selected ? 'bg-blue-lighten-5' : ''}`" align="center">
      <v-col cols="10" class="pa-0 ma-0"  @click="toggleTopic">
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

        <v-checkbox-btn :model-value="selected"
                        block
                        width="100%"
                        @click="toggleTopic"
                         color="primary"  class="pa-1 float-end"></v-checkbox-btn>
<!--        <v-checkbox-btn v-if="isSelectable && !isDisabledIncluded" v-model="selected"-->
<!--                        block-->
<!--                        width="100%"-->
<!--                        @change="toggleTopic"-->
<!--                         color="primary"  class="pa-1 float-end"></v-checkbox-btn>-->
      </v-col>
    </v-row>
    <MySelf v-for="child in subTopics"
            :key="child.id"
            :id="child.id"
            v-if="expanded"
            @update="onChange"
            :padding="padding+1"
            :selected="child.selected"
            :expanded="child.expanded"
            :subTopics="child.subTopics"/>




</template>

<style scoped>

</style>