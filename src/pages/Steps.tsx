import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Steps = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <h1 className="text-4xl font-bold text-foreground mb-6">Steps</h1>
        <p className="text-muted-foreground text-lg">Coming soon.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Steps;
