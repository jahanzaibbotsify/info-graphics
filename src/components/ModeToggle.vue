<template>
  <div class="relative">
    <button 
      @click="toggleDropdown"
      class="p-2 rounded-md hover:bg-muted"
      aria-label="Toggle theme"
    >
      <sun-icon 
        class="h-5 w-5 transition-all" 
        :class="{ 'rotate-0 scale-100': theme !== 'dark', '-rotate-90 scale-0': theme === 'dark' }" 
      />
      <moon-icon 
        class="absolute top-2 left-2 h-5 w-5 transition-all" 
        :class="{ 'rotate-90 scale-0': theme !== 'dark', 'rotate-0 scale-100': theme === 'dark' }" 
      />
    </button>
    
    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-background border"
    >
      <div class="py-1">
        <button 
          @click="setTheme('light')" 
          class="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
        >
          Light
        </button>
        <button 
          @click="setTheme('dark')" 
          class="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
        >
          Dark
        </button>
        <button 
          @click="setTheme('system')" 
          class="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
        >
          System
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { SunIcon, MoonIcon } from 'lucide-vue'

export default {
  name: 'ModeToggle',
  components: {
    SunIcon,
    MoonIcon
  },
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    theme() {
      return this.$store.state.theme
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false
      }
    },
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    setTheme(theme) {
      this.$store.commit('setTheme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
      this.isOpen = false
    }
  }
}
</script> 