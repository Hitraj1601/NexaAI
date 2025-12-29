import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  PenTool,
  FileText,
  Image,
  Scissors,
  FileCheck,
  Sparkles,
  Shield,
  Clock,
  Users,
  Star,
  Check,
  ArrowRight,
  Mail
} from 'lucide-react';
import heroImage from '@/assets/hero--my-bg.jpg';

const LandingPage = () => {
  const features = [
    {
      icon: PenTool,
      title: 'AI Article Writer',
      description: 'Generate high-quality articles and blog posts with advanced AI that understands your topic and audience.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: FileText,
      title: 'Smart Title Generator',
      description: 'Create compelling, SEO-optimized titles that capture attention and drive engagement.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Image,
      title: 'AI Image Creator',
      description: 'Transform your ideas into stunning visuals with our state-of-the-art image generation technology.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Scissors,
      title: 'Background Remover',
      description: 'Remove backgrounds from images instantly with precision AI that preserves every detail.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: FileCheck,
      title: 'Resume Reviewer',
      description: 'Get expert AI feedback on your resume with actionable suggestions for improvement.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Sparkles,
      title: 'Smart Automation',
      description: 'Automate repetitive tasks and streamline your workflow with intelligent AI assistance.',
      gradient: 'from-teal-500 to-blue-500',
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Save 10+ Hours Weekly',
      description: 'Automate content creation and focus on what matters most to your business.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Your data is protected with bank-level encryption and privacy controls.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with shared workspaces and real-time collaboration.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Manager',
      company: 'TechCorp',
      content: 'NexaAI has transformed our content workflow. We\'re creating 3x more content with the same team size.',
      rating: 5,
    },
    {
      name: 'David Rodriguez',
      role: 'Marketing Director',
      company: 'StartupFlow',
      content: 'The AI article writer produces content that\'s indistinguishable from our best human writers.',
      rating: 5,
    },
    {
      name: 'Emily Johnson',
      role: 'Freelance Designer',
      company: 'Independent',
      content: 'Background removal and image generation tools are incredible. They\'ve doubled my productivity.',
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for individuals getting started',
      features: [
        '5 AI articles per month',
        '10 title generations',
        '5 image generations',
        'Basic support',
        'Community access',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For professionals and growing teams',
      features: [
        'Unlimited AI articles',
        'Unlimited title generations',
        '100 image generations',
        'Priority support',
        'Advanced features',
        'Team collaboration',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large teams and organizations',
      features: [
        'Everything in Pro',
        'Unlimited everything',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom training',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="AI Hero Background"
            className="w-[100vw] h-[100vh] object-cover fixed top-0 left-0 opacity-20 dark:opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/85 via-background/75 to-primary/5 dark:from-background/70 dark:via-background/50 dark:to-primary/10" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary-dark bg-clip-text text-transparent dark:from-white dark:via-primary-light dark:to-accent">
              Transform Your Workflow with
              <span className="block">AI-Powered Tools</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 dark:text-muted-foreground mb-8 max-w-3xl mx-auto font-medium">
              Create articles, generate images, remove backgrounds, and boost productivity
              with our comprehensive suite of AI tools designed for modern professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/article-writer">
                <Button size="lg" className="gradient-primary hover-glow text-lg px-8 py-6">
                  Start Creating <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/40 hover:bg-primary/10 bg-background/80 dark:border-primary/30 dark:hover:bg-primary/10">
                  Try Demo
                </Button>
              </Link>
            </div>
            <p className="text-foreground/70 dark:text-muted-foreground font-medium">
              No credit card required • Free tier available • 14-day money-back guarantee
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful AI Tools for Every Need</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover a comprehensive suite of AI-powered tools designed to streamline
              your workflow and boost creativity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-lift glass border-border/20 hover:border-primary/30 transition-smooth">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose NexaAI?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of professionals who trust NexaAI for their daily workflows
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Professionals Worldwide</h2>
            <p className="text-xl text-muted-foreground">
              See what our users have to say about their experience with NexaAI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="glass border-border/20">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your needs. Upgrade or downgrade at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative hover-lift transition-smooth ${plan.popular
                    ? 'border-primary shadow-glow'
                    : 'glass border-border/20'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-success mr-3" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular
                        ? 'gradient-primary hover-glow'
                        : 'variant-outline'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of professionals who use NexaAI to create better content faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/article-writer">
              <Button size="lg" className="gradient-primary hover-glow text-lg px-8 py-6">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="contact" className="py-16 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-muted-foreground mb-8">
            Get the latest AI tools, tips, and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1"
            />
            <Button className="gradient-primary">
              <Mail className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;