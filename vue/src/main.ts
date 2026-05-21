import './assets/main.css'
import './assets/global.css'
import 'highlight.js/styles/github-dark.css'
import App from "@/App.vue";
import router from "@/router";
import { createApp } from "vue";
import { createPinia } from "pinia";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
