import { createApp } from 'vue'

import App from './App.vue'
import { createVuetify} from "vuetify";

import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {router} from './router'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import colors from 'vuetify/util/colors'

import VuePiwikPro from '@piwikpro/vue-piwik-pro'

VuePiwikPro.initialize(

    "ba1c7486-3ba9-4c1b-a233-1e5be1278124",
    "https://datapond.piwik.pro",
)


const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    theme: {
        themes: {
            light: {
                dark: false,
                colors: {
                    primary: colors.blue.darken3,
                    secondary: colors.deepOrange.darken2,
                    accent: colors.lightBlue.accent1,
                    error: colors.red.accent3,
                    info: colors.deepOrange.darken1,
                    success: colors.green.accent3,
                    warning: colors.amber.darken3,

                }
            },
        },
    },
});

const app = createApp(App);
app.use(vuetify).use(router).mount('#app')
