const appName = process.env.NUXT_PUBLIC_APP_NAME ?? 'Fluke Tech Support'
export default defineNuxtConfig({
    ssr: true,
    debug: process.env.NODE_ENV !== 'production',
    app: {
        head: {
            title: appName,
            link: [{ rel: 'icon', type: 'image/svg+xml', href: '/Sensei_Noun1.svg' },]
        },
    },
    runtimeConfig: {
        public: {
            appName: appName,
            typewriter: true,
            typewriterDelay: 5,
            viteApiBase: '',
            defaultLocale: 'en',
            viteMimicEasyAuthHeader: '',
            viteFmsTrainingPrompt: '',
            viteFmsTrainingPromptFileName: '',
            promptFile: '',
            viteApiCompletionVersion: ''
        }
    },
    build: {
        transpile: ['vuetify']
    },
    css: [
        'vuetify/styles',
        'material-design-icons-iconfont/dist/material-design-icons.css',
        'highlight.js/styles/panda-syntax-dark.css',
    ],
    modules: [
        '@nuxtjs/color-mode',
        '@nuxtjs/i18n'
    ],
    i18n: {
        strategy: 'no_prefix',
        locales: [
            {
                code: 'en',
                iso: 'en-US',
                name: 'English',
                file: 'en-US.json',
            },
            {
                code: 'zh-CN',
                iso: 'zh-CN',
                name: '简体中文',
                file: 'zh-CN.json',
            },
            {
                code: 'ru',
                iso: 'ru-RU',
                name: 'Русский',
                file: 'ru-RU.json',
            },
            {
                code: 'fr',
                iso: 'fr-FR',
                name: 'Français',
                file: 'fr-FR.json',
            },
            {
                code: 'es',
                iso: 'es-ES',
                name: 'Español',
                file: 'es-ES.json',
            }
        ],
        lazy: true,
        langDir: 'lang',
        defaultLocale: 'en',
        vueI18n: {
            fallbackLocale: 'en',
        },
    }
})

// nuxt.config.ts  


