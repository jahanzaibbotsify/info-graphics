<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Upgrade Your Plan</h2>
        <p class="text-gray-600">You've reached your daily limit. Choose a plan to continue generating icons.</p>
      </div>

      <div class="space-y-4">
        <div v-for="plan in plans" :key="plan._id"
             class="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
             :class="{ 'border-blue-500 bg-blue-50': selectedPlan === plan.pricing_id }"
             @click="selectPlan(plan.pricing_id)">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-lg">{{ plan.name }}</h3>
              <p class="text-gray-600">{{ plan.is_unlimited ? 'Unlimited Animations Per Month' : plan.animations_allowed + ' Animations Per Month' }}</p>
            </div>
            <div class="text-xl font-bold">${{ plan.amount }}</div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-4">
        <button @click="close" class="px-4 py-2 text-gray-600 hover:text-gray-800">
          Maybe Later
        </button>
        <button @click="upgrade" 
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                :disabled="!selectedPlan || isLoading">
          {{ isLoading ? 'Processing...' : 'Upgrade Now' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PricingModal',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      selectedPlan: null,
      plans: [],
      isLoading: false
    }
  },
  async mounted() {
    await this.fetchPlans()
  },
  methods: {
    async fetchPlans() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_BACKEND_URL}/api/plans`)
        this.plans = response.data
      } catch (error) {
        console.error('Error fetching plans:', error)
      }
    },
    selectPlan(planId) {
      this.selectedPlan = planId;
    },
    close() {
      this.$emit('close');
    },
    async upgrade() {
      if (!this.selectedPlan) return

      const token = localStorage.getItem('jwt')
      
      if (!token) {
        this.$emit('close')
        // Emit an event to show auth modal
        this.$emit('show-auth')
        return
      }

      try {
        this.isLoading = true
        const response = await axios.post(
          `${process.env.VUE_APP_BACKEND_URL}/create-checkout-session`,
          { planId: this.selectedPlan },
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
        this.isLoading = false
      }
    }
  }
}
</script> 