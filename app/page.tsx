'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  Check, 
  Globe,
  Zap,
  Shield,
  Link2,
  CalendarDays
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  const handleGoToApp = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Schedulr</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <Link href="#features" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                Solutions
              </Link>
              <Link href="#enterprise" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                Enterprise
              </Link>
              <Link href="#testimonials" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                Resources
              </Link>
              <Link href="#pricing" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
                Pricing
              </Link>
            </div>
          </div>
          <button 
            onClick={handleGoToApp} 
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Go to app
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                The better way to{' '}
                <span className="text-gray-500">schedule</span> your meetings
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Schedulr is the open-source scheduling infrastructure that makes it easy for individuals, 
                businesses, and developers to manage their time efficiently. Say goodbye to back-and-forth 
                emails and hello to seamless scheduling.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button 
                  onClick={handleGoToApp}
                  className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
                <button 
                  onClick={handleGoToApp}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Sign up with email
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Free to get started. No credit card required.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100" />
                  <div>
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">30 Minute Meeting</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-gray-500">{day}</div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => (
                    <button
                      key={i}
                      className={`rounded-lg py-2 transition-colors ${
                        i === 14 
                          ? 'bg-gray-900 text-white' 
                          : i > 5 && i < 26 && i !== 6 && i !== 7 && i !== 13 && i !== 14 && i !== 20 && i !== 21 && i !== 27 && i !== 28
                          ? 'text-gray-900 hover:bg-gray-100' 
                          : 'text-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-900">Available times for Jan 15</p>
                  <div className="flex flex-wrap gap-2">
                    {['9:00am', '10:00am', '11:00am', '2:00pm', '3:00pm'].map((time) => (
                      <button 
                        key={time}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 transition-colors hover:border-gray-300"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-y border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-center text-sm text-gray-500">
            Trusted by over 100,000 individuals and teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {['Vercel', 'Stripe', 'GitHub', 'Notion', 'Linear', 'Figma'].map((company) => (
              <div key={company} className="text-xl font-semibold text-gray-500">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to schedule smarter
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features to help you manage your time and grow your business.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: 'Smart Scheduling',
                description: 'Automatically find the best times for everyone. No more back-and-forth emails.'
              },
              {
                icon: Link2,
                title: 'Booking Links',
                description: 'Share your personal booking link and let others schedule time with you.'
              },
              {
                icon: Clock,
                title: 'Availability Management',
                description: 'Set your available hours and let the system handle the rest.'
              },
              {
                icon: Users,
                title: 'Team Scheduling',
                description: 'Coordinate meetings across your entire team with ease.'
              },
              {
                icon: Globe,
                title: 'Timezone Detection',
                description: 'Automatically detect and convert timezones for global teams.'
              },
              {
                icon: Zap,
                title: 'Integrations',
                description: 'Connect with Google Calendar, Zoom, Teams, and 100+ other apps.'
              }
            ].map((feature) => (
              <div 
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-xl bg-gray-100 p-3">
                  <feature.icon className="h-6 w-6 text-gray-900" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="border-y border-gray-200 bg-gray-50 px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built for enterprise scale
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Advanced security, compliance, and customization options for large organizations.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'SSO & SAML authentication',
                  'Advanced analytics & reporting',
                  'Custom branding & white-labeling',
                  'Dedicated support & SLAs',
                  'API access & webhooks',
                  'SOC 2 Type II compliant'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-900">{item}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={handleGoToApp}
                className="mt-8 inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Contact sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <Shield className="mb-6 h-12 w-12 text-gray-500" />
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Enterprise-grade security</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-level encryption, regular security audits, 
                and compliance with industry standards including SOC 2, GDPR, and HIPAA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by teams worldwide
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our customers have to say about Schedulr.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: "Schedulr has completely transformed how we handle client meetings. The integration with our existing tools is seamless.",
                author: "Sarah Chen",
                role: "CEO, TechStart",
                avatar: "SC"
              },
              {
                quote: "We reduced our scheduling time by 80%. Our team can now focus on what really matters - building great products.",
                author: "Michael Roberts",
                role: "Engineering Lead, DevCo",
                avatar: "MR"
              },
              {
                quote: "The best scheduling tool I've ever used. Simple, powerful, and the support team is incredibly responsive.",
                author: "Emily Watson",
                role: "Founder, DesignLab",
                avatar: "EW"
              }
            ].map((testimonial) => (
              <div 
                key={testimonial.author}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <p className="text-gray-600">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-sm font-medium text-gray-900">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-gray-50 px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to simplify your scheduling?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of professionals who have already made the switch. 
            Get started for free today.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button 
              onClick={handleGoToApp} 
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button 
              onClick={handleGoToApp} 
              className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
            >
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Schedulr</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-gray-500">
                The open-source scheduling infrastructure for everyone.
              </p>
            </div>
            {[
              {
                title: 'Product',
                links: ['Features', 'Integrations', 'Pricing', 'Changelog']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Press']
              },
              {
                title: 'Resources',
                links: ['Documentation', 'Help Center', 'Community', 'Contact']
              }
            ].map((column) => (
              <div key={column.title}>
                <h3 className="mb-4 font-semibold text-gray-900">{column.title}</h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Schedulr. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
