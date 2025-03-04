<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import Vision from "@//components/cms/Vision.vue";
import SlotImage from "@//components/vote/SlotImage.vue";
import {ImageVotePlaceHolders} from "@the_library/db";
</script>

<template>
  <Layout>

    <v-container>
      <v-row>
        <v-col cols="12" md="8">
          <Vision />
        </v-col>
        <v-col cols="12" md="4" class="align-content-center">
          <SlotImage  :slot-id="ImageVotePlaceHolders.Vision">
            <v-card-text>
              <v-img src="/img/plant.webp" rounded/>
            </v-card-text>
            <v-card-subtitle>
              Creator: StockCake.com
            </v-card-subtitle>
            <v-card-subtitle>
              AI Generated
            </v-card-subtitle>
            <v-card-subtitle>
              Released into the Public Domain
            </v-card-subtitle>
          </SlotImage>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>