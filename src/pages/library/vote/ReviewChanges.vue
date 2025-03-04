<script setup lang="ts">
import Layout from "@//pages/library/Layout.vue";
import {ref} from 'vue';
import {dump, Vote} from "@the_library/db";

const activeTab = ref(1)
const db = dump();
const votes: Array<Vote> = db.get(Vote.type) ? Array.from(db.get('Vote').values()) : [];

</script>

<template>
<Layout>
  <v-container>
    <v-row align="center" justify="center">
      <v-col cols="12" md="7">
        <v-card>
          <v-card-title>Review changes</v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-stepper :items="['Votes', 'Topics', 'DSafe', 'Visibility', 'Text Edits']"
                 v-model="activeTab"
                 editable alt-labels
                 elevation="3" min-width="100%">
        <template v-slot:item.1>
          <v-card title="Votes" elevation="3">
            <v-card-subtitle>
              Best Cover contest
            </v-card-subtitle>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4" v-for="vote in votes" :key="vote.id">

                  {{vote.action}}<br />
                  confirmed: {{vote.confirmed}}<br />
                  {{vote.targetId}} -{{vote.targetType}}<br />
                  {{vote.link1}} -<br />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </template>
        <template v-slot:item.2>
          <v-card title="Topics" flat>...</v-card>
        </template>
        <template v-slot:item.3>
          <v-card title="DSafe" flat>...</v-card>
        </template>
        <template v-slot:item.4>
          <v-card title="Visibility" flat>...</v-card>
        </template>
        <template v-slot:item.5>
          <v-card title="Text Edits" flat>...</v-card>
        </template>

        <template v-slot:actions>
          <v-card>
            <v-card-actions class="justify-space-between ma-6">
              <v-btn color="primary" variant="outlined" size="x-large" :disabled="activeTab === 1" @click="activeTab--">
                Previous
              </v-btn>
              <v-btn color="primary" variant="outlined" size="x-large" :disabled="activeTab === 5" @click="activeTab++">
                Next
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>


      </v-stepper>

    </v-row>

  </v-container>
</Layout>
</template>

<style scoped>

</style>