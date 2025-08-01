'use client';

import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import NewsletterPreview from '@/components/NewsletterPreview';
import HowItWorks from '@/components/HowItWorks';
import WhySubscribe from '@/components/WhySubscribe';
import Testimonials from '@/components/Testimonials';
import CallToAction from '@/components/CallToAction';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <section id="hero">
          <Hero />
        </section>
        <section id="newsletters">
          <NewsletterPreview />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="why-subscribe">
          <WhySubscribe />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="cta">
          <CallToAction />
        </section>
      </main>
      <Footer />
    </div>
  );
}