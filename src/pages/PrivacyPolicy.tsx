import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Two Admins & a Mic";
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: March 31, 2026</p>

          <div className="prose prose-lg max-w-none text-foreground/90 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p>Welcome to Two Admins &amp; a Mic ("we," "us," or "our"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, subscribe to our newsletter, purchase merchandise, or interact with our podcast content.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-foreground mb-2">Personal Information</h3>
              <p>We may collect the following personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Email address</strong> — when you subscribe to our newsletter via Beehiiv</li>
                <li><strong>Name and contact information</strong> — when you reach out through our contact form</li>
                <li><strong>Billing and shipping information</strong> — when you purchase merchandise through Stripe</li>
                <li><strong>Payment details</strong> — processed securely by Stripe (we do not store payment card information)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-2">Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage data</strong> — pages visited, time spent, and interactions via Google Analytics</li>
                <li><strong>Device information</strong> — browser type, operating system, and device identifiers</li>
                <li><strong>IP address</strong> — collected automatically for analytics and security purposes</li>
                <li><strong>Cookies and tracking technologies</strong> — see our <a href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</a> for details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To send newsletters and updates about new episodes, blog posts, and events via <strong>Beehiiv</strong></li>
                <li>To process merchandise orders and payments through <strong>Stripe</strong></li>
                <li>To analyze website traffic and improve our content using <strong>Google Analytics</strong></li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To deliver embedded podcast media and content</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Third-Party Services</h2>
              <p>We use the following third-party services that may collect and process your data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Beehiiv</strong> — email newsletter delivery and subscriber management. <a href="https://www.beehiiv.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Beehiiv Privacy Policy</a></li>
                <li><strong>Stripe</strong> — payment processing for merchandise purchases. <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a></li>
                <li><strong>Google Analytics</strong> — website analytics and traffic reporting. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a></li>
                <li><strong>Podcast hosting platforms</strong> — embedded media players for podcast distribution</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights Under CCPA</h2>
              <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to Know</strong> — You may request details about the personal information we have collected about you</li>
                <li><strong>Right to Delete</strong> — You may request the deletion of your personal information</li>
                <li><strong>Right to Opt-Out</strong> — You may opt out of the sale of your personal information (we do not sell personal data)</li>
                <li><strong>Right to Non-Discrimination</strong> — We will not discriminate against you for exercising your rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Your Rights Under GDPR</h2>
              <p>If you are located in the European Economic Area (EEA), you have additional rights including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Right to access and receive a copy of your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to restrict or object to processing</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Data Retention</h2>
              <p>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Newsletter subscriber data is retained until you unsubscribe. Transaction data is retained as required for accounting and legal purposes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Children's Privacy</h2>
              <p>Our website and services are not directed to children under 13 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected data from a child under 13, we will take steps to delete it promptly.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
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

export default PrivacyPolicy;
