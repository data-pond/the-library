<script setup lang="ts">
import Layout from "@//pages/library/help/Layout.vue";

</script>

<template>
  <Layout>
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-row>
            <v-col cols="12">


              <v-card>
                <v-card-title>
                  How to vote for the best cover
                </v-card-title>
                <v-card-subtitle>
                  A detailed guide.
                </v-card-subtitle>
                <v-card-text>
                  <p>
                    Some of the Library public page contains illustrations that are the result of AI generated content.
                  </p>
                  <p>
                    You can choose and cast a vote in the community to choose any book page to figure in the rank of the
                    best
                    covers.
                  </p>
                </v-card-text>
                <v-card-actions>

                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" >
              <v-card>
                <v-card-title>
                  3 Easy Steps
                </v-card-title>
                <v-card-subtitle>

                </v-card-subtitle>
                <v-card-text>
                  <h3>1 - Choose a Topic</h3>

                  <p>Click on the following button to access all the topics</p>
                </v-card-text>
                <v-card-actions class="justify-center">
                  <v-btn to="/" color="primary"  size="large" variant="outlined">
                    <v-icon icon="mdi-earth" color="red" size="2rem"/>
                    Main Alley
                  </v-btn>
                </v-card-actions>

                <v-card-text>
                  <h3>2 - Download a Book</h3>
                  <p>Choose a book from the list to start downloading a book.</p>
                </v-card-text>

                <v-card-text>
                  <h3>3 - Click on the Vote Button</h3>
                  <p>From the book screen preview, and follow the instructions from there!</p>
                </v-card-text>
              </v-card>

            </v-col>


          </v-row>
        </v-col>
        <v-col cols="12" md="6">
          <v-row>
            <v-col cols="12">
              <v-card elevation="3" >
                <v-card-title>
                  List of pages
                </v-card-title>
                <v-card-subtitle>
                The following Images can be replaced by any book page.
                </v-card-subtitle>
                <v-card-text>

                </v-card-text>
              </v-card>


            </v-col>
            <v-col cols="6" >
              <v-card elevation="3" to="/vision">
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


              <v-card-actions class="justify-end">
<v-btn color="primary" size="large" to="/vision">Vision</v-btn>
              </v-card-actions>
              </v-card>

            </v-col>

            <v-col cols="6">
              <v-card elevation="3" to="/d-licence">
                <v-card-text>
                  <v-img src="/img/verticalPlant.webp"/>
                </v-card-text>

                <v-card-subtitle>
                  Creator: rawpixel.com
                </v-card-subtitle>
                <v-card-subtitle>
                  Released into the Public Domain
                </v-card-subtitle>

                <v-card-actions class="justify-end">
                  <v-btn color="primary" size="large" to="/d-licence">The D.</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>