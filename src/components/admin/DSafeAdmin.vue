<script setup lang="ts">
const props = defineProps({
  orm: Object
})
</script>

<template>
  <v-card>

    <v-card-title class="text-primary">
      <strong><v-icon icon="mdi-shield-outline" size="1.5rem"></v-icon> Safe for children, adults and plants</strong>
    </v-card-title>
    <v-card-text>
      <p >
        No Spiritual content, No sexual content, No history, No illegal content, No Stolen
          Content, No Fictional content, No political content
      </p>
    </v-card-text>
    <v-card-actions>


        <v-switch
            class="ml-2"
            v-model="props.orm.safe"
            :color="props.orm.safe ? 'green' : 'red'"
            :label="props.orm.safe ? `Safe` : `UnSafe`"
            hide-details
        ></v-switch>


    </v-card-actions>


  </v-card>
</template>

<style scoped>

</style>