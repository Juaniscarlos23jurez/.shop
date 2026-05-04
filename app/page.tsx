"use client"

import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { AppDemoSection } from "@/components/home/app-demo-section"
import { SoftwareBusinessSection } from "@/components/home/software-business-section"
import { WhatsAppExperience } from "@/components/home/whatsapp-experience"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/home/faq-section"
import { CTASection, ContactSection } from "@/components/home/cta-contact-section"
import { Footer } from "@/components/layout/footer"
import { FloatingButtons } from "@/components/home/floating-buttons"

const WHATSAPP_URL = "https://wa.me/525540306126?text=Hola,%20me%20gustaría%20saber%20más%20sobre%20Fynlink+"
const SALES_EMAIL = "hola@fynlink.com"
const CALENDLY_URL = "https://calendly.com/juancarlosjuarez26/30min"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar WHATSAPP_URL={WHATSAPP_URL} />

      <main>
        <HeroSection CALENDLY_URL={CALENDLY_URL} />
        <FeaturesSection />
        <AppDemoSection />
        <SoftwareBusinessSection />
        <WhatsAppExperience />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection WHATSAPP_URL={WHATSAPP_URL} />
        <CTASection />
        <ContactSection
          WHATSAPP_URL={WHATSAPP_URL}
          SALES_EMAIL={SALES_EMAIL}
          CALENDLY_URL={CALENDLY_URL}
        />
      </main>

      <Footer />
      <FloatingButtons WHATSAPP_URL={WHATSAPP_URL} />
    </div>
  )
}