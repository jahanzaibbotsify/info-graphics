<template>
  <div id="app" class="min-h-screen flex flex-col">
    <Nav />
    <main class="flex-1">
      <router-view/>
    </main>
    <Footer />
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'App',
  components: {
    Nav,
    Footer
  }
}
</script>

<style>
@import './assets/tailwind.css';
</style> 