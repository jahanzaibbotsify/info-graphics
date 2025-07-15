<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-12 max-w-4xl">
      <div class="prose prose-lg max-w-none">
        <h1 class="text-4xl font-bold text-center mb-8">Terms of Service</h1>
        <!-- <p class="text-center text-muted-foreground mb-12">Last updated: {{ new Date().toLocaleDateString() }}</p> -->

        <div class="space-y-8">
          <section>
            <h2 class="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p class="text-muted-foreground leading-relaxed">
              By accessing and using Infogiraffe Art ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p class="text-muted-foreground leading-relaxed">
              Infogiraffe Art is an AI-powered platform that enables users to create professional infographics and data visualizations. 
              Our service provides templates, AI assistance, and tools for creating compelling visual content based on factual data and statistics.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              To access certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul class="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul class="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Service to create content that is illegal, harmful, threatening, abusive, or discriminatory</li>
              <li>Violate any applicable local, state, national, or international law or regulation</li>
              <li>Transmit any material that infringes upon the intellectual property rights of others</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems</li>
              <li>Use the Service to distribute spam or malicious content</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of the content you create using our Service. However, by using the Service, you grant us:
            </p>
            <ul class="list-disc pl-6 text-muted-foreground space-y-2">
              <li>A license to use, modify, and display your content solely for the purpose of providing the Service</li>
              <li>The right to use anonymized and aggregated data for improving our services</li>
            </ul>
            <p class="text-muted-foreground leading-relaxed mt-4">
              Our AI technology, templates, and platform remain the intellectual property of Infogiraffe Art.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">6. Privacy Policy</h2>
            <p class="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our 
              <router-link to="/privacy" class="text-primary hover:underline">Privacy Policy</router-link>, 
              which also governs your use of the Service, to understand our practices.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">7. Subscription and Billing</h2>
            <p class="text-muted-foreground leading-relaxed mb-4">
              Some features of the Service require a paid subscription. By subscribing, you agree to:
            </p>
            <ul class="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Pay all applicable fees and charges for your chosen plan</li>
              <li>Automatic renewal of your subscription unless cancelled</li>
              <li>Our right to change pricing with 30 days notice</li>
              <li>No refunds for partial months of service</li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p class="text-muted-foreground leading-relaxed">
              The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">9. Termination</h2>
            <p class="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, 
              for any reason whatsoever, including breach of these Terms.
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p class="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes. 
              Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <!-- <section>
            <h2 class="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p class="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
              <a href="mailto:legal@infogiraffe.art" class="text-primary hover:underline">legal@infogiraffe.art</a>
            </p>
          </section> -->
        </div>

        <div class="mt-12 pt-8 border-t text-center">
          <router-link 
            to="/" 
            class="inline-flex items-center gap-2 text-primary hover:underline"
          >
            ← Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Terms',
  metaInfo: {
    title: 'Terms of Service - Infogiraffe Art',
    meta: [
      {
        name: 'description',
        content: 'Terms of Service for Infogiraffe Art - AI-powered infographic creation platform'
      }
    ]
  }
}
</script> 