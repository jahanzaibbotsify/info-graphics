<template>
  <div class="container py-10 max-w-md mx-auto">
    <div class="text-center mb-8">
      <router-link to="/" class="inline-flex items-center gap-2">
        <sparkles-icon class="h-6 w-6 text-primary" />
        <span class="font-bold text-xl">Lottie Art</span>
      </router-link>
      <h1 class="text-2xl font-bold mt-6">Log in to your account</h1>
    </div>
    
    <div class="bg-card border rounded-lg p-6">
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email"
            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            id="password"
            v-model="password" 
            class="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your password"
            required
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
        
        <button 
          type="submit" 
          class="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Log in' }}
        </button>
      </form>
      
      <div class="mt-4 text-center text-sm">
        <router-link to="/forgot-password" class="text-primary hover:underline">
          Forgot your password?
        </router-link>
      </div>
      
      <div class="mt-6 pt-6 border-t text-center text-sm">
        Don't have an account?
        <router-link to="/signup" class="text-primary hover:underline">
          Sign up
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { SparklesIcon } from 'lucide-vue'
import axios from 'axios'
import { EventBus } from '@/eventBus'

export default {
  name: 'Login',
  components: {
    SparklesIcon
  },
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isLoading: false
    }
  },
  methods: {
    async handleSubmit() {
      this.error = ''
      this.isLoading = true

      try {
        const res = await axios.post(`${process.env.VUE_APP_BACKEND_URL}/api/login`, {
          email: this.email,
          password: this.password
        })

        // Store user data and token
        localStorage.setItem('jwt', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))

        // Emit auth event for Nav component
        EventBus.$emit('auth', { user: res.data.user, token: res.data.token })

        // Redirect to home page
        this.$router.push('/')
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed. Please try again.'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.bg-primary {
  background: rgb(59 130 246 / var(--tw-bg-opacity, 1));
}
.hover\:bg-primary\/90:hover {
  background: rgb(37 99 235 / var(--tw-bg-opacity, 1));
}
.bg-background {
  background: #f8fafc;
}
</style> 