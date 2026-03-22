import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MeetTheHosts from "@/components/MeetTheHosts";
import LatestFromTheShow from "@/components/LatestFromTheShow";

import HomeCTA from "@/components/HomeCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <MeetTheHosts />
        <LatestFromTheShow />
        <BrowseTopics />
        <HomeCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
