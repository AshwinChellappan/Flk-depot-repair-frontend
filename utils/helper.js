import {ref} from 'vue'
let counter=1
//localStorage.clear()


export const getDefaultConversationData = () => {
    const { $i18n } = useNuxtApp()
    return {
        id: null,
        topic: null,
        messages: [],
        loadingMessages: false,
    }
}

export const getConversations = () => { 
    let conversations=[]
    if (typeof localStorage !== 'undefined'){     
        conversations=localStorage.getItem('conversations')
    }
    if(conversations){
        return JSON.parse(conversations);
    }
    return ref([]);
}

export const addConversation = (conversation) => {    
         
    const conversations=useConversations()           
    conversations.value.unshift(conversation);  
    //conversations.value = [conversation, ...conversations.value]  
    console.log("adconv",conversations.value)         
    //localStorage.setItem('conversations', JSON.stringify(conversations.value));    
}
export const addToStorage=()=>{
    let storedConversation=[]
    let storedConversationLength = 0
    const conversations=useConversations()
    const isConversationsLocal=JSON.parse(localStorage.getItem('conversations'));
    let conversation_id=localStorage.getItem('activeChatId');
    let conversationIndex = conversations.value.findIndex(conversation => conversation.id === conversation_id);
    if(conversationIndex == -1){
        conversation_id=localStorage.getItem('conversationId');
        conversationIndex = conversations.value.findIndex(conversation => conversation.id === conversation_id);
    }
    if(isConversationsLocal){     
     storedConversation=isConversationsLocal.find(conversation => conversation.id === conversation_id) || [];
    }
    if(storedConversation.messages){
        storedConversationLength = storedConversation.messages.length
    }
    else{
        storedConversationLength = storedConversation.length
    }
    if(conversations.value[conversationIndex].messages.length>=storedConversationLength){    
      setTimeout(() => {           
        // Store the data in localStorage  
        localStorage.setItem('conversations', JSON.stringify(conversations.value));        
      }, 6000);
      return "success"
    }else{
    return "failed"
}  
}


export const addMessageToConversation = (conversationId, message) => {  
    
    const conversations=getConversations()  
    //localStorage.setItem('conversations', JSON.stringify(conversations));  
    //conversations=    
    let conversationIndex = conversations.findIndex(conversation => conversation.id === conversationId);      
    if (conversationIndex === -1) {  
      // Conversation with the given ID doesn't exist  
      let newConversation = getDefaultConversationData()
      newConversation.id=conversationId
      newConversation.topic='Chat-' +conversationId
      conversations.push(newConversation);                  
      conversationIndex = conversations.findIndex(conversation => conversation.id === conversationId);  
    }      
    
    const previousToLastMessage = message[message.length - 2];
    const lastMessage = message[message.length - 1];
    console.log("lm",previousToLastMessage,lastMessage)
    conversations[conversationIndex].messages.push(previousToLastMessage); 
    conversations[conversationIndex].messages.push(lastMessage);       
    localStorage.removeItem('conversations')
    localStorage.setItem('conversations', JSON.stringify(conversations));  
  }  
  

export const removeConversation = (index) => { 
    const conversations=useConversations()     
    if (index !== -1) {
        let deletedChatId = conversations.value[index].id
        conversations.value.splice(index, 1);
        localStorage.setItem('conversations', JSON.stringify(conversations.value));
        return deletedChatId
    }
    
}

export const genTitle = async (conversationId) => {    
        const conversations=useConversations()       
        
        let index = conversations.value.findIndex(item => item.id === conversationId)
        
        if (index === -1) {
            index = 0
        }
        // let chatCount = localStorage.getItem('chatCount'); 
        let chatCount = 0
        const chatHistory = JSON.parse(localStorage.getItem('conversations'));
 
        if (!chatHistory) {  
            // If chat count is not set, set it to 1  
            chatCount =  1 ;  
            } else {  
            // If chat count is set, increment it by 1  
            chatCount = chatHistory.length + 1;  
            }
        let chatName = `Chat-${chatCount}`;              
        // Check if the chat name already exists in history  
        while (chatHistory && chatHistory.find(chatHistory => chatHistory.topic === chatName)) {  
        chatCount++;  
        chatName = `Chat-${chatCount}`;  
        }  

        // // Save the new chat count to local storage  
        // localStorage.setItem('chatCount', chatCount);  

        // Set the chat name  
        console.log(chatName)
        conversations.value[index].topic = chatName
        // conversations.value[index].topic = 'Chat-'+conversationId
        return conversationId
    
}

export const fetchUser = async () => {
    return useMyFetch('/api/account/user/')
}

export const setUser = (userData) => {
    const user = useUser()
    user.value = userData
}

export const logout = () => {
    const user = useUser()
    user.value = null
    return navigateTo('/account/signin');
}

export const removeAllConversations = () => {
    const conversations=useConversations()  
    conversations.value=[]    
    localStorage.removeItem('conversations')
    localStorage.removeItem('activeChatId')
    localStorage.removeItem('conversationId')
    //localStorage.clear()    
    
};
