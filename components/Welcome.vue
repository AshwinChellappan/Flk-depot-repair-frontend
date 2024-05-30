
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="text-center">
          <!-- <h2 class="text-h2" style="font-size:1.75rem !important">{{ $t('welcomeTo') }} <span class="text-primary" style="color:rgb(9, 76, 138) !important">{{ runtimeConfig.public.appName }}</span></h2>
          <p class="text-caption my-5">
             {{ $t('welcomeScreen.introduction1') }}
             <br><a href="https://mylearning.fortive.com/#/online-courses/462a4ebe-8f48-4ab4-ab6d-4efc4b6eb4fe" style="font-size:17px" target="_blank"></a>            
          </p>           -->
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
               
      </v-col>
      </v-row>    
    
  </v-container>
</template>



<script setup>
import {ref} from 'vue';
import { emitter } from '../eventBus';
const runtimeConfig = useRuntimeConfig()
const { $i18n } = useNuxtApp()



const selectedPrompt=ref(null);
const prompts=ref([]);
//provide('returnSelectedPrompt',selectedPrompt);

const loadPromptsFromCSV = async () =>{
  try{
    const response = await fetch('/prompts.csv');
    const data = await response.text();
    const lines = data.trim().split("\n")
    lines.slice(1).forEach((line) =>{
      
      const [,prompt]=line.split('","');
          prompts.value.push(prompt.replace(/"/g,''));
      
         });        
  } catch(error) {
      console.error("Error loading prompts from csv",error)
  }
};

await loadPromptsFromCSV();




const updateSelectedValue = (event) => {  
   emitter.emit('selectedValue',event.target.value);
 };

</script>

<style>

.dropdown {
  border:1px solid rgba(102, 101, 101, 0.904) !important;
  padding:5px;
  border-radius:4px;
  font-size:14px;
  background-color: rgba(240,240,240);
  color: rgb(51, 51, 51);
}
a {  
  color: rgb(9, 76, 138);
}

</style>
