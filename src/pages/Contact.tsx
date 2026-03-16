import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Send, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const mailto = `mailto:info@twoadminsandamic.com?subject=${encodeURIComponent(subject || "Contact Form Message")}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailto;
    toast({ title: "Opening your email client..." });
  };

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
                          <p className="text-muted-foreground">info@twoadminsandamic.com</p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border-border hover:border-accent transition-colors">
                      <div className="space-y-4">
                        <h3 className="font-bold text-foreground">Connect With Us</h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <a
                            href="https://www.instagram.com/twoadminsamic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-sky-blue/10 p-3 rounded-lg hover:bg-sky-blue/20 transition-colors"
                            aria-label="Instagram"
                          >
                            <svg className="h-5 w-5 text-sky-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                            </svg>
                          </a>
                          <a
                            href="https://x.com/twoadminsamic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-sky-blue/10 p-3 rounded-lg hover:bg-sky-blue/20 transition-colors"
                            aria-label="X / Twitter"
                          >
                            <svg className="h-5 w-5 text-sky-blue" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          </a>
                          <a
                            href="https://www.linkedin.com/groups/17735025"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-sky-blue/10 p-3 rounded-lg hover:bg-sky-blue/20 transition-colors"
                            aria-label="LinkedIn"
                          >
                            <svg className="h-5 w-5 text-sky-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                              <rect width="4" height="12" x="2" y="9" />
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                          </a>
                          <a
                            href="https://linktr.ee/twoadminsandamic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-muted/60 p-3 rounded-lg hover:bg-muted transition-colors group"
                            aria-label="More links on Linktree"
                          >
                            <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <a
                            href="https://linktr.ee/twoadminsandamic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors underline underline-offset-2"
                          >
                            View all our links →
                          </a>
                        </p>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Contact Form */}
                <Card className="p-8 border-border">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Your Name
                      </label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        className="border-2 focus:border-accent"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
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
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
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
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
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
