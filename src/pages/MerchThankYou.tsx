import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, Headphones } from "lucide-react";

const MerchThankYou = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-secondary/15 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-secondary" />
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                Thank You for Supporting the Show!
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Your purchase helps support the Two Admins &amp; a Mic podcast
                and the incredible community of administrative professionals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="h-12 px-8 rounded-xl">
                  <Link to="/merch">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 rounded-xl"
                >
                  <Link to="/episodes">
                    <Headphones className="h-5 w-5 mr-2" />
                    Return to Podcast
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default MerchThankYou;
