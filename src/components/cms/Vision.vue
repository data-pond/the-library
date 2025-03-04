<script setup lang="ts">

import ShareAndConnect from "@//components/help/ShareAndConnect.vue";
import Donate from "@//components/help/Donate.vue";
</script>

<template>
  <v-card elevation="3" class="my-3">
    <v-card-text>
      <h1 class="text-primary">Vision</h1>
      <h4>A Trust Design</h4>

    </v-card-text>
  </v-card>


  <v-card elevation="3" class="my-3" >
    <v-card-title>Beneficiaries</v-card-title>
    <v-card-text>
      <p>On Earth, we are more than just occupants; we are integral parts of its ecosystem.</p>
      <p>As a community, we are tasked with learning how to restore and rejuvenate our planet.</p>
      <p>We can enhance practices to foster thriving environments where humans and nature flourish together.</p>
    </v-card-text>
  </v-card>
  <v-card  elevation="3" class="my-3" >
    <v-card-title>
      Trustee
    </v-card-title>
    <v-card-text>
      <p>The D-Safe label certifies that the content is safe for children, adults, and plants</p>

      <p>Serving as a legal gateway, it is designed  to work alongside the Library, whose automated goal is to improve its content quality over time.</p>

    </v-card-text>
  </v-card>
  <v-card elevation="3" class="my-3">
    <v-card-title>Grantor</v-card-title>
      <v-card-text>
      <p>I am Dme, a sovereign individual who started the Library project.</p>
      <p>
        I don't have much better to do than the library, so I just do it.
      </p>
    </v-card-text>
  </v-card>
  <ShareAndConnect  class="my-3"/>
  <Donate  class="my-3"/>
</template>

<style scoped>

</style>