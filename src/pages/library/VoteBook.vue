<script setup lang="ts">
import {computed, reactive, ref} from "vue";
import {Book} from "@the_library/db";

const props = defineProps({
  bookId: Number
})

const bookId = computed(() => props.bookId)
const book = computed(() => Book.Load(bookId.value))

const form = reactive({
  valid: false,
  safe: null,
  quality: null,
  theD: null,
  readOk: false,
  meMachine: false
})
</script>

<template>
  <v-form v-model="form.valid" class="bg-white">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <h4>About You -- {{form.valid}}</h4>
          <v-checkbox label="I have read the book" v-model="form.readOk" name="readok" density="compact"></v-checkbox>
          <v-checkbox label="I am a machine" name="memachine" v-model=form.meMachine density="compact"></v-checkbox>
        </v-col>
        <v-col cols="12" md="6">
          <h4>About The D</h4>
          <v-radio-group v-model="form.theD" aria-required="true">
            <v-radio value="ok" label="This book is D. operational"></v-radio>
            <v-radio value="bad" label="This book is NOT D. operational"></v-radio>
            <v-radio value="unsure" label="I am not sure"></v-radio>
            <v-radio value="unsure" label="I don't know"></v-radio>

          </v-radio-group>

        </v-col>
        <v-col cols="12" md="6">
          <h4>About quality</h4>
          <v-rating
              required
              hover
              :length="7"
              :size="55"
              v-model="form.quality"
              active-color="primary"
          />
          <p>
            rate this book from 1 star = Useless, to 7 star = Excellent
          </p>
        </v-col>
        <v-col cols="12" md="6">
          <h4>About Safety</h4>
          <v-radio-group v-model="form.safe" aria-required="true">
            <v-radio value="unsafe">
              <template v-slot:label>
                <div>This is <strong class="text-red">NOT Safe</strong> for children adults and plants</div>
              </template>
            </v-radio>
            <v-radio value="safe">
              <template v-slot:label>
                <div>This is <strong class="text-green"> SAFE</strong> for children, adults and plants</div>
              </template>
            </v-radio>
            <v-radio value="notsure">
              <template v-slot:label>
                <div><strong>I Don't know</strong></div>
              </template>
            </v-radio>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-container>


  </v-form>

</template>

<style scoped>

</style>