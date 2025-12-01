import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestEpisodes from "@/components/LatestEpisodes";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <LatestEpisodes />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
