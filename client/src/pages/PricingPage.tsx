import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft, Zap } from "lucide-react";

// Dữ liệu cho các gói pricing
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with our basic features, completely free.",
    features: [
      "5 SEO Audits per month",
      "10 Keyword Analyses per month",
      "Basic On-Page suggestions",
      "Community support",
    ],
    buttonText: "Your Current Plan",
    isCurrent: true,
  },
  {
    name: "Pro",
    price: "$19",
    description: "Unlock powerful tools for serious SEO professionals.",
    features: [
      "Unlimited SEO Audits",
      "Unlimited Keyword Analyses",
      "AI Content Optimization",
      "Rank Tracking (100 keywords)",
      "Email & Chat support",
    ],
    buttonText: "Upgrade to Pro",
    isCurrent: false,
    isPopular: true,
  },
  {
    name: "Business",
    price: "$49",
    description: "The complete suite for agencies and large teams.",
    features: [
      "All features in Pro",
      "API Access",
      "Team collaboration (5 users)",
      "White-label reports",
      "Dedicated support manager",
    ],
    buttonText: "Contact Sales",
    isCurrent: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Find the Perfect Plan</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that fits your needs and start improving your SEO today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col ${tier.isPopular ? 'border-primary shadow-lg' : ''}`}>
            {tier.isPopular && (
              <div className="py-1 px-3 bg-primary text-primary-foreground text-sm font-semibold rounded-t-lg text-center">
                Most Popular
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" disabled={tier.isCurrent}>
                {tier.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}