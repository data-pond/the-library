<script setup lang="ts">
import Layout from '../Layout.vue'
import {onMounted, ref} from 'vue'

import {useCoreConnect, useCoreContract} from "@//ts/core.ts";
import {useRouter} from "vue-router";

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const router = useRouter();
const username = ref(null)

const {register, hasAccount, usernameExists} = useCoreContract();

const {coreInstalled, checkMetamaskInstalled, checkNetworkOk}  = useCoreConnect()

const error = ref(null)
const checkUsername = () => {
  if (username.value) {
    if (username.value.length <2) {
      error.value = "username too short"
    } else if  (/^([a-z])*$/i.test(username.value) === false) {
      error.value = "Only letters allowed"
    } else {
      error.value = null
    }
  } else {
    error.value = "This field is required"
  }

}

const loading = ref(true);
const computing = ref(false)
onMounted(async () => {
  checkMetamaskInstalled()
  const ok = await checkNetworkOk()
  if (!ok) {
      router.push('/help/installCore_1')
  } else {
    hasAccount().then((has) => {
      if (has) {
        const isLevelUp = true;
        if (isLevelUp) {
          router.push('/wallet/core')
        } else {
          router.push('/account')
        }
      } else {
        loading.value = false
      }
    })
  }
})



const connect = async () => {
  computing.value = true
  checkUsername()
  if (error.value) {
    return
  }

  const ok = await usernameExists(username.value)
  console.log(ok)
  if (!ok) {
    await register(username.value);
    computing.value = false
    const isLevelUp = true;
    if (isLevelUp) {
      router.push('/wallet/core')
    } else {
      router.push('/account')
    }
  } else {
    error.value = "This username is already taken"
    computing.value = false
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

              <div v-if="!loading">
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
                      {{timezone}}
                    </div>
                  </v-col>
                </v-row>


                <br />

                <v-btn size="x-large"
                       @click="connect()"
                       :loading="computing"
                       color="primary" append-icon="mdi-chevron-right">
                  CONNECT
                </v-btn>


                <br />

              </div>
              <div v-else class="align-content-center justify-center">
                <h2>Connecting Account...</h2>
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