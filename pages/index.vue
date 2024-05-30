<script setup>
import {v4 as uuidv4} from 'uuid'
import { emitter } from '../eventBus';


 definePageMeta({
   
   path: '/:id?',
   keepalive: true
 })

const { $i18n } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const drawer = useDrawer()
const route = useRoute()
const conversation = ref(getDefaultConversationData())


const loadConversation = async () => {
  let savedConversation =[]
  if (typeof localStorage !== 'undefined'){
    savedConversation = localStorage.getItem('conversations')
  }
  if (savedConversation) {   
     conversation.value = JSON.parse(savedConversation)
  }
}

const loadMessage = async () => {
  let savedMessages=[]
  let savedMessage=[]
  if (typeof localStorage !== 'undefined'){
    savedMessages = localStorage.getItem('conversations')
  if (savedMessages) {   
    savedMessages = JSON.parse(savedMessages)
     savedMessage=savedMessages.find(conv=>conv.id===route.params.id)
     console.log("rpid",route.params.id,savedMessage)
  }
  if (savedMessage) {
    conversation.value.messages = savedMessage.messages  
    conversation.value.id=savedMessage.id
    conversation.value.topic=savedMessage.topic
    console.log("conversation.value",conversation.value)
  }
}
}


let createNewConversation = () => {
  navigateTo('/')
  if (route.path !== '/') {
    return navigateTo('/')
  }
    const conversationId=uuidv4()
  conversation.value = Object.assign(getDefaultConversationData(), {
        id:conversationId   
  })
  localStorage.setItem('conversationId',conversationId);
  localStorage.setItem('activeChatId',conversationId);
}


onMounted(async () => {
  
  localStorage.setItem('activeChatId',uuidv4());
  
  if (route.params.id) {
    conversation.value.loadingMessages = true
    await loadConversation()
    await loadMessage()
    conversation.value.loadingMessages = false
  }
  emitter.on('navhome', (newValue) => { 
    createNewConversation();
    
 }); 
})


const navTitle = computed(() => {
  if (conversation.value && conversation.value.topic !== null) {
    return conversation.value.topic === '' ? $i18n.t('defaultConversationTitle') : conversation.value.topic
  }
  return runtimeConfig.public.appName
})

onActivated(async () => {
  if (route.path === '/' && route.query.new !== undefined) {
    createNewConversation()
  }
})


</script>

<template>
   <v-app-bar>
    <div style="background-color:black;width: inherit;height:65Px ; display: flex; align-items: left; justify-content: left; padding: 10px; " >
      <img src="/Fortive.png" width="130" />
    </div>    
   </v-app-bar>
  <v-app-bar >
    
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title>{{ navTitle }}</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn
        :title="$t('newConversation')"
        icon="add"
        @click="createNewConversation"
        class="d-md-none ma-3"
    ></v-btn>
    <v-btn
        variant="outlined"
        class="text-none d-none d-md-block"
        @click="createNewConversation"
    >
      {{ $t('newConversation') }}
    </v-btn>

  </v-app-bar>

  <v-main>
    <Welcome v-if="!route.params.id && conversation.messages.length === 0" />
    <Conversation :conversation="conversation" />
  </v-main>
</template>
