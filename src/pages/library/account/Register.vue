<script setup lang="ts">
import Layout from '../Layout.vue'
import {ref} from 'vue'

const username = ref(null)

const error = ref(null)
const checkUsername = () => {
  if (username.value.length <2>) {
    error.value = "username too short"
  } else if  (/^([a-z][A-Z])+$/.test(username.value) === false) {
    error.value = "Only letters allowed"
  } else {
    error.value = null
  }
}

const language = window.navigator.language
</script>

<template>
<Layout>
<v-container>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-card-item>
          <v-row>
            <v-col cols="12">
              <v-card elevation="3" color="success">
                <v-card-item>
                  <h1>CORE network active and ready</h1>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2" md="4" class="align-content-center justify-center text-center bg-primary">

              <h1>Register</h1>

              <br />
              <h3>with</h3>
              <br />
              <v-img src="/img/Logo_brand orange_for dark bg_transparent.svg" class="mx-6"/>
            </v-col>
            <v-col cols="10" md="8">

              <div>
                <strong class="text-primary">
                  Username:
                </strong>
                <div>
                  Only letters are allowed.
                </div>
                <v-text-field v-model="username" prepend-icon="mdi-earth"
                              rounded autofocus color="primary" class="text-primary-darken-2"
                              hint="Choose a username for sharing your Collection"
                              :error-messages="error"></v-text-field>

                <br />

                <v-row>
                  <v-col cols="12" md="6">
                    <strong class="text-primary">
                      Language:
                    </strong>
                    <div>
                      {{language}}
                    </div>

                  </v-col>
                  <v-col cols="12" md="6">
                    <strong class="text-primary">
                      Timezone:
                    </strong>
                    <div>
                      {{Intl.DateTimeFormat().resolvedOptions().timeZone}}
                    </div>
                  </v-col>
                </v-row>


                <br />

                <v-btn size="x-large"
                       @click="checkUsername()"
                       color="primary" append-icon="mdi-chevron-right">
                  CONNECT
                </v-btn>


                <br />

              </div>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</v-container>
</Layout>
</template>

<style scoped>

</style>