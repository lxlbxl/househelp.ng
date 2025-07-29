'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Shield, 
  Clock, 
  Users, 
  Star, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Heart,
  Award,
  MapPin,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Working Mother",
      content: "HouseHelp connected me with Maria, who has been incredible with my children. The verification process gave me complete peace of mind.",
      rating: 5,
      location: "Lagos"
    },
    {
      name: "David Okafor",
      role: "Business Executive",
      content: "Finding reliable domestic help used to be so stressful. HouseHelp made it simple and secure. Highly recommend!",
      rating: 5,
      location: "Abuja"
    },
    {
      name: "Grace Adebayo",
      role: "Elderly Care Seeker",
      content: "The helper we found through HouseHelp has been a blessing for our family. Professional, caring, and trustworthy.",
      rating: 5,
      location: "Port Harcourt"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Nigeria's #1 Domestic Help Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                Domestic Helper
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect with verified, trusted domestic helpers for cleaning, childcare, elderly care, 
              and more. Safe, reliable, and tailored to your needs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary text-black font-semibold px-8 py-4 text-lg hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/register">
                  Find a Helper
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                asChild 
                className="border-primary/30 text-white hover:bg-primary/10 px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/register?type=helper">
                  Become a Helper
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
              <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Shield className="h-12 w-12 text-primary" />
                <h3 className="text-lg font-semibold text-white">Verified Staff</h3>
                <p className="text-gray-300 text-center">100% Background Checked</p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Clock className="h-12 w-12 text-secondary" />
                <h3 className="text-lg font-semibold text-white">Quick Matching</h3>
                <p className="text-gray-300 text-center">Find help in 48 hours</p>
              </div>
              <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Users className="h-12 w-12 text-primary" />
                <h3 className="text-lg font-semibold text-white">24/7 Support</h3>
                <p className="text-gray-300 text-center">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 mb-4">
              Simply Amazing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our platform makes finding and hiring domestic help simple, secure, and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Tell us about your household needs, preferences, and requirements.",
                icon: Users,
                color: "from-primary to-secondary"
              },
              {
                step: "02", 
                title: "Get Matched",
                description: "Our algorithm connects you with verified helpers that match your criteria.",
                icon: Heart,
                color: "from-secondary to-primary"
              },
              {
                step: "03",
                title: "Start Working",
                description: "Interview, hire, and begin working with your perfect domestic helper.",
                icon: Award,
                color: "from-primary to-secondary"
              }
            ].map((feature, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-black" />
                  </div>
                  <div className="text-6xl font-bold text-primary/20 mb-2">{feature.step}</div>
                  <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 mb-4">
              Complete Solutions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Services</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From house cleaning to specialized care, we connect you with skilled professionals for every household need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "House Cleaning", description: "Professional cleaning services for your home", icon: "🏠" },
              { name: "Childcare", description: "Trusted caregivers for your children", icon: "👶" },
              { name: "Elderly Care", description: "Compassionate care for senior family members", icon: "👴" },
              { name: "Cooking", description: "Skilled cooks for delicious home meals", icon: "👨‍🍳" },
              { name: "Laundry", description: "Professional laundry and garment care", icon: "👕" },
              { name: "Pet Care", description: "Loving care for your furry friends", icon: "🐕" }
            ].map((service, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{service.name}</h3>
                  <p className="text-gray-300">{service.description}</p>
                  <ChevronRight className="h-5 w-5 text-primary mt-4 group-hover:translate-x-2 transition-transform duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 mb-4">
              Happy Customers
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Our <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Users Say</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8">
              <CardContent className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-primary fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-white mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="space-y-2">
                  <p className="font-semibold text-primary text-lg">
                    {testimonials[currentTestimonial].name}
                  </p>
                  <p className="text-gray-300">
                    {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Find Your
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Perfect Helper?
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of satisfied households who have found reliable domestic help through our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary text-black font-semibold px-8 py-4 text-lg hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/register">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}