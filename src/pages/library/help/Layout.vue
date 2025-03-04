<template>
  <v-app-bar   elevation="5" >
    <v-spacer />
    <v-btn to="/help" color="purple" size="large">
      <v-icon icon="mdi-help" color="purple" size="2rem"/>
    </v-btn>
    <v-btn to="/" color="red" size="large">
      <v-icon icon="mdi-earth" color="red" size="2rem"/>
    </v-btn>
    <v-btn to="/account" color="blue" size="large"   >
      <v-icon icon="mdi-waves" color="blue" size="2rem"/>
    </v-btn>
    <v-btn to="/deal" color="green"  size="large">
      <v-icon icon="mdi-sprout" color="green" size="2rem"/>
    </v-btn>

    <!--      <v-btn to="/library/help" color="secondary"  size="x-large">-->
    <!--        <v-icon icon="mdi-help" color="secondary" size="3rem"/>-->
    <!--      </v-btn>-->

  </v-app-bar>
  <v-main scrollable  class="bg-blue-grey-lighten-4">
    <slot></slot>
  </v-main>
</template>
<script setup lang="ts">
</script>