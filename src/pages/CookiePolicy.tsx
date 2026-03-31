import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";

const CookiePolicy = () => {
  useEffect(() => {
    document.title = "Cookie Policy | Two Admins & a Mic";
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: March 31, 2026</p>

          <div className="prose prose-lg max-w-none text-foreground/90 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They help websites function properly, remember your preferences, and provide analytics data to website owners.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. How We Use Cookies</h2>
              <p>Two Admins &amp; a Mic uses cookies and similar tracking technologies for the following purposes:</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Essential Cookies</h3>
              <p>These cookies are necessary for the website to function and cannot be disabled. They include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Session management and site functionality</li>
                <li>Cookie consent preferences</li>
                <li>Security and fraud prevention</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Analytics Cookies</h3>
              <p>We use <strong>Google Analytics</strong> to understand how visitors interact with our website. These cookies collect information such as:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pages visited and time spent on each page</li>
                <li>Traffic sources and referral data</li>
                <li>Device type, browser, and operating system</li>
                <li>Geographic location (country/region level)</li>
              </ul>
              <p>Google Analytics data is anonymized and used solely to improve our content and user experience.</p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Functional Cookies</h3>
              <p>These cookies enable enhanced functionality including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remembering your preferences and settings</li>
                <li>Newsletter popup display preferences (via Beehiiv)</li>
                <li>Embedded podcast player functionality</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Third-Party Cookies</h3>
              <p>Some cookies are set by third-party services we integrate with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Beehiiv</strong> — for newsletter subscription forms and tracking</li>
                <li><strong>Stripe</strong> — for secure payment processing when purchasing merchandise</li>
                <li><strong>Google Analytics</strong> — for website analytics and performance tracking</li>
                <li><strong>Podcast platforms</strong> — embedded media players may set their own cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Managing Your Cookie Preferences</h2>
              <p>You have several options for managing cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Browser settings</strong> — Most browsers allow you to block or delete cookies through their settings</li>
                <li><strong>Cookie consent banner</strong> — Use our on-site consent banner to accept or decline non-essential cookies</li>
                <li><strong>Google Analytics opt-out</strong> — Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
              </ul>
              <p className="mt-4">Please note that disabling certain cookies may affect the functionality of our website.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Your Rights</h2>
              <p>Under CCPA and GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Know what cookies and tracking technologies are in use</li>
                <li>Opt out of non-essential cookies</li>
                <li>Request deletion of data collected through cookies</li>
                <li>Withdraw your consent at any time</li>
              </ul>
              <p>For more details, see our <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Changes to This Policy</h2>
              <p>We may update this Cookie Policy periodically to reflect changes in technology or legal requirements. The "Last updated" date at the top of this page indicates when the latest revision was made.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Contact Us</h2>
              <p>If you have any questions about our use of cookies, please contact us:</p>
              <div className="bg-muted/50 rounded-lg p-6 mt-4">
                <p className="font-semibold">Two Admins &amp; a Mic</p>
                <p>Email: <a href="mailto:info@twoadminsandamic.com" className="text-primary hover:underline">info@twoadminsandamic.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </>
  );
};

export default CookiePolicy;
