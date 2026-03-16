import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Episodes from "./pages/Episodes";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import EpisodeDetail from "./pages/EpisodeDetail";
import TopicResults from "./pages/TopicResults";
import Steps from "./pages/Steps";
import Merch from "./pages/Merch";
import ProductDetail from "./pages/ProductDetail";
import MerchThankYou from "./pages/MerchThankYou";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PublishEpisode from "./pages/admin/PublishEpisode";
import PublishBlog from "./pages/admin/PublishBlog";
import NewsletterDrafts from "./pages/admin/NewsletterDrafts";
import ContentLibrary from "./pages/admin/ContentLibrary";
import ManageMerch from "./pages/admin/ManageMerch";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/episodes" element={<Episodes />} />
          <Route path="/episodes/:slug" element={<EpisodeDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/topics/:topic" element={<TopicResults />} />
          <Route path="/steps" element={<Steps />} />
          <Route path="/merch" element={<Merch />} />
          <Route path="/merch/thank-you" element={<MerchThankYou />} />
          <Route path="/merch/:slug" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Dashboard */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="publish-episode" element={<PublishEpisode />} />
            <Route path="publish-blog" element={<PublishBlog />} />
            <Route path="newsletters" element={<NewsletterDrafts />} />
            <Route path="library" element={<ContentLibrary />} />
            <Route path="merchandise" element={<ManageMerch />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
