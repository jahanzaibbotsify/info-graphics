<template>
  <div class="container py-10 max-w-md mx-auto">
    <div class="text-center mb-8">
      <router-link to="/" class="inline-flex items-center gap-2">
        <sparkles-icon class="h-6 w-6 text-primary" />
        <span class="font-bold text-xl">AnimIconAI</span>
      </router-link>
      <h1 class="text-2xl font-bold mt-6">Create your account</h1>
    </div>
    
    <div class="bg-card border rounded-lg p-6">
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium mb-1">Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="name"
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Enter your name"
          />
        </div>
        
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email"
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Enter your email"
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            id="password"
            v-model="password" 
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Create a password"
          />
        </div>
        
        <button 
          type="submit" 
          class="w-full py-2 bg-primary text-white rounded-md hover:bg-primary-600"
        >
          Sign up
        </button>
      </form>
      
      <div class="mt-6 pt-6 border-t text-center text-sm">
        Already have an account?
        <router-link to="/login" class="text-primary hover:underline">
          Log in
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { SparklesIcon } from 'lucide-vue'

export default {
  name: 'Signup',
  components: {
    SparklesIcon
  },
  data() {
    return {
      name: '',
      email: '',
      password: ''
    }
  },
  methods: {
    handleSubmit() {
      // This would handle signup in a real implementation
      console.log('Signup attempt with:', this.email)
      alert('Signup functionality would be implemented in a real application')
    }
  }
}
</script> 