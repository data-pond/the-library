<template>
  <v-app-bar elevation="5" rounded>


    <v-container>
      <v-row align-content="center" class="align-content-center">


        <div class="text-h5 hidden-sm-and-down align-content-center">
          <v-icon icon="mdi-bookshelf" size="2rem" color="black" class="pl-2"/>
          <strong class="ml-1">The Library</strong>
        </div>


        <v-spacer/>
        <!--      <v-btn to="/connection" color="purple" size="large">-->
        <!--        <v-icon icon="mdi-earth" color="purple" size="2rem"/>-->
        <!--      </v-btn>-->


        <v-btn @click="back"
               variant="outlined"
               class="mr-2 align-self-center"
               prepend-icon="mdi-arrow-left"
               v-if="!isHome" color="primary">
          Back
        </v-btn>


        <v-btn to="/" color="red" size="large" class="mr-1" rounded icon="mdi-earth" exact>
          <v-icon icon="mdi-earth" color="red" class="text-red" size="2rem"/>
        </v-btn>
        <v-btn to="/account" color="blue" size="large" class="mr-1" rounded icon="mdi-waves" exact>
          <v-icon icon="mdi-waves" color="blue" size="2rem"/>
        </v-btn>
        <v-btn to="/deal" color="green" size="large" rounded icon="mdi-sprout" exact>
          <v-icon icon="mdi-sprout" color="green" size="2rem"/>
        </v-btn>

        <!--      <v-btn to="/library/help" color="secondary"  size="x-large">-->
        <!--        <v-icon icon="mdi-help" color="secondary" size="3rem"/>-->
        <!--      </v-btn>-->
      </v-row>
    </v-container>
  </v-app-bar>
  <v-main scrollable class="bg-blue-grey-lighten-4">
    <slot></slot>
  </v-main>
</template>
<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {computed} from "vue";

const router = useRouter()
const route = useRoute()

const back = () => {
  router.back()
}
const isHome = computed(() => route.path === '/')
</script>