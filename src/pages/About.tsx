import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Users, Target, Heart } from "lucide-react";
const About = () => {
  return <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-slate via-navy to-deep-blue">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-background">
                About Two Admins & a Mic
              </h1>
              <p className="text-xl md:text-2xl text-background/80 leading-relaxed">
                Empowering leaders through authentic conversations on administration, 
                leadership, and professional growth.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-4xl font-display font-bold text-foreground text-center">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Two Admins & a Mic was born from a simple idea: leadership conversations should be 
                  accessible, practical, and empowering. We believe that great leaders aren't born – 
                  they're developed through continuous learning, reflection, and community.
                </p>
                <p>
                  Our podcast brings together experienced administrators and thought leaders to share 
                  real-world insights, proven strategies, and honest conversations about the challenges 
                  and triumphs of modern leadership.
                </p>
                <p>
                  Whether you're a seasoned executive or just starting your leadership journey, our 
                  episodes are designed to provide actionable takeaways that you can implement immediately 
                  in your role. We keep it friendly, professional, and always focused on empowering you 
                  to be the best leader you can be.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h2 className="text-4xl font-display font-bold text-foreground">
                In Partnership With ConantLeadership
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">We're proud to partner with ConantLeadership. ConantLeadership is a mission-driven community of leaders and learners who are championing leadership that works in the 21st century. </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>;
};
export default About;