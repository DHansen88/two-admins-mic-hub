import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Terms of Service | Two Admins & a Mic";
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-12">Last updated: March 31, 2026</p>

          <div className="prose prose-lg max-w-none text-foreground/90 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using the Two Admins &amp; a Mic website ("Site"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our Site.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Service</h2>
              <p>Two Admins &amp; a Mic is a podcast and creator platform dedicated to empowering administrative professionals. Our services include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Podcast episodes and related media content</li>
                <li>Blog articles and educational resources</li>
                <li>Newsletter subscriptions via email</li>
                <li>Merchandise sales</li>
                <li>Community engagement and professional development content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. User Responsibilities</h2>
              <p>When using our Site, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate information when subscribing to our newsletter or making purchases</li>
                <li>Use the Site only for lawful purposes</li>
                <li>Not attempt to interfere with the Site's functionality or security</li>
                <li>Not reproduce, distribute, or modify our content without express written permission</li>
                <li>Not use automated systems to access the Site without our consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Intellectual Property</h2>
              <p>All content on this Site — including but not limited to podcast episodes, blog posts, graphics, logos, audio recordings, and text — is the property of Two Admins &amp; a Mic and is protected by U.S. and international copyright, trademark, and intellectual property laws.</p>
              <p>You may not reproduce, distribute, modify, or create derivative works from our content without prior written authorization.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Merchandise Purchases</h2>
              <p>When purchasing merchandise through our Site:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All prices are listed in U.S. dollars unless otherwise stated</li>
                <li>Payment is processed securely through Stripe</li>
                <li>We reserve the right to refuse or cancel orders at our discretion</li>
                <li>Shipping times and costs will be communicated at checkout</li>
                <li>Returns and exchanges are handled on a case-by-case basis — please contact us for assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Newsletter Subscriptions</h2>
              <p>By subscribing to our newsletter, you consent to receive periodic emails from Two Admins &amp; a Mic. Our newsletters are delivered through Beehiiv. You may unsubscribe at any time using the link provided in each email.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Third-Party Links</h2>
              <p>Our Site may contain links to third-party websites, including podcast platforms, social media, and partner sites. We are not responsible for the content, privacy practices, or terms of these external sites. Accessing third-party links is at your own risk.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Disclaimer of Warranties</h2>
              <p>The Site and its content are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Site will be uninterrupted, error-free, or free of harmful components.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, Two Admins &amp; a Mic shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Site, including but not limited to loss of data, revenue, or profits.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Indemnification</h2>
              <p>You agree to indemnify and hold harmless Two Admins &amp; a Mic, its owners, and affiliates from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Site or violation of these Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law</h2>
              <p>These Terms of Service shall be governed by and construed in accordance with the laws of the United States. Any disputes shall be resolved in the appropriate courts within the United States.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">12. Changes to These Terms</h2>
              <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. Your continued use of the Site constitutes acceptance of any updated terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">13. Contact Us</h2>
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <div className="bg-muted/50 rounded-lg p-6 mt-4">
                <p className="font-semibold">Two Admins &amp; a Mic</p>
                <p>Email: <a href="mailto:info@twoadminsandamic.com" className="text-primary hover:underline">info@twoadminsandamic.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;
