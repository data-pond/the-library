<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import {hasStartedBestBookCoverContest} from "@//ts/vote.ts";
import {getAllPatches, loadSyncedData} from "@the_library/db";
import {ref} from 'vue'
import {getAllPatchesSince, getNbPatches} from "@the_library/db";
import {Web3Provider} from "@ethersproject/providers";

const bookCoverLink = hasStartedBestBookCoverContest() ? `/vote/bestCovers` : '/help/voteBestCover'

const currentLevel = ref(null)
const progress = ref(0)
const computingLevel = ref(true)
const levelUp = ref(false)
const coreInstalled = ref(false)
const metaMaskInstalled = ref(false)
const resumeInstall = ref(false)

if (window.ethereum) {
  metaMaskInstalled.value = true
  const provider = new Web3Provider(window.ethereum); // Updated to Web3Provider
  provider.send("eth_requestAccounts", []).then(() => {
    coreInstalled.value = true;
  }).catch((e) => {
    console.error(e)
  })

}


getAllPatches().then(async (patches) => {

  const syncedData = await loadSyncedData();
  console.log(syncedData);
  console.log('syncedData', syncedData.syncCounter.activity.btc,
      syncedData.syncCounter.patch.btc);

  const pendingPatches = await getAllPatchesSince(syncedData.syncCounter.patch.btc);
  const nbPendingPatches = Object.values(patches).reduce((acc, value) => {
    return acc + Object.keys(value).length
  }, 0)


  levelUp.value = nbPendingPatches >= 10;

  currentLevel.value = Math.ceil(nbPendingPatches / 10);

  progress.value = 10 * (nbPendingPatches % 10)

  computingLevel.value = false
})
</script>

<template>

  <Layout>
    <v-container>
      <div>
        <v-row>
          <v-col cols="12" v-if="!metaMaskInstalled">
            <v-card elevation="3" class="fill-height"
                    rounded

                    to="/help/installCore_1"
                    color="primary" style="min-height:15rem">
              <v-card-item class="align-content-center fill-height">
                <v-row align-content="center">
                  <v-col cols="3" md="2">
                    <v-img src="/img/core_logo.svg" :ratio="1"></v-img>
                  </v-col>
                  <v-col cols="9" md="8">
                    <h1>Install CORE to enable community voting !</h1>

                    <p>
                      Unlock community features, track your progress, and vote on your favorite books.
                    </p>
                    <p>
                      Join thousands of users already enjoying enhanced features.
                    </p>

                    <br/>
                    <v-btn color="white" prepend-icon="mdi-download" append-icon="mdi-chevron-right">
                      Install Now
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-item>
            </v-card>
          </v-col>


          <v-col cols="12" md="6">
            <v-card elevation="3">
              <v-card-title>
                Level {{ currentLevel }}
              </v-card-title>
              <v-card-text style="max-height: 7rem;min-height: 7rem">
                <p>Progress until next level</p>
                <br/>
                <v-progress-linear
                    color="primary"
                    height="20"
                    :model-value="progress"
                    striped
                ></v-progress-linear>
                <br/>
                <p>
                  {{ progress.toFixed(0) }}% complete. Keep going!
                </p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" v-if="!levelUp">
            <v-card elevation="3" class="fill-height">
              <v-card-title>
                Level Up
              </v-card-title>
              <v-card-subtitle>
                Sync your data on CORE
              </v-card-subtitle>
              <v-card-text>
                When reaching next level , you'll be able to use CORE to vote.
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" v-else>
            <v-card elevation="3" color="yellow" class="fill-height">
              <v-card-title>
                Level Up
              </v-card-title>
              <v-card-subtitle>
                Sync your data on CORE
              </v-card-subtitle>
              <v-card-text>
                When reaching next level , you'll be able to use CORE to vote.
              </v-card-text>
              <v-card-actions>
                <v-btn size="large">
                  Vote Now !
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <v-row>

          <v-col cols="12" v-if="metaMaskInstalled && !coreInstalled">
            <v-card elevation="3" class="fill-height" color="black" style="min-height:15rem">
              <v-card-text style="min-height: 5rem">
                <h1>Enable CORE to enable community voting !</h1>
                <h3>Core supports Metamask, to connect CORE to your metamask wallet, click here.</h3>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card color="primary" class="fill-height" :to="bookCoverLink">
              <v-card-title>
                Book Cover Contest
              </v-card-title>

              <v-card-text>
                Vote for the best pages of the Library !
              </v-card-text>
              <v-card-actions class="bg-white">
                <v-btn color="primary"
                       variant="elevated" rounded
                       class="px-4"
                       border append-icon="mdi-chevron-right">
                  <strong>Vote Now</strong>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>

          <v-col cols="12">


            <v-card>
              <v-card-title>
                My Library
              </v-card-title>
              <v-card-item>
                <v-row>

                  <v-col cols="12" md="4">
                    <v-card to="/account/visitedBooks" class="pa-2 fill-height">
                      <v-card-title>
                        Visited Books
                      </v-card-title>
                      <v-card-text>
                        Click to see all the book you have already visited.
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="black"
                               variant="tonal" rounded
                               class="px-4"
                               border append-icon="mdi-chevron-right">
                          <strong>GO</strong>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-card to="/account/downloadedBooks" class="pa-2 fill-height">
                      <v-card-title>
                        Downloaded Books
                      </v-card-title>
                      <v-card-text>
                        Click to see all the book you have downloaded.
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="black"
                               variant="tonal" rounded
                               class="px-4"
                               border append-icon="mdi-chevron-right">
                          <strong>GO</strong>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-card to="/account/favoriteTopics" class="pa-2 fill-height">
                      <v-card-title>
                        Favorite Topics
                      </v-card-title>
                      <v-card-text>
                        A list of your Favorite topics - and their voting score.
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="black"
                               variant="tonal" rounded
                               class="px-4"
                               border append-icon="mdi-chevron-right">
                          <strong>GO</strong>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </Layout>
</template>

<style scoped>

</style>