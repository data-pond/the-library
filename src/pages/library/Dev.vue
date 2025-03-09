<script setup lang="ts">

import Layout from "@//pages/library/Layout.vue";
import {onMounted} from "vue";
import AoConnect from "@//components/AoConnect.vue";


// onMounted(() => {
//   // @ts-ignore
//   Telegram.Passport.createAuthButton('telegram_passport_auth', {
//     bot_id:       '8090216055', // place id of your bot here
//     scope:        {data: ['email'], v: 1},
//     public_key:   '-----BEGIN PUBLIC KEY-----\n' +
//         'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA64D5dffSpvrYkU7k9dl8\n' +
//         'tOpSuIHhl6eSA9BiAacDfHwRxFBMS9feOQQSK7XAY1QAmji1YvGFEws4w+Ssws4f\n' +
//         'C1S0jEkp2CsAE/+fjbDaBvUMK1RYttk8R+otq3BV2A741wtz8BZx1YKCsLrQfXpF\n' +
//         'A496MdEHUqvNn1w+pX40UnY0V/aMZHalZnTaErDim+PtTnVAwMszaS9aPnNLHj11\n' +
//         'djPY8ROwZG8AxwLbHwN6C3AhtVFmPGPjt6TXT6+nIf7No9Uglp1i893NbugYRErv\n' +
//         'hCg4ODDQn9qey5a8uPpHKJTbHe8s/FR707oLlbt1mhjvuReMRbwa1lxtRdLpkrn1\n' +
//         'twIDAQAB\n' +
//         '-----END PUBLIC KEY-----\n', // place public key of your bot here
//     nonce:        'ab2df83746a87d2f3bd6', // place nonce here
//     callback_url: 'https://dev.datapond.earth/#/telegram-cb' // place callback url here
//   });
// })

</script>

<template>

  <Layout>
    <v-container fluid>
      <v-row>
        <v-col cols="12" md="4" lg="3">
          <v-card elevation="3" class="ma-3" rounded color="primary">
            <v-card-title>
              Share & Vote for your Library
            </v-card-title>

            <hr class="my-3"/>
            <v-card-subtitle>
              PermaWeb Backup
            </v-card-subtitle>
            <v-card-text>
              Create a public online copy of your Library
            </v-card-text>
            <hr class="my-3"/>
            <v-card-subtitle>
              Multi generation address
            </v-card-subtitle>
            <v-card-text>
              Create a Permanent Share Link
            </v-card-text>
            <hr class="my-3"/>
            <v-card-subtitle>
              One time payment of $10
            </v-card-subtitle>
            <v-card-text>
              Make up to 10 Crypto Saves
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4" lg="3">
          <v-card elevation="3" class="ma-3" to="/admin">
          <v-card-title>
            Manage your Library
          </v-card-title>
            <v-card-text>
              Click to access the Library Admin Dashboard to manage your Library content.
            </v-card-text>
            <v-card-actions>
              <v-btn to="/admin" color="primary" size="large">
                Library Admin Dashboard
              </v-btn>
            </v-card-actions>
          </v-card>

        </v-col>
        <v-col cols="12" md="4" lg="3">
          <AoConnect />
        </v-col>
        <v-col cols="12" md="4" lg="3">
          <v-card elevation="3" class="ma-3" >
            <v-card-title>
              Account with BTCore
            </v-card-title>
            <v-card-text>
              <h4>Coming Soon </h4>
            </v-card-text>

            <v-card-text>

              <div id="telegram_passport_auth" ></div>
            </v-card-text>
          </v-card>

        </v-col>
      </v-row>

    </v-container>
  </Layout>
</template>

<style scoped>

</style>