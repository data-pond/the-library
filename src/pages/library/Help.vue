<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
</script>

<template>

  <Layout>
    <v-container>
      <v-row>
        <v-col cols="12" md="7">
          <v-card elevation="3"  to="/help/voteBestCover" >
            <v-card-title>
              How to Vote for the best book cover
            </v-card-title>
            <v-card-subtitle>
              The winners are displayed on the /vision page.
            </v-card-subtitle>
            <v-card-actions class="justify-end">
              <v-btn color="primary" size="large" variant="outlined">Vote for the best Cover</v-btn>
            </v-card-actions>
          </v-card>




        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>