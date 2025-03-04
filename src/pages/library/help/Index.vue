<script setup lang="ts">
import Layout from "@//pages/library/help/Layout.vue";
</script>

<template>
  <Layout>
    <v-container>
      <v-row>
        <v-col class="12" md="5">
          <v-card elevation="3" >
            <v-card-title>
              How to Vote for the best book cover
            </v-card-title>
            <v-card-subtitle>
              The winners are displayed on the /vision page.
            </v-card-subtitle>
            <v-card-actions class="justify-end">
              <v-btn to="/help/voteBestCover">Vote for the best Cover</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>