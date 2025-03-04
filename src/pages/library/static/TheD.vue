<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import TheD from "@//components/cms/TheD.vue";
import SlotImage from "@//components/vote/SlotImage.vue";
import {ImageVotePlaceHolders} from "@the_library/db";
</script>

<template>
  <Layout>

    <v-container>
      <v-row>
        <v-col cols="12" md="7">
          <TheD />
        </v-col>
        <v-col cols="12" md="5" class="align-content-center">
          <SlotImage :slot-id="ImageVotePlaceHolders.TheD">
            <v-img src="/img/verticalPlant.webp"/>
            <v-card-subtitle>
              Creator: rawpixel.com
            </v-card-subtitle>
          </SlotImage>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>