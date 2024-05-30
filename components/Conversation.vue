<script setup>
import {EventStreamContentType, fetchEventSource} from '@microsoft/fetch-event-source'
import { getUserInfo } from "/utils/UserProfile.js";

  
const { $i18n, $settings } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()
const currentModel = useCurrentModel()
const openaiApiKey = useApiKey()
const fetchingResponse = ref(false)
const messageQueue = []
const frugalMode = ref(true)
let isProcessingQueue = false

const userPrincipal = await getUserInfo(runtimeConfig.public);
const apiBase = runtimeConfig.public.viteApiBase || "https://api.openai.com";
const completionEndPointVersion = runtimeConfig.public.viteApiCompletionVersion
const injectFMSTrainingPrompt = parseInt(runtimeConfig.public.viteFmsTrainingPrompt) || 0;

let fmsTrainingPromptFileName = "";


if (injectFMSTrainingPrompt) {
  fmsTrainingPromptFileName = runtimeConfig.public.viteFmsTrainingPromptFileName;
}
console.log(fmsTrainingPromptFileName)
async function fetchTextFileContent(filePath) {
    try {
      const response = await fetch(filePath);
      const content = await response.text();
      return content;
    } catch (error) {
      console.error("Error fetching text file:", error);
      return "";
    }
  }




const props = defineProps({
  conversation: {
    type: Object,
    required: true
  }
})

const processMessageQueue = () => {
  if (isProcessingQueue || messageQueue.length === 0 ) {
    return
  }
   if (!props.conversation.messages[props.conversation.messages.length - 1].is_bot) {
     props.conversation.messages.push({id: null, is_bot: true, message: ''})
    }
    
  isProcessingQueue = true
  const nextMessage = messageQueue.shift()  

  if (runtimeConfig.public.typewriter) {
    let wordIndex = 0;
    
    const intervalId = setInterval(() => {
    
    const lastMessage=props.conversation.messages[props.conversation.messages.length - 1]
    if (lastMessage && nextMessage){                        
        lastMessage.message += nextMessage[wordIndex] 
        wordIndex++;
        if (wordIndex === nextMessage.length) {
         clearInterval(intervalId)         
         isProcessingQueue = false
         processMessageQueue()
         }         
    }else {      
      clearInterval(intervalId);      
    }
    }, runtimeConfig.public.typewriterDelay)
  } else {
    props.conversation.messages[props.conversation.messages.length - 1].message += nextMessage    
    isProcessingQueue = false
    processMessageQueue()
  }  
}

let ctrl
const abortFetch = () => {
  if (ctrl) {
    ctrl.abort()
  }
  fetchingResponse.value = false
}
const fetchReply = async (message) => {
  ctrl = new AbortController()

  let msg = message
  if (Array.isArray(message)) {
    msg = message[message.length - 1]
  } else {
    message = [message]
  }

  let webSearchParams = {}
  if (enableWebSearch.value || msg.tool == 'web_search') {
    webSearchParams['web_search'] = {
      ua: navigator.userAgent,
      default_prompt: $i18n.t('webSearchDefaultPrompt')
    }
  }

  if (msg.tool == 'web_search') {
    msg.tool_args = webSearchParams['web_search']
    msg.type = 100
  } else if (msg.tool == 'arxiv') {
    msg.tool_args = null
    msg.type = 110
  }

  const input={'role':'system',
    'content':'You are a chatbot named Fluke Tech Support GPT, for a company called Fluke. You are helpful, honest and polite.'};
  
  
const addHistoryToRequest=()=>{
  const history=[]
  let savedMessage=[]
  let savedMessages=[]
  let conversation_id = ''
  if (typeof localStorage !== 'undefined'){
    conversation_id=localStorage.getItem('conversationId');
    savedMessages = localStorage.getItem('conversations')  
  if (savedMessages) {   
    savedMessages = JSON.parse(savedMessages)
    savedMessage=savedMessages.find(conv=>conv.id===conversation_id)
    console.log("SavedMessage",savedMessage)
  }
  if (savedMessage == null){
     conversation_id=localStorage.getItem('activeChatId')
     savedMessage=savedMessages.find(conv=>conv.id===conversation_id)
     console.log("SavedMessage",savedMessage)     
  }  
    if((savedMessage) && savedMessage.length != 0){               
      for(let i=0;i<savedMessage.messages.length;i++){
        console.log("addhistory",savedMessage.messages[i])   
        if('message_type' in savedMessage.messages[i]){
          
          let record={"role":"user","content":savedMessage.messages[i].message}
          history.push(record)
        }else{
          let record={"role":"assistant","content":savedMessage.messages[i].message}
          history.push(record)
        }
        
      }
    }
    }
    return history;
}
  const history=addHistoryToRequest()
  message=history.concat(message)
  message.splice(0,0,input);    

  if (injectFMSTrainingPrompt) {
        const textFilePath = "/" + fmsTrainingPromptFileName;
        const textFileContent = await fetchTextFileContent(textFilePath);
        if (textFileContent) {
          const textFileMessage = {"role":"system","content": textFileContent};    
          message.splice(1,0,textFileMessage);    
        }
        console.log("fms",message,history)
      }
  

  let modelname={model:currentModel.value.name }
  let chatId =localStorage.getItem('conversationId')
  if (chatId == null){
    chatId = localStorage.getItem('activeChatId')
  }
  let siteInfo= {
        "domain": "fnet" // Add website domain to the payload
    }
  const data = Object.assign({}, modelname, {
    //openaiApiKey: $settings.open_api_key_setting === 'True' ? openaiApiKey.value : null,
    messages: message,
    chatId: chatId,
    stream:true,
    siteInfo:siteInfo
    
  })

  try {
    
    //const userPrincipal = await getUserInfo();
    let Ocp_Apim_Subscription_Key="52a1d076-bbbf-422a-9bf7-95d61247be4"
    await fetchEventSource(apiBase +`/${completionEndPointVersion}/chat/completions`, {
      signal: ctrl.signal,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userPrincipal.access_token}`,
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : Ocp_Apim_Subscription_Key
      },
      body: JSON.stringify(data),
      openWhenHidden: true,
      onopen(response) {    
        console.log("before open",response.headers.get('content-type') )    
        if (response.ok ) {          
          return;
        }
        throw new Error(`Failed to send message. HTTP ${response.status} - ${response.statusText}`);
      },
      onclose() {
        if (ctrl.signal.aborted === true) {
          return;
        }
        //throw new Error(`Failed to send message. Server closed the connection unexpectedly.`);
        return;
      },
      onerror(err) {
        throw err;
      },
      
      async onmessage(message) {
        
        const data = JSON.parse(message.data)
        // console.log(data);
        let event = data.choices[0].finish_reason                       
                
        if (event === 'error') {
          abortFetch()
          showSnackbar(data.error)
          return;
        }

        if (event === 'userMessageId') {         
          
          props.conversation.messages[props.conversation.messages.length - 1].id = data.id
          return;
        }

        if (event === 'stop') {
          abortFetch()
          if (data.hasOwnProperty('id'))          
            props.conversation.messages[props.conversation.messages.length - 1].id = data.id                                        
          props.conversation.id = localStorage.getItem('activeChatId')                                                                                  
          console.log("props.conversation",props.conversation.messages[props.conversation.messages.length - 1], ' ## ',  data) 
          const status=addToStorage()         
          if (status==="failed") {
            addMessageToConversation(props.conversation.id,props.conversation.messages) 
          }  

                 
          
         if(data.newDocId) {
              editor.value.refreshDocList()
            }            
          }            
        
        if (data.choices[0].delta.content) {
          messageQueue.push(data.choices[0].delta.content)         
        }        
        processMessageQueue()                     
        scrollChatWindow()          
      },      
    })    
  } catch (err) {
    console.log(err)
    abortFetch()
    showSnackbar(err.message)
  }
}

const grab = ref(null)
const scrollChatWindow = () => {
  if (grab.value === null) {
    return;
  }
  grab.value.scrollIntoView({behavior: 'smooth'})
}

const send = (message) => {
  fetchingResponse.value = true

  if (props.conversation.messages.length === 0 ) {
    console.log("pc",props.conversation)
    addConversation(props.conversation)
    genTitle(localStorage.getItem('activeChatId'))
  }
  if (Array.isArray(message)) {
    props.conversation.messages.push(...message.map(i => ({message: i.content, message_type: i.role==="system"?"system":i.role === "user" ? "user":"assistant"})))
  } else {
    props.conversation.messages.push({ message: message.content, message_type: message.message_type })
  }
  fetchReply(message);  
  scrollChatWindow()
}
const stop = () => {
  abortFetch()
}

const snackbar = ref(false)
const snackbarText = ref('')
const showSnackbar = (text) => {
  snackbarText.value = text
  snackbar.value = true
}

const editor = ref(null)
const usePrompt = (prompt) => {
  editor.value.usePrompt(prompt)
}

const deleteMessage = (index) => {
  props.conversation.messages.splice(index, 1)

}

const toggleMessage = (index) => {
  props.conversation.messages[index].is_disabled = !props.conversation.messages[index].is_disabled
}

const enableWebSearch = ref(false)


onNuxtReady(() => {
  currentModel.value = getCurrentModel()
})

// Message Ratings save in db

const thumbRating=(message_id,rating, feedback)=>{
  
 const request = {  
  chatId: message_id,  
  chatRating: rating,  
  feedback: feedback  
  }; 
  const response=saveRatings(request)
  if (rating == 5) {
  console.log('Thumbs-Up triggered.')
  } 
  else {
  console.log('Thumbs-Down triggered.');
  }
}

async function saveRatings(request) {     
  try {  
    const response = await (await fetch(`${apiBase}/v1/chat/ratings`, {  
      method: 'POST',  
      headers: {  
        Authorization: `Bearer ${userPrincipal.access_token}`,  
        'Content-Type': 'application/json'  
      },  
      credentials: 'same-origin',  
      body: JSON.stringify(request)  
    })).json()  
    if (response.error) {  
      // Show Snackbar with error message  
      store.dispatch('snackbar/showSnackbar', {  
        message: response.error,  
        color: 'error'  
      })  
    }  
    return response  
  } catch (error) {  
    // Show Snackbar with error message  
    store.dispatch('snackbar/showSnackbar', {  
      message: 'An error occurred while fetching data.',  
      color: 'error'  
    })  
  }  
} 

</script>
<script>
  export default {
    data: () => ({
      dialog: false,
    }),
  }
</script> 

<template>
  <div v-if="conversation">
    <div
        v-if="conversation.loadingMessages"
        class="text-center"
    >
      <v-progress-circular
          indeterminate
          color="primary"
      ></v-progress-circular>
    </div>
    <div v-else>
      <div
          v-if="conversation.messages"
          ref="chatWindow"
      >
        <v-container>
          <v-row>
            <v-col
                v-for="(message, index) in conversation.messages" :key="index"
                cols="12"
                
            >
            
              <div
                  v-if="message.message_type!=='system'"  
                  class="d-flex align-center"
                  :class="message.is_bot ? 'justify-start' : 'justify-end'"
              >
                <MessageActions
                    v-if="!message.is_bot"
                    :message="message"
                    :message-index="index"
                    :use-prompt="usePrompt"
                    :delete-message="deleteMessage"
                    :toggle-message="toggleMessage"
                />
                <MsgContent                                 
                  :message="message"
                  :index="index"
                  :use-prompt="usePrompt"
                  :delete-message="deleteMessage"
                />
                <MessageActions
                    v-if="message.is_bot"
                    :message="message"
                    :message-index="index"
                    :use-prompt="usePrompt"
                    :delete-message="deleteMessage"
                />   
                <v-icon  
                  v-if="message.is_bot"  
                  class="mr-2"
                  :class="{'text-green': message.thumbs_up, 'text--yellow': !message.thumbs_up && !message.thumbs_down}"
                   @click="thumbRating(message.id,1); message.thumbs_up = true; message.thumbs_down = false;"  
                  >  
                  thumb_up  
                </v-icon> 
                <v-dialog v-model="dialog" max-width="600">
                  <template v-slot:activator="{ props: activatorProps }">
                    <v-icon 
                    v-if="message.is_bot"  
                    class="mr-2"
                    :class="{'text-red': message.thumbs_down, 'text--yellow': !message.thumbs_up && !message.thumbs_down}"
                    v-bind="activatorProps"
                    > thumb_down 
                    </v-icon>
                  </template>
                     
                  <v-card title="Submit Feedback">
                    <v-card-text>
                      <v-row dense>
                        <v-col>
                          <v-text-field
                            label="Please write your feedback*"
                            required
                            type="text"
                            id="feedback"
                            v-model="feedback"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <small class="text-caption text-medium-emphasis">
                        *indicates required field
                      </small>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn text="Close" variant="plain" @click="dialog = false;">Close</v-btn> 

                      <v-btn
                        color="primary"
                        variant="tonal"
                        @click="thumbRating(message.id,-1,feedback); message.thumbs_up = false; message.thumbs_down = true; dialog = false;"  
                      >Submit</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div> 
            </v-col>
             
          </v-row>
        </v-container>

        <div ref="grab" class="w-100" style="height: 40px;"></div>
      </div>
    </div>
  </div>


  <v-footer
      app
      class="footer"
  >
    <div class="px-md-16 w-100 d-flex flex-column">
      
      <div class="d-flex align-center">
        <v-btn
            v-show="fetchingResponse"
            icon="close"
            title="stop"
            class="mr-3"
            @click="stop"
        ></v-btn>
        <Prompt v-show="!fetchingResponse" :use-prompt="usePrompt" />
        <MsgEditor ref="editor" :send-message="send" :disabled="fetchingResponse" :loading="fetchingResponse" />
      </div>
      <v-toolbar
          density="comfortable"
          color="transparent"
      >        
        <Footer/>
        <v-switch
            v-if="$settings.open_web_search === 'True'"
            v-model="enableWebSearch"
            inline
            hide-details
            color="primary"
            :label="$t('webSearch')"
        ></v-switch>
        <v-spacer></v-spacer>
        <div
            v-if="$settings.open_frugal_mode_control === 'True'"
            class="d-flex align-center"
        >
          <v-switch
              v-model="frugalMode"
              inline
              hide-details
              color="primary"
              :label="$t('frugalMode')"
          ></v-switch>
          <v-dialog
              transition="dialog-bottom-transition"
              width="auto"
          >
            <template v-slot:activator="{ props }">
              <v-icon
                  color="grey"
                  v-bind="props"
                  icon="help_outline"
                  class="ml-3"
              ></v-icon>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-toolbar
                    color="primary"
                    :title="$t('frugalMode')"
                ></v-toolbar>
                <v-card-text>
                  {{ $t('frugalModeTip') }}
                </v-card-text>
              </v-card>
            </template>
          </v-dialog>
        </div>

      </v-toolbar>      
    </div>
  </v-footer>
  

  <v-snackbar
      v-model="snackbar"
      multi-line
      location="top"
  >
    {{ snackbarText }}

    <template v-slot:actions>
      <v-btn
          color="red"
          variant="text"
          @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
  
</template>
<Footer/>
<style scoped>
  .footer {
    width: 100%;
  }
</style>
