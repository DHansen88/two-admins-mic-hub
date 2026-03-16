import { useState, useRef, useMemo, useSyncExternalStore } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getProducts,
  getReviews,
  getAvgRating,
  addReview,
  subscribeProducts,
  subscribeReviews,
  type Product,
  type Review,
} from "@/data/merchData";
import { Button } from "@/components/ui/button";
import { Star, Minus, Plus, ChevronLeft, ShoppingCart } from "lucide-react";

/* ── Star helpers ── */
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
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Subscribe to store changes
  const product = useSyncExternalStore(
    subscribeProducts,
    () => getProductBySlug(slug || ""),
    () => getProductBySlug(slug || "")
  );
  const reviews = useSyncExternalStore(
    subscribeReviews,
    () => (product ? getApprovedReviewsForProduct(product.id) : []),
    () => []
  );
  const ratingInfo = product ? getAvgRating(product.id) : { avg: 0, count: 0 };

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [lastSubmit, setLastSubmit] = useState(0);
  const [submitError, setSubmitError] = useState("");

  // Default size on mount
  useState(() => {
    if (product?.sizes?.[2]) setSelectedSize(product.sizes[2]);
  });

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-display font-bold text-foreground">Product Not Found</h1>
            <Link to="/merch" className="text-accent hover:underline">← Back to Merch</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const maxQty = product.stock;

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePurchase = () => {
    if (product.paypalLink) {
      window.open(product.paypalLink, "_blank");
      return;
    }
    setPurchasing(true);
    setTimeout(() => navigate("/merch/thank-you"), 1500);
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
    addReview({
      productId: product.id,
      name: reviewName.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toISOString().split("T")[0],
    });
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
              <Link to="/merch" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-8 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Merch
              </Link>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-square bg-muted/20 rounded-2xl overflow-hidden border border-border">
                    <img
                      src={product.images[selectedImage]?.src || "/placeholder.svg"}
                      alt={product.images[selectedImage]?.alt || product.name}
                      className="w-full h-full object-contain p-8"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-3">
                      {product.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                            selectedImage === i ? "border-accent" : "border-border hover:border-accent/50"
                          }`}
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
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                      product.badge === "Popular" || product.badge === "Featured"
                        ? "bg-coral text-coral-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {product.badge}
                    </span>
                  )}

                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{product.name}</h1>

                  {/* Rating — clickable */}
                  <button onClick={scrollToReviews} className="flex items-center gap-2 group cursor-pointer">
                    <Stars rating={ratingInfo.avg} size="h-5 w-5" />
                    <span className="text-sm text-muted-foreground group-hover:text-accent transition-colors">
                      {ratingInfo.avg.toFixed(1)} ({ratingInfo.count} review{ratingInfo.count !== 1 && "s"})
                    </span>
                  </button>

                  <p className="text-2xl font-bold text-foreground">${product.price}</p>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                  {/* Size Selector */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground uppercase tracking-wide">Size</label>
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

                  {/* Quantity Selector — stock-aware */}
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Quantity</label>
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted/60 hover:border-accent/50 active:scale-95 transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[24px] text-center text-lg font-semibold text-foreground select-none">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                        disabled={quantity >= maxQty}
                        className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-muted/60 hover:border-accent/50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {maxQty <= 10 && maxQty > 0 && (
                      <p className="text-xs text-coral">Only {maxQty} left in stock</p>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <div className="space-y-3 pt-2">
                    <Button
                      size="lg"
                      className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl"
                      onClick={handlePurchase}
                      disabled={purchasing || outOfStock || (!!product.sizes?.length && !selectedSize)}
                    >
                      {outOfStock ? (
                        "Out of Stock"
                      ) : purchasing ? (
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
        {product.reviewsEnabled && (
          <section ref={reviewsRef} className="py-16 bg-muted/20 border-t border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Customer Reviews</h2>
                  <div className="flex items-center gap-3">
                    <Stars rating={ratingInfo.avg} size="h-5 w-5" />
                    <span className="text-lg font-semibold text-foreground">{ratingInfo.avg.toFixed(1)}</span>
                    <span className="text-muted-foreground">average rating ({ratingInfo.count} review{ratingInfo.count !== 1 && "s"})</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No reviews yet. Be the first!</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-card rounded-xl border border-border p-6 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Stars rating={review.rating} />
                            <span className="font-semibold text-foreground">{review.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">"{review.text}"</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-5">
                  <h3 className="text-xl font-display font-bold text-foreground">Leave a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Name</label>
                      <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Jane D." maxLength={50} className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Rating</label>
                      <StarPicker value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Your Review</label>
                      <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your thoughts..." rows={4} maxLength={500} className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all resize-none" />
                    </div>
                    {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                    <Button type="submit" className="h-11 px-8 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                      Submit Review
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
