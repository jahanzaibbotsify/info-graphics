<template>
  <div class="container mx-auto py-12">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-2">Choose Your Plan</h1>
      <p class="text-lg text-gray-500">Flexible pricing for every creator. Unlock more Lottie animations and features!</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div v-for="plan in plans" :key="plan._id" class="relative border rounded-xl p-8 bg-white shadow flex flex-col">
        <!-- Badge for Unlimited plan -->
        <span v-if="plan.is_unlimited" class="absolute top-4 right-4 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">Best Value</span>
        <h2 class="text-2xl font-bold mb-1">{{ plan.name }}</h2>
        <p class="text-gray-500 mb-4">{{ plan.description }}</p>
        <div class="text-3xl font-extrabold mb-4">${{ plan.amount }}</div>
        <ul class="mb-6 space-y-2 text-gray-700 flex flex-col">
          <li class="flex gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span>
              <span class="font-medium">{{ plan.is_unlimited? 'Unlimited' : plan.animations_allowed }} Animations Allowed</span>
            </span>
          </li>
          <li class="flex items-center gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span><span class="font-medium">Premium Customer Support</span></span>
          </li>
          <li class="flex items-center gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span><span class="font-medium">High Quality</span></span>
          </li>
          <li class="flex items-center gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span><span class="font-medium">Lottie Animation</span></span>
          </li>
        </ul>
        <button 
          @click="handleGetStarted(plan.pricing_id)"
          :disabled="loadingPlanId === plan.pricing_id"
          class="mt-auto w-full h-12 rounded-lg bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {{ loadingPlanId === plan.pricing_id ? 'Processing...' : 'Get Started' }}
        </button>
      </div>
    </div>
    <AuthModal :show="showAuthModal" @close="showAuthModal = false" @auth="onAuth" />
  </div>
</template>

<script>
import axios from 'axios'
import { CheckIcon } from 'lucide-vue'
import AuthModal from '@/components/AuthModal.vue'

export default {
  name: 'Pricing',
  components: { 
    CheckIcon,
    AuthModal
  },
  data() {
    return {
      plans: [],
      showAuthModal: false,
      loadingPlanId: null
    }
  },
  async mounted() {
    const res = await axios.get(`${process.env.VUE_APP_BACKEND_URL}/api/plans`)
    this.plans = res.data
  },
  methods: {
    async handleGetStarted(plan) {
      const token = localStorage.getItem('jwt')
      
      if (!token) {
        this.showAuthModal = true
        return
      }

      try {
        this.loadingPlanId = plan
        const response = await axios.post(
          `${process.env.VUE_APP_BACKEND_URL}/create-checkout-session`,
          { planId: plan },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        // Redirect to Stripe Checkout
        window.location.href = response.data.url
      } catch (error) {
        console.error('Checkout error:', error)
        alert('Failed to start checkout. Please try again.')
      } finally {
        this.loadingPlanId = null
      }
    },
    onAuth({ user, token }) {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('jwt', token)
      this.showAuthModal = false
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
</style> 