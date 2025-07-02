<template>
  <div class="container py-10">
    <h1 class="text-3xl font-bold mb-6">Explore Animated Icons</h1>
    <p class="text-lg text-muted-foreground mb-8">
      This is a placeholder for the Explore page. In the full implementation, this would display a gallery of animated icons.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="p-6 border rounded-lg bg-card flex items-center justify-center">
        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <search-icon v-if="i % 4 === 0" class="h-8 w-8 text-primary" />
          <heart-icon v-else-if="i % 4 === 1" class="h-8 w-8 text-primary" />
          <bell-icon v-else-if="i % 4 === 2" class="h-8 w-8 text-primary" />
          <settings-icon v-else class="h-8 w-8 text-primary" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { SearchIcon, HeartIcon, BellIcon, SettingsIcon } from 'lucide-vue'

export default {
  name: 'Explore',
  components: {
    SearchIcon,
    HeartIcon,
    BellIcon,
    SettingsIcon
  }
}
</script> 