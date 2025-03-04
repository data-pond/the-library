<script setup lang="ts">

import {computed, ref, watch, watchEffect} from 'vue'
import { Tag } from '@the_library/db';
import {Dialog, registerDialog, registerOpened} from "@//ts/dialog.ts";



const {opened, props} = registerOpened(Dialog.TopicManagment)
console.log('opened', opened, props)

const selectedTopicsId = computed(() => props.value.selectedTopicsId)

</script>

<template>


  <v-dialog max-width="800" v-model="opened" width="auto" >
  <v-card
      class="mx-auto"
      max-width="500"
  >
    <v-sheet class="pa-4 bg-primary">
      <v-text-field
          v-model="search"
          clear-icon="mdi-close-circle-outline"
          label="Search Company Directory"
          variant="solo-inverted"
          clearable
          flat
          hide-details
      ></v-text-field>
      <v-checkbox
          v-model="caseSensitive"
          label="Case sensitive search"
          dark
          hide-details
      ></v-checkbox>
    </v-sheet>
    <v-card-text>
      <v-treeview
          v-model:opened="tree"
          :custom-filter="filterFn"
          :items="items"
          :search="search"
          item-value="id"
      >
        <template v-slot:prepend="{ item }">
          <v-icon
              v-if="item.children"
              :icon="`mdi-${item.id === 1 ? 'home-variant' : 'folder-network'}`"
          ></v-icon>
        </template>
      </v-treeview>
    </v-card-text>
  </v-card>
  </v-dialog>
</template>

<style scoped>

</style>