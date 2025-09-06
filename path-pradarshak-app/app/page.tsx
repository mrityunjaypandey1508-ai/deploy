"use client";

import Link from "next/link";
import HomepageNavigation from "@/components/HomepageNavigation";
import {
  ArrowRight,
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  BarChart3,
  Shield,
  Users,
  Eye,
  Globe,
  Zap,
  Award,
  Heart,
  Lightbulb,
  Rocket,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Homepage Navigation */}
      <HomepageNavigation />
      
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-white px-6 py-12 bg-cover bg-center relative overflow-hidden">
        {/* Background Image with Enhanced Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/civic_hero.jpeg')" }}
        />
        
        {/* Enhanced Gradient Overlay for Better Text Visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        
        {/* Subtle Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-blue-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-40 right-20 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-0 border border-white/20">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Trusted by 10+ users worldwide</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl animate-fade-in">
            <span className="text-white">CivicSync</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Report civic issues instantly. Track resolutions. Build smarter, cleaner, and more responsive cities with CivicSync.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 animate-scale-in">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <button className="btn btn-primary btn-lg group inline-flex items-center justify-center w-full sm:w-48">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <button className="btn btn-outline btn-lg w-full sm:w-48">
                Learn More
              </button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10+</div>
              <div className="text-slate-300 text-sm">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-slate-300 text-sm">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-slate-300 text-sm">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-3xl font-bold mb-6 leading-tight text-gradient-primary drop-shadow-lg">
              Why Choose CivicSync?
            </h2>
            <p className="text-xl md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Our platform combines cutting-edge technology with civic engagement to create
              an unparalleled community improvement experience.
            </p>
            <div className="divider mt-8"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card card-hover group p-6 text-center">
              <div className="icon-wrapper group-hover:scale-110 transition-transform duration-300 mb-4 mx-auto">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-800">Easy Issue Reporting</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Citizens can report potholes, trash, broken lights with photo + location.
                Simple, intuitive interface for quick reporting.
              </p>
            </div>

            <div className="card card-hover group p-6 text-center">
              <div className="icon-wrapper-accent group-hover:scale-110 transition-transform duration-300 mb-4 mx-auto">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-800">Real-Time Tracking</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Track issue status from submitted to resolved with real-time updates.
                Stay informed about your community's progress.
              </p>
            </div>

            <div className="card card-hover group p-6 text-center">
              <div className="icon-wrapper-warm group-hover:scale-110 transition-transform duration-300 mb-4 mx-auto">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-800">Verified Resolution</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Staff update progress until fixed with verification photos.
                Ensure issues are actually resolved, not just marked complete.
              </p>
            </div>

            <div className="card card-hover group p-6 text-center">
              <div className="icon-wrapper group-hover:scale-110 transition-transform duration-300 mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-800">Admin Dashboard</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Officials manage issues and generate reports efficiently.
                Comprehensive tools for municipal management.
              </p>
            </div>

            <div className="card card-hover group p-6 text-center">
              <div className="icon-wrapper-accent group-hover:scale-110 transition-transform duration-300 mb-4 mx-auto">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-800">Community Impact</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Collective reporting drives civic improvements across neighborhoods.
                See the power of community engagement in action.
              </p>
            </div>

            <div className="card card-hover group p-6 text-center">
              <div className="icon-wrapper-warm group-hover:scale-110 transition-transform duration-300 mb-4 mx-auto">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Transparency</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Citizens receive acknowledgment & resolution proof.
                Complete visibility into civic issue resolution process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-alt">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-3xl font-bold mb-6 leading-tight text-gradient-primary drop-shadow-lg">
              How It Works
            </h2>
            <p className="text-xl md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Getting started with CivicSync is simple and straightforward.
              Follow these three easy steps to begin improving your community.
            </p>
            <div className="divider mt-8"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl group-hover:scale-110 transition-transform duration-300 group-hover:shadow-2xl">
                  <Camera className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">Report an Issue</h3>
              <p className="text-slate-600 leading-relaxed">
                Take a photo, add details, auto-location. Report potholes, broken lights, trash, and more instantly.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl group-hover:scale-110 transition-transform duration-300 group-hover:shadow-2xl">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">Track Progress</h3>
              <p className="text-slate-600 leading-relaxed">
                Get notified as staff update status. Follow your issue from submitted to in-progress to resolved.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center mx-auto text-white shadow-xl group-hover:scale-110 transition-transform duration-300 group-hover:shadow-2xl">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">See It Resolved</h3>
              <p className="text-slate-600 leading-relaxed">
                Issue marked resolved by authorities with verification photos. Your community is now improved!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-3xl font-bold mb-6 leading-tight text-gradient-primary drop-shadow-lg">
              What Our Users Say
            </h2>
            <p className="text-xl md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of satisfied citizens and officials who have improved their communities with CivicSync.
            </p>
            <div className="divider mt-8"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="testimonial-card">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="testimonial-quote">
                "I reported a pothole and it was fixed in 2 days. So simple!"
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">C</div>
                <div>
                  <div className="testimonial-name">Citizen</div>
                  <div className="testimonial-role">Community Member</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="testimonial-quote">
                "CivicSync helped us respond faster and stay organized."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">M</div>
                <div>
                  <div className="testimonial-name">Municipal Worker</div>
                  <div className="testimonial-role">City Official</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="testimonial-quote">
                "Finally, a transparent way to track civic improvements."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">S</div>
                <div>
                  <div className="testimonial-name">Student</div>
                  <div className="testimonial-role">Young Citizen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your City?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join citizens and officials building smarter, cleaner, and more connected communities with CivicSync.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <button className="btn border-2 border-blue-600/30 bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-strong w-full sm:w-48 inline-flex items-center justify-center whitespace-nowrap">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
              </button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <button className="btn border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm w-full sm:w-48">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gradient-primary">CivicSync</h3>
              <p className="text-slate-300 leading-relaxed">
                Helping communities improve through civic issue reporting and resolution.
                Transform your city, one issue at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-slate-300">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 CivicSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}







