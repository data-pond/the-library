<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
</script>

<template>
  <Layout>

    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" md="7">
          <v-card elevation="3" class="mb-5">
            <v-card-title class="text-center">
              Contributor Mode Unlocked
            </v-card-title>
          </v-card>

          <v-row align="center" justify="center">

            <v-col cols="2"  class="text-center">
              <v-icon icon="mdi-numeric-1" color="primary"  size="4rem" />
            </v-col>

            <v-col cols="10">

              <v-card>
                <v-card-title :class="['text-h6', `bg-primary`]">
                  Personalize your copy
                </v-card-title>
                <v-card-text class="bg-white mt-2">

                  <p>
                    This easy to use admin interface allows you to edit every record in the library, and reorganize topics
                  </p>
                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn>Beta</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-row align="center" justify="center">

            <v-col cols="2" >
              <v-icon icon="mdi-numeric-2" size="4rem" color="primary" />
            </v-col>

            <v-col cols="10">

              <v-card>
                <v-card-title :class="['text-h6', `bg-primary`]">
                  Activate AO
                </v-card-title>
                <v-card-text class="bg-white  mt-2">
                  <p>
                    The decentralized super computer saves your changes to the blockchain.
                  </p>

                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn>coming soon</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-row align="center" justify="center">

            <v-col cols="2">
              <v-icon icon="mdi-numeric-3" size="4rem" color="primary" />
            </v-col>

            <v-col cols="10">

              <v-card>
                <v-card-title :class="['text-h6', `bg-primary`]">
                  Unlock next level
                </v-card-title>
                <v-card-text class="bg-white mt-2">
                  <p>
                    Now that your change have become a community vote, you gain access to the community hub.
                  </p>
                </v-card-text>
                <v-card-actions class="justify-end">
                  <v-btn>Coming Soon</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <v-row align="center" justify="center">

            <v-col cols="12" md="7" class="text-center">
              <v-btn size="x-large" color="primary" to="/admin">
                Start Now
              </v-btn>
            </v-col>
          </v-row>





<!--          <v-card elevation="3" class="ma-3">-->



<!--            <v-card-text>-->

<!--              <h1>Contributor Mode</h1>-->

<!--              <p>This easy to use admin interface allows you to edit every record in the library</p>-->




<!--              <p>You can build a personalized copy of the library and share it with your friends and family</p>-->


<!--            </v-card-text>-->

<!--            <v-card-actions>-->
<!--              <v-btn to="/admin" >Access Contributor Mode</v-btn>-->
<!--            </v-card-actions>-->
<!--          </v-card>-->
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>