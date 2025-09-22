import { Header } from "../components/ui/header";
import { Hero } from "../components/ui/hero";
import { WhyChooseUs } from "../components/ui/why-choose-us";
import { ThemeProvider } from "../components/ui/theme-provider";
import { Button } from "../components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import Footer from "../components/ui/footer";
import LogoStrip from "../components/ui/logo-strip";
import { ComponentLoading } from "../components/ui/loading";
import { lazy, Suspense, useEffect } from "react";
import { useToast } from '@/components/ui/use-toast';

// Lazy load heavy components for better initial load
const TrustedByCompanies = lazy(() => import("../components/ui/trusted-by-companies").then(module => ({ default: module.TrustedByCompanies })));
// Ensure the file exists at the specified path, or update the path if necessary
const HowHelpingCompanies = lazy(() => import("../components/ui/how-helping-companies"));
const CustomerCarousel = lazy(() => import("../components/ui/customer-carousel"));
const RetailTransformation = lazy(() => import("../components/ui/retail-transformation"));

// Beautiful loading fallback for sections
const SectionLoadingFallback = ({ message }: { message?: string }) => (
  <ComponentLoading message={message} />
);

export default function Index() {
  const { toast } = useToast();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (localStorage.getItem('manacle_session') === 'true' && params.get('new') === '1') {
      toast({ title: 'Thank you!', description: 'You are now signed in.' });
      params.delete('new');
      const url = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', url);
    }
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="manacle_theme">
      <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden">
        <Header />
        <main className="pt-4 sm:pt-6">
          <Hero />

          {/* Logo Strip Component */}
          <LogoStrip />

          {/* Retail Transformation Section */}
          <Suspense fallback={<SectionLoadingFallback message="Loading transformation insights..." />}>
            <RetailTransformation />
          </Suspense>

          <WhyChooseUs />

          {/* Company Insights Section */}
          <Suspense fallback={<SectionLoadingFallback message="Loading company insights..." />}>
            <HowHelpingCompanies />
          </Suspense>

          {/* Trusted Companies & Customer Stories */}
          <Suspense fallback={<SectionLoadingFallback message="Loading trusted companies..." />}>
            <TrustedByCompanies />
          </Suspense>

          <Suspense fallback={<SectionLoadingFallback message="Loading customer stories..." />}>
            <CustomerCarousel />
          </Suspense>
          {/* Website Builder CTA Section */}
          {/* <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl floating-animation"></div>
              <div
                className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl floating-animation"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
              <AuthWebsiteBuilderCTA />
              <Button
                className="px-6 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-accent to-primary hover:from-primary hover:to-accent transition-all duration-300 text-base sm:text-lg w-full sm:w-auto mt-6"
                onClick={() => window.location.href = '/contact-us'}
              >
                Learn More
              </Button>
            </div>
          </section> */}
          {/* Magical CTA Section with links to About and Contact pages */}
          <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden cv-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-2">
                  Discover More About <span className="bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">Manacle</span>
                </h2>
                <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto px-2 leading-relaxed">
                  Learn about our story or get in touch with us to start your project.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 max-w-md sm:max-w-none mx-auto px-2">
                <Button
                  className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                  onClick={() => window.location.href = '/about-us'}
                >
                  About Us
                </Button>
                <Button
                  className="px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
                  onClick={() => window.location.href = '/contact-us'}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </section>
          {/* Magical CTA Section */}
          {/* <MagicalCTA /> */}
        </main>
        {/* Footer */}
        <Footer />
        {/* Floating Action Buttons */}
        {/* WhatsApp for Desktop */}
        <a
          href="https://wa.me/919873250200"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 hidden md:flex w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </a>
        {/* Phone Call for Mobile */}
        <a
          href="tel:+919873250200"
          className="fixed bottom-6 right-6 z-50 flex md:hidden w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label="Call us"
        >
          <Phone className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </a>
      </div>
    </ThemeProvider>
  );
}
