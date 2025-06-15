import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, BarChart, Wand2, ArrowRight, Check, Facebook, Instagram } from "lucide-react"; // Thêm icon Facebook, Instagram
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// A simple component for the header of the landing page
function LandingHeader() {
    return (
        <header className="absolute top-0 left-0 w-full p-4 z-10">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold text-white tracking-wider">
                    SEO-Boost AI
                </div>
                <Link href="/login">
                    <Button
                        variant="secondary"
                        className="bg-white text-gray-900 font-semibold hover:bg-gray-800 hover:text-white transition-colors duration-300"
                    >
                        Sign In
                    </Button>
                </Link>
            </div>
        </header>
    );
}

// A simple component for the page footer
function LandingFooter() {
    return (
        <footer className="w-full bg-gray-900 text-gray-400 py-8">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} SEO-Boost AI. All Rights Reserved.</p>

                <div className="flex justify-center gap-6 mb-4" style={{ paddingTop: '10px' }}>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white transition-colors">
                        <Facebook className="h-6 w-6" />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
                        <Instagram className="h-6 w-6" />
                    </a>
                </div>

                <div className="flex justify-center gap-4 mt-4">
                    <a href="#" className="hover:text-white">Privacy Policy</a>
                    <a href="#" className="hover:text-white">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}

// The main Landing Page component
export default function LandingPage() {
    const features = [
        {
            icon: <Search className="h-8 w-8 text-primary" />,
            title: "In-Depth SEO Audits",
            description: "Analyze your website's technical and on-page SEO to find critical errors and opportunities."
        },
        {
            icon: <BarChart className="h-8 w-8 text-primary" />,
            title: "Advanced Keyword Analysis",
            description: "Discover high-volume, low-competition keywords to dominate search rankings."
        },
        {
            icon: <Wand2 className="h-8 w-8 text-primary" />,
            title: "AI-Powered Content Optimization",
            description: "Enhance your content with AI suggestions to improve readability, engagement, and SEO score."
        },
    ];

    return (
        <div className="bg-black text-white">
            <LandingHeader />

            {/* Hero Section with Video Background */}
            <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-0"></div>
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 z-[-1]"
                >
                    {/* You can find free videos at sites like coverr.co */}
                    <source src="https://videos.pexels.com/video-files/3254012/3254012-hd_1920_1080_25fps.mp4" type="video/mp4" />
                </video>
                <div className="z-10 p-4 animate-in fade-in duration-1000">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Unlock Your Website's Full Potential
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
                        Leverage the power of AI to analyze, optimize, and dominate the search rankings.
                        SEO-Boost AI is your all-in-one platform for digital success.
                    </p>
                    <div className="mt-10">
                        <Link href="/login">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-lg">
                                Get Started For Free
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">Everything You Need to Succeed</h2>
                        <p className="mt-4 text-lg text-gray-400">One platform, all the powerful SEO tools.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} className="bg-gray-900 border-gray-800 text-center p-6">
                                <CardHeader>
                                    <div className="mx-auto bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="mt-4 text-white">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-400">
                                    {feature.description}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
}