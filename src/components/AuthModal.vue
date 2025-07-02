<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center min-h-screen">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <!-- Modal -->
    <div class="relative bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-lg flex flex-col justify-center">
      <!-- Close button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Close"
      >
        <x-icon class="h-5 w-5" />
      </button>
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold mb-1">
            {{ isLogin ? 'Login' : 'Create an Account' }}
          </h2>
          <p class="text-gray-500 text-sm mb-4">
            {{ isLogin ? 'Enter your credentials to access your account' : 'Fill in the information to create your account' }}
          </p>
        </div>
        <form @submit.prevent="isLogin ? handleLogin() : handleSignup()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder=""
              class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              required
            />
          </div>
          <div v-if="!isLogin">
            <label class="block text-sm font-medium mb-1">Name</label>
            <input
              v-model="name"
              type="text"
              placeholder="Your name"
              class="w-full h-10 px-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              required
            />
          </div>
          <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
          <div v-if="success" class="text-green-600 text-sm">{{ success }}</div>
          <button
            type="submit"
            class="w-full h-10 rounded-lg text-white font-medium hover:opacity-90 transition-colors mt-2"
            style="background: rgb(59 130 246 / var(--tw-bg-opacity, 1));"
          >
            {{ isLogin ? 'Login' : 'Sign Up' }}
          </button>
        </form>
        <div class="text-center mt-2">
          <span v-if="isLogin" class="text-sm text-gray-500">
            Don't have an account?
            <a href="#" class="font-medium hover:underline" style="color: rgb(59 130 246 / var(--tw-bg-opacity, 1));" @click.prevent="switchToSignup">Sign up</a>
          </span>
          <span v-else class="text-sm text-gray-500">
            Already have an account?
            <a href="#" class="font-medium hover:underline" style="color: rgb(59 130 246 / var(--tw-bg-opacity, 1));" @click.prevent="switchToLogin">Login</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { XIcon } from 'lucide-vue'
import axios from 'axios'

export default {
  name: 'AuthModal',
  components: { XIcon },
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      isLogin: true,
      email: '',
      password: '',
      name: '',
      error: '',
      success: ''
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''
      this.success = ''
      try {
        const res = await axios.post(`${process.env.VUE_APP_BACKEND_URL}/api/login`, {
          email: this.email,
          password: this.password
        })
        localStorage.setItem('jwt', res.data.token)
        this.$emit('auth', { user: res.data.user, token: res.data.token })
        this.$emit('close')
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed.'
      }
    },
    async handleSignup() {
      this.error = ''
      this.success = ''
      try {
        await axios.post(`${process.env.VUE_APP_BACKEND_URL}/api/register`, {
          email: this.email,
          password: this.password,
          name: this.name
        })
        this.success = 'Registration successful! You can now log in.'
        this.isLogin = true
      } catch (err) {
        this.error = err.response?.data?.error || 'Registration failed.'
      }
    },
    switchToSignup() {
      this.isLogin = false
      this.error = ''
      this.success = ''
    },
    switchToLogin() {
      this.isLogin = true
      this.error = ''
      this.success = ''
    }
  }
}
</script>

<style scoped>
.bg-background {
  background: #f8fafc;
}
</style> 