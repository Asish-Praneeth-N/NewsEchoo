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
      <main className="flex flex-col gap-16">
        <section id="hero" className="w-full">
          <Hero />
        </section>
        <section id="newsletters" className="w-full">
          <NewsletterPreview />
        </section>
        <section id="how-it-works" className="w-full">
          <HowItWorks />
        </section>
        <section id="why-subscribe" className="w-full">
          <WhySubscribe />
        </section>
        <section id="testimonials" className="w-full">
          <Testimonials />
        </section>
        <section id="cta" className="w-full">
          <CallToAction />
        </section>
      </main>
      <Footer />
    </div>
  );
}