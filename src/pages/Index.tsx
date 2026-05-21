import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MeetTheHosts from "@/components/MeetTheHosts";
import LatestFromTheShow from "@/components/LatestFromTheShow";

import HomeCTA from "@/components/HomeCTA";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        title="Two Admins & a Mic — Leadership Podcast for Executive Admins"
        description="Two Admins. One Mic. Zero Fluff. Real conversations on leadership, executive administration, and professional growth from Diana Hansen and Melinda Vail Goodnight."
        path="/"
      />
      <Header />
      <main>
        <Hero />
        <MeetTheHosts />
        <LatestFromTheShow />
        
        <HomeCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
