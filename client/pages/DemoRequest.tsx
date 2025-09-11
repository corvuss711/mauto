import { DemoRequestForm } from "../components/ui/demo-request-form";
import { Header } from "../components/ui/header";
import Footer from "../components/ui/footer";
import { ThemeProvider } from "../components/ui/theme-provider";

export default function DemoRequest() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="manacle_theme">
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                <Header />
                <main className="pt-20 md:pt-24 lg:pt-28 pb-8">
                    <DemoRequestForm />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}
