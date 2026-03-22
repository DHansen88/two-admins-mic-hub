import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Headphones, BookOpen } from "lucide-react";

const HomeCTA = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-slate via-navy to-deep-blue text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            Ready to Level Up?
          </h2>
          <p className="text-background/80 text-lg leading-relaxed">
            Whether you're tuning in on your commute or reading over coffee, we've got the insights
            to help you thrive in your admin career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button asChild size="lg" className="bg-coral-accent hover:bg-coral-accent/90 text-lg px-8 py-6">
              <Link to="/episodes" onClick={() => window.scrollTo(0, 0)}>
                <Headphones className="mr-2 h-5 w-5" />
                Listen to the Podcast
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-2 border-background text-background hover:bg-background hover:text-navy text-lg px-8 py-6">
              <Link to="/blog" onClick={() => window.scrollTo(0, 0)}>
                <BookOpen className="mr-2 h-5 w-5" />
                Explore the Blog
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;
