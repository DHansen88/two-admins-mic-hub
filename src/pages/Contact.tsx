import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, Send } from "lucide-react";

const PaperAirplaneSVG = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-background"
  >
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22 11 13 2 9z" />
  </svg>
);

const Contact = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate via-navy to-deep-blue relative overflow-hidden">
          {/* Paper airplane animation */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            {/* Dotted wave trail path */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.08]"
              viewBox="0 0 2300 400"
              preserveAspectRatio="none"
            >
              <path
                d="M-200,200 C0,80 200,320 500,200 C800,80 1000,320 1300,200 C1600,80 1800,320 2100,200"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                className="text-background"
              />
            </svg>
            {/* Animated airplane */}
            <div className="airplane-fly opacity-[0.11]">
              <div className="airplane-tilt">
                <PaperAirplaneSVG />
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-background">
                Get In Touch
              </h1>
              <p className="text-xl md:text-2xl text-background/80">
                We'd love to hear from you. Share your thoughts, suggestions, or questions.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                      Let's Connect
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Whether you have feedback on an episode, a topic suggestion, or just want 
                      to say hello, we're here to listen. Your input helps us create better 
                      content for the leadership community.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <Card className="p-6 border-border hover:border-accent transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="bg-teal/10 p-3 rounded-lg">
                          <Mail className="h-6 w-6 text-teal" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground mb-1">Email Us</h3>
                          <p className="text-muted-foreground">hello@twoadminsandamic.com</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border-border hover:border-accent transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="bg-sky-blue/10 p-3 rounded-lg">
                          <MessageSquare className="h-6 w-6 text-sky-blue" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground mb-1">Social Media</h3>
                          <p className="text-muted-foreground">
                            Connect with us on Instagram, Twitter, and LinkedIn
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Contact Form */}
                <Card className="p-8 border-border">
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        className="border-2 focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        className="border-2 focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="Episode feedback, topic suggestion, etc."
                        className="border-2 focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us what's on your mind..."
                        rows={6}
                        className="border-2 focus:border-accent resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-coral-accent hover:bg-coral-accent/90"
                    >
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
