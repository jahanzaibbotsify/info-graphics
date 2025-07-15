<template>
  <div class="container mx-auto py-12">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-bold mb-2">Choose Your Plan</h1>
      <p class="text-lg text-gray-500">Flexible pricing for every creator. Create unlimited professional infographics!</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div v-for="plan in plans" :key="plan._id" class="relative border rounded-xl p-8 bg-white shadow flex flex-col">
        <!-- Badge for Best Value -->
        <span v-if="plan.billing_period === 'yearly'" class="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">Best Value</span>
        <span v-else-if="plan.is_unlimited && plan.billing_period !== 'yearly'" class="absolute top-4 right-4 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">Popular</span>
        
        <h2 class="text-2xl font-bold mb-1">{{ plan.name }}</h2>
        <p class="text-gray-500 mb-4">{{ plan.description }}</p>
        
        <!-- Pricing Display -->
        <div class="mb-4">
          <div class="text-3xl font-extrabold">
            ${{ plan.amount }}
            <span v-if="plan.billing_period" class="text-lg font-normal text-gray-500">
              /{{ plan.billing_period === 'yearly' ? 'year' : 'month' }}
            </span>
          </div>
          
          <!-- Savings text for yearly plan -->
          <p v-if="plan.savings_text" class="text-sm text-green-600 font-medium mt-1">
            {{ plan.savings_text }}
          </p>
          
          <!-- Monthly equivalent for yearly plan -->
          <p v-if="plan.billing_period === 'yearly' && plan.original_monthly_price" class="text-sm text-gray-500 mt-1">
            Only ${{ (plan.amount / 12).toFixed(2) }}/month when billed yearly
          </p>
        </div>
        <ul class="mb-6 space-y-2 text-gray-700 flex flex-col">
          <li class="flex gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span>
              <span class="font-medium">{{ plan.is_unlimited? 'Unlimited' : plan.animations_allowed }} Infographics</span>
            </span>
          </li>
          <li class="flex items-center gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span><span class="font-medium">AI-Powered Visual Intelligence</span></span>
          </li>
          <li class="flex items-center gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span><span class="font-medium">Professional Templates</span></span>
          </li>
          <li class="flex items-center gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span><span class="font-medium">Premium Customer Support</span></span>
          </li>
          <li v-if="plan.is_unlimited" class="flex items-center gap-2">
            <check-icon class="h-5 w-5 text-green-500" />
            <span><span class="font-medium">Export & Download</span></span>
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