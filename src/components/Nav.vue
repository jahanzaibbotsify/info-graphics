<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-16 items-center justify-between">
      <div class="flex items-center gap-2">
        <router-link to="/" class="flex items-center gap-2">
          <img src="/logo.png" alt="Infogiraffe Art" class="object-contain" style="max-width: 100px;" />
        </router-link>
      </div>
      
      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-6">
        <router-link 
          to="/" 
          class="text-sm font-medium hover:text-primary transition-colors"
          @click.native="scrollToExplore"
        >
          Explore
        </router-link>
        <router-link to="/pricing" class="text-sm font-medium hover:text-primary transition-colors">
          Pricing
        </router-link>
      </nav>
      
      <div class="hidden md:flex items-center gap-4">
        <template v-if="isLoggedIn">
          <span class="text-sm font-medium mr-2">Hi, {{ userName }}</span>
          <button
            @click="handleLogout"
            class="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <button
            @click="showAuthModal = true"
            class="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            Login
          </button>
        </template>
      </div>
      
      <!-- Mobile Menu Button -->
      <div class="flex items-center gap-2 md:hidden">
        <button 
          class="p-2 rounded-md hover:bg-muted"
          @click="isOpen = !isOpen"
          aria-label="Toggle menu"
        >
          <x-icon v-if="isOpen" class="h-5 w-5" />
          <menu-icon v-else class="h-5 w-5" />
        </button>
      </div>
    </div>
    
    <!-- Mobile Navigation -->
    <div v-if="isOpen" class="md:hidden border-t py-4 px-6 bg-background">
      <nav class="flex flex-col space-y-4">
        <router-link 
          to="/" 
          class="text-sm font-medium py-2 hover:text-primary transition-colors"
          @click="isOpen = false"
        >
          Infographics
        </router-link>
        <router-link 
          to="/" 
          class="text-sm font-medium py-2 hover:text-primary transition-colors"
          @click="handleMobileExplore"
        >
          Explore
        </router-link>
        <router-link to="/pricing" class="text-sm font-medium py-2 hover:text-primary transition-colors" @click="isOpen = false">
          Pricing
        </router-link>
        <div class="pt-2">
          <template v-if="isLoggedIn">
            <span class="text-sm font-medium mr-2">Hi, {{ userName }}</span>
            <button
              @click="handleLogout"
              class="w-full py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors mt-2"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <button
              @click="showAuthModal = true; isOpen = false"
              class="w-full py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors mt-2"
            >
              Login
            </button>
          </template>
        </div>
      </nav>
    </div>
    <AuthModal :show="showAuthModal" @close="showAuthModal = false" @auth="onAuth" />
  </header>
</template>

<script>
import { SparklesIcon, XIcon, MenuIcon } from 'lucide-vue'
import ModeToggle from '@/components/ModeToggle.vue'
import AuthModal from '@/components/AuthModal.vue'
import { EventBus } from '@/eventBus'

export default {
  name: 'Nav',
  components: {
    SparklesIcon,
    XIcon,
    MenuIcon,
    ModeToggle,
    AuthModal
  },
  data() {
    return {
      isOpen: false,
      showAuthModal: false,
      isLoggedIn: false,
      userName: ''
    }
  },
  created() {
    this.checkAuth()
    // Listen for auth events
    EventBus.$on('auth', this.onAuth)
  },
  beforeDestroy() {
    // Clean up event listener
    EventBus.$off('auth', this.onAuth)
  },
  methods: {
    scrollToExplore() {
      // Wait for the route change to complete
      this.$nextTick(() => {
        const exploreSection = document.querySelector('.max-w-4xl.mt-16');
        if (exploreSection) {
          exploreSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    },
    handleMobileExplore() {
      this.isOpen = false;
      this.scrollToExplore();
    },
    checkAuth() {
      const token = localStorage.getItem('jwt')
      if (token) {
        // Try to get user info from localStorage or decode from token
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          this.userName = user.name || user.email || ''
        } else {
          this.userName = ''
        }
        this.isLoggedIn = true
      } else {
        this.isLoggedIn = false
        this.userName = ''
      }
    },
    onAuth({ user, token }) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('jwt', token)
      this.isLoggedIn = true
      this.userName = user.name || user.email || ''
    },
    handleLogout() {
      localStorage.removeItem('jwt')
      localStorage.removeItem('user')
      this.isLoggedIn = false
      this.userName = ''
      // Emit logout event
      EventBus.$emit('logout')
    }
  },
  watch: {
    showAuthModal(val) {
      if (!val) {
        this.checkAuth()
      }
    }
  }
}
</script> 