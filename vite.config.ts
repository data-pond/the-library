import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from "vite-plugin-vuetify";
import {resolve} from "path";

// https://vite.dev/config/
export default defineConfig({

    resolve: {
        alias: [
            {find: '@', replacement: resolve(__dirname, 'src')},
        ],
    },
    plugins: [
        vue(),
        vuetify({
            autoImport: {
                labs: true,


            },
            styles: {
                configFile: 'src/scss/variables.scss'
            }
            //
            // styles: {
            //   configFile: "src/settings.scss"
            // }
        })
    ],
})
