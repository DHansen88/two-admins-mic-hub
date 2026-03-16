import { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductBySlug } from "@/data/merchData";
import { Button } from "@/components/ui/button";
import { Star, Minus, Plus, ChevronLeft, ShoppingCart } from "lucide-react";

/* ── Mock reviews per product ── */
interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

const SEED_REVIEWS: Record<string, Review[]> = {
  "admin-energy-coffee-mug": [
    { id: "r1", name: "Maria S.", rating: 5, text: "Love this mug! Perfect size and the design is so fun.", date: "2025-11-10" },
    { id: "r2", name: "James T.", rating: 4, text: "Great quality ceramic. Keeps my coffee warm.", date: "2025-10-22" },
    { id: "r3", name: "Priya K.", rating: 5, text: "Bought one for every admin on my team — they loved it!", date: "2025-09-15" },
  ],
  "behind-every-leader-tshirt": [
    { id: "r1", name: "Maria S.", rating: 5, text: "Super comfortable shirt and great message!", date: "2025-11-05" },
    { id: "r2", name: "David L.", rating: 4, text: "Nice quality and fits perfectly.", date: "2025-10-18" },
    { id: "r3", name: "Rachel W.", rating: 5, text: "The fabric is so soft. I've already ordered a second one!", date: "2025-09-28" },
  ],
  "two-admins-hoodie": [
    { id: "r1", name: "Carlos M.", rating: 5, text: "Incredibly cozy and the logo looks awesome.", date: "2025-11-12" },
    { id: "r2", name: "Linda B.", rating: 5, text: "Best hoodie I own. Heavyweight and warm.", date: "2025-10-30" },
  ],
  "podcast-logo-sticker-pack": [
    { id: "r1", name: "Aisha N.", rating: 5, text: "So cute! They look great on my laptop.", date: "2025-11-01" },
    { id: "r2", name: "Tom R.", rating: 4, text: "Good variety of stickers. Wish there were a few more.", date: "2025-10-14" },
    { id: "r3", name: "Sophie G.", rating: 5, text: "Perfect little gift for podcast fans.", date: "2025-09-20" },
    { id: "r4", name: "Mike H.", rating: 5, text: "Vibrant colors and great adhesive quality.", date: "2025-08-30" },
  ],
};

/* ── Star rendering helper ── */
const Stars = ({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-border"
        }`}
      />
    ))}
  </div>
);

/* ── Interactive star picker ── */
const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i + 1)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`Rate ${i + 1} star${i > 0 ? "s" : ""}`}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              (hover || value) > i ? "fill-amber-400 text-amber-400" : "text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const product = getProductBySlug(slug || "");
  const reviewsRef = useRef<HTMLDivElement>(null);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    product?.sizes?.[2] ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(
    SEED_REVIEWS[slug || ""] || []
  );
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [lastSubmit, setLastSubmit] = useState(0);
  const [submitError, setSubmitError] = useState("");

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Product Not Found
            </h1>
            <Link to="/merch" className="text-accent hover:underline">
              ← Back to Merch
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : product.rating || 0;

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePurchase = () => {
    setPurchasing(true);
    setTimeout(() => {
      navigate("/merch/thank-you");
    }, 1500);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!reviewName.trim() || !reviewText.trim() || reviewRating === 0) {
      setSubmitError("Please fill in all fields and select a rating.");
      return;
    }

    const now = Date.now();
    if (now - lastSubmit < 60000) {
      setSubmitError("Please wait 60 seconds between submissions.");
      return;
    }

    const newReview: Review = {
      id: `r-${Date.now()}`,
      name: reviewName.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toISOString().split("T")[0],
    };

    setReviews((prev) => [newReview, ...prev]);
    setReviewName("");
    setReviewRating(0);
    setReviewText("");
    setLastSubmit(now);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb */}
              <Link
                to="/merch"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-8 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Merch
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-square bg-muted/20 rounded-2xl overflow-hidden border border-border">
                    <img
                      src={product.images[0].src}
                      alt={product.images[0].alt}
                      className="w-full h-full object-contain p-8"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-3">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          className="w-20 h-20 rounded-lg border-2 border-accent overflow-hidden"
                        >
                          <img src={img.src} alt={img.alt} className="w-full h-full object-contain p-2" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  {product.badge && (
                    <span
                      className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        product.badge === "Popular"
                          ? "bg-coral text-coral-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}

                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                    {product.name}
                  </h1>

                  {/* Rating — clickable to scroll to reviews */}
                  <button
                    onClick={scrollToReviews}
                    className="flex items-center gap-2 group cursor-pointer"
                  >
                    <Stars rating={avgRating} size="h-5 w-5" />
                    <span className="text-sm text-muted-foreground group-hover:text-accent transition-colors">
                      {avgRating.toFixed(1)} ({reviews.length} reviews)
                    </span>
                  </button>

                  <p className="text-2xl font-bold text-foreground">
                    ${product.price}
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>

                  {/* Size Selector */}
                  {product.sizes && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                        Size
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all min-w-[48px] ${
                              selectedSize === size
                                ? "bg-accent text-accent-foreground border-accent"
                                : "bg-card text-foreground border-border hover:border-accent/50"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      Quantity
                    </label>
                    <div className="inline-flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted/60 hover:border-accent/50 active:scale-95 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-semibold text-foreground select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-10 w-10 flex items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted/60 hover:border-accent/50 active:scale-95 transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="space-y-3 pt-2">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                      onClick={handlePurchase}
                      disabled={purchasing || (!!product.sizes && !selectedSize)}
                    >
                      {purchasing ? (
                        <span className="flex items-center gap-2">
                          <span className="h-5 w-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Purchase — ${(product.price * quantity).toFixed(2)}
                        </span>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Secure checkout powered by PayPal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Reviews Section ── */}
        <section ref={reviewsRef} className="py-16 bg-muted/20 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-10">
              {/* Header */}
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Customer Reviews
                </h2>
                <div className="flex items-center gap-3">
                  <Stars rating={avgRating} size="h-5 w-5" />
                  <span className="text-lg font-semibold text-foreground">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    average rating ({reviews.length} review{reviews.length !== 1 && "s"})
                  </span>
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">
                    No reviews yet. Be the first to leave one!
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-card rounded-xl border border-border p-6 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Stars rating={review.rating} />
                          <span className="font-semibold text-foreground">
                            {review.name}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        "{review.text}"
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Form */}
              <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-5">
                <h3 className="text-xl font-display font-bold text-foreground">
                  Leave a Review
                </h3>

                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Jane D."
                      className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Rating
                    </label>
                    <StarPicker value={reviewRating} onChange={setReviewRating} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Your Review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts about this product..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none"
                      maxLength={500}
                    />
                  </div>

                  {submitError && (
                    <p className="text-sm text-destructive">{submitError}</p>
                  )}

                  <Button
                    type="submit"
                    className="h-11 px-8 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                  >
                    Submit Review
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
