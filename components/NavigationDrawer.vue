<script setup>
import { useDisplay } from 'vuetify'
import {useDrawer} from "../composables/states";
import {v4 as uuidv4} from 'uuid'
import { emitter } from '../eventBus';

//const conversation_id=localStorage.getItem('conversationId')
const route = useRoute()
const { $i18n, $settings } = useNuxtApp()
const colorMode = useColorMode()
const {mdAndUp} = useDisplay()
const drawerPermanent = computed(() => {
  return mdAndUp.value
})
const user = useUser()

const themes = ref([
  { title: $i18n.t('lightMode'), value: 'light' },
  { title: $i18n.t('darkMode'), value: 'dark' },
  { title: $i18n.t('followSystem'), value: 'system'}
])
const setTheme = (theme) => {
  colorMode.preference = theme
  const selectedTheme=localStorage.setItem('selectedTheme', ref(colorMode.preference));
}

// const feedback = () => {
//   window.open('https://github.com/WongSaang/chatgpt-ui/issues', '_blank')
// }

const { locale, locales, setLocale } = useI18n()
const setLang = (lang) => {
  setLocale(lang)
}

const conversations = useConversations()
const editingConversation = ref(false)
const deletingConversationIndex = ref(false)

const editConversation = (index) => {
  editingConversation.value = conversations.value[index]
}

const updateConversation = async (index) => {
  editingConversation.value.updating = true
  const localHistory = JSON.parse(localStorage.getItem('conversations'))
  if(localHistory){
    console.log("in update",editingConversation.value.topic,localHistory[index].topic)
    localHistory[index].topic=editingConversation.value.topic
    localStorage.setItem('conversations', JSON.stringify(localHistory));
    editingConversation.value.updating = false
    conversations.value[index] = editingConversation.value
  }
  conversations.value[index].updating = false
  editingConversation.value = false
}

const deleteConversation = async (index) => {  
  const deletedChatId=removeConversation(index)    
  loadConversations()
  if(localStorage.getItem('activeChatId')===deletedChatId){
    emitter.emit('navhome',deletedChatId);
  }
  }

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text) => {
  snackbarText.value = text
  snackbar.value = true
}

const handleChatClick=(conversationId)=>{
  localStorage.setItem('activeChatId',conversationId)
  localStorage.setItem('conversationId',conversationId)
}

const loadMessage = async (conversation_id) => {
  if(conversation_id){
    const savedMessages = JSON.parse(localStorage.getItem('conversations'))
    const savedMessage=savedMessages.find(conv=>conv.id===conversation_id)
    console.log("savedmessagenv",savedMessage,conversation_id)
    return savedMessage.messages
  }else{
    return null
  }
}

const exportConversation = async (index) => {
  let conversation = conversations.value[index]  
  let data = {}
  data.conversation_topic = conversation.topic
  data.messages = []
  let messages = await loadMessage(conversation.id)
  //let messages=conversation.messages
  for (let message of messages) {
    let msg = {}
    msg.role = message.is_bot ? "assistant" : "user" 
    msg.content = message.message
    data.messages.push(msg)
  }
  let file_content = JSON.stringify(data)
  let file_name = `${conversation.topic}_${new Date()}`.replace(/[\/\\:*?"<>]/g, "_")
  const element = document.createElement('a');
  try {
  const data = JSON.parse(file_content);
  const formattedMessages = data.messages.map(message => `${message.role} : "${message.content}"`);
  const formattedOutput = formattedMessages.join('\n\n');
  file_content = formattedOutput
} catch (error) {
  console.error('Error parsing JSON:', error);
}
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(file_content),
  );
  element.setAttribute("download", file_name);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

const openImportFileChooser = async () => {
  let input_element = document.getElementById("import_conversation_input")
  input_element.click()
}

const importConversation = async () => {
  let input_element = document.getElementById("import_conversation_input")
  let fileHandles = input_element.files
  let imports = []
  const reader = new FileReader()
  for (let handle of fileHandles) {
    let content = await new Promise((resolve, reject) => {
      reader.readAsText(handle)
      reader.onload = () => resolve(reader.result);
      reader.onerror = eror => reject(error);
    })
    let json = JSON.parse(content)
    imports.push(json)
  }
  let new_conversation_ids = []
  try {
    const { data, error } = await useAuthFetch('/api/upload_conversations/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imports: imports,
      }),
    })
    if (!error.value) {
      new_conversation_ids = data.value
      loadConversations()
    } else {
      console.log(err)
      showSnackbar(err.message)
    }
  } catch (err) {
    console.log(err.message)
    showSnackbar(err.message)
  }
}

const clearConversations = async () => {
  deletingConversations.value=true
  removeAllConversations();
  const conversationIdNew=uuidv4()
  localStorage.setItem('conversationId',conversationIdNew);
  loadConversations();
  conversations.value = []  
  //await navigateTo("/"+conversationIdNew)
  window.location.href="/"
  clearConfirmDialog.value=false
  deletingConversations.value=false
}

const clearConfirmDialog = ref(false)
const deletingConversations = ref(false)
const loadingConversations = ref(false)

const loadConversations = async () => {
  loadingConversations.value = true
  conversations.value = await getConversations()
  loadingConversations.value = false
  await navigateTo("/")
}

const signOut = async () => {
  const { data, error } = await useFetch('/api/account/logout/', {
    method: 'POST'
  })
  if (!error.value) {
    await logout()
  }
}

onNuxtReady(async () => {
  loadConversations()
})

const drawer = useDrawer()

</script>

<template>
  <v-navigation-drawer
      v-model="drawer"
      :permanent="drawerPermanent"
      width="275"
      
  >
    <template
        v-slot:prepend
        
    >      
      <v-list>                           
          <v-list-item>            
                                   
          <template v-slot:append>
            <v-menu>
              <!--<template v-slot:activator="{ props }">
                <v-btn
                    v-bind="props"
                    size="small"
                    variant="text"
                    icon="expand_more"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item
                    :title="$t('resetPassword')"
                    to="/account/resetPassword"
                >
                </v-list-item>
                <v-list-item
                    :title="$t('signOut')"
                    @click="signOut"
                >
                </v-list-item>
              </v-list>-->
            </v-menu>

          </template>
           
        </v-list-item>
      </v-list>

      <v-divider></v-divider>
    </template>

    <div class="px-2">
      <v-list>
        <v-list-item v-show="loadingConversations">
          <v-list-item-title class="d-flex justify-center">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <v-list>
        <template
            v-for="(conversation, cIdx) in conversations"
            :key="conversation.id"
        >
          <v-list-item
              active-color="primay"
              rounded="xl"
              v-if="editingConversation && editingConversation.id === conversation.id"
          >
            <v-text-field
                v-model="editingConversation.topic"
                :loading="editingConversation.updating"
                variant="underlined"
                append-icon="done"
                hide-details
                density="compact"
                autofocus
                @keyup.enter="updateConversation(cIdx)"
                @click:append="updateConversation(cIdx)"
            ></v-text-field>
          </v-list-item>
          <v-hover
              v-if="!editingConversation || editingConversation.id !== conversation.id"
              v-slot="{ isHovering, props }"
          >
            <v-list-item
                rounded="xl"
                active-color="#64be49"
                :to="conversation.id ? `/${conversation.id}` : '/'"
                @click="handleChatClick(conversation.id)"
                v-bind="props"
            >
              <v-list-item-title>{{ (conversation.topic && conversation.topic !== '') ? conversation.topic : $t('defaultConversationTitle') }}</v-list-item-title>
              <template v-slot:append>
                <div
                    v-show="isHovering && conversation.id"
                >
                  <v-btn
                      icon="edit"
                      size="small"
                      variant="text"
                      @click.prevent="editConversation(cIdx)"
                  >
                  </v-btn>
                  <v-btn
                      icon="delete"
                      size="small"
                      variant="text"
                      :loading="deletingConversationIndex === cIdx"
                      @click.prevent="deleteConversation(cIdx)"
                  >
                  </v-btn>
                  <v-btn
                      prepend-icon="download"
                      size="small"
                      variant="text"
                      @click.prevent="exportConversation(cIdx)"
                  >
                  </v-btn>                  
                </div>
              </template>
            </v-list-item>
          </v-hover>
        </template>
      </v-list>
    </div>

    <template v-slot:append>
      <v-divider></v-divider>
      <v-expansion-panels style="flex-direction: column;">
        <v-expansion-panel rounded="rounded-pill">
          <v-expansion-panel-title expand-icon="add" collapse-icon="close">
            <v-icon icon="settings" class="mr-4"></v-icon> {{ $t("settingDraw") }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="px-1">
              <v-list density="compact">
      
                <v-dialog
                    v-model="clearConfirmDialog"
                    persistent
                >
                  <template v-slot:activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        rounded="xl"
                        prepend-icon="delete_forever"
                        :title="$t('clearConversations')"
                    ></v-list-item>
                  </template>
                  <v-card>
                    <v-card-title class="text-h5">
                      Are you sure you want to delete all conversations?
                    </v-card-title>
                    <v-card-text>This will be a permanent deletion and cannot be retrieved once deleted. Please proceed with caution.</v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                          color="green-darken-1"
                          variant="text"
                          @click="clearConfirmDialog = false"
                          class="text-none"
                      >
                        Cancel deletion
                      </v-btn>
                      <v-btn
                          color="green-darken-1"
                          variant="text"
                          @click="clearConversations"
                          class="text-none"
                          :loading="deletingConversations"
                      >
                        Confirm deletion
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

               <!-- <v-list-item
                  rounded="xl"
                  prepend-icon="input"
                  :title="$t('importConversation')"
                  @click="openImportFileChooser()"
                ></v-list-item>-->
                <ApiKeyDialog
                    v-if="$settings.open_api_key_setting === 'True'"
                />
      
      
                <v-menu
                >
                  <template v-slot:activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        rounded="xl"
                        :title="$t('themeMode')"
                    >
                      <template
                          v-slot:prepend
                      >
                        <v-icon
                            v-show="$colorMode.value === 'light'"
                            icon="light_mode"
                        ></v-icon>
                        <v-icon
                            v-show="$colorMode.value !== 'light'"
                            icon="dark_mode"
                        ></v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <v-list
                      bg-color="white"
                  >
                    <v-list-item
                        v-for="(theme, idx) in themes"
                        :key="idx"
                        @click="setTheme(theme.value)"
                    >
                      <v-list-item-title>{{ theme.title }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
      
                <!--<SettingsLanguages/>
      
                <v-list-item
                    rounded="xl"
                    prepend-icon="help_outline"
                    :title="$t('feedback')"
                    @click="feedback"
                ></v-list-item> -->

              </v-list>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </v-navigation-drawer>
  <v-snackbar v-model="snackbar" multi-line location="top">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn color="red" variant="text" @click="snackbar = false" density="compact" size="default">
        Close
      </v-btn>
    </template>
  </v-snackbar>
  <input
    type="file" id="import_conversation_input" style="display:none"
    accept="text/plain, text/json"
    multiple
    @change="importConversation"
  >
</template>

<style>
.v-navigation-drawer__content::-webkit-scrollbar {
  width: 0;
}
.v-navigation-drawer__content:hover::-webkit-scrollbar {
  width: 2px;
}
.v-navigation-drawer__content:hover::-webkit-scrollbar-thumb {
  background-color: #999;
  border-radius: 2px;
}

  :root {  
    --primary-color: #ff0000;  
    --secondary-color: #00ff00;  
    --dark-mode-background-color: #111111;  
    --dark-mode-text-color: #ffffff;  
  }  
  
  @media (prefers-color-scheme: dark) {  
    .v-toolbar__content{
  background-color:#555555 !important
  }

  }  
</style>
