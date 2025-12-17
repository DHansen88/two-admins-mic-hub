import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestEpisodes from "@/components/LatestEpisodes";
import LatestBlogs from "@/components/LatestBlogs";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <LatestEpisodes />
        <LatestBlogs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
