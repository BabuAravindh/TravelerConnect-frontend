import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Rocket, MessageSquare, CreditCard, ShieldCheck, UserCheck } from "lucide-react";

const services = [
  {
    title: "Local Guide Matching",
    category: "Personalized Travel",
    description: "Get matched with experienced, verified local guides based on your destination and interests — whether you're into food, trekking, or history!",
    icon: <UserCheck className="w-6 h-6 text-primary" />,
  },
  {
    title: "Real-time Chat System",
    category: "Seamless Communication",
    description: "Talk directly with guides to finalize plans, share details, and clarify questions. Plan and personalize your trip with zero miscommunication.",
    icon: <MessageSquare className="w-6 h-6 text-primary" />,
  },
  {
    title: "Booking & Partial Payments",
    category: "Flexible & Transparent",
    description: "Book your guide with ease. Pay in full or split payments — we track all transactions for both users and guides with complete transparency.",
    icon: <CreditCard className="w-6 h-6 text-primary" />,
  },
  {
    title: "Secure Payment via Razorpay",
    category: "Trusted Gateway",
    description: "All payments are processed securely using Razorpay. Users pay the platform, and guides are paid after trip verification.",
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
  },
  {
    title: "Guide Onboarding & Approval",
    category: "Become a Guide",
    description: "Locals can apply to become guides by submitting detailed profiles. Admins review each request to ensure authenticity and quality service.",
    icon: <Rocket className="w-6 h-6 text-primary" />,
  },
];

const Page = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-sm font-medium">
            Our Offerings
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Services That Elevate Your Travel Experience
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            We make travel easier, safer, and more personal. Here's what we offer:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow duration-300 h-full">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-lg">
                  {service.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <Badge variant="secondary" className="mt-2">
                    {service.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
              <CardFooter>
                <Badge variant="outline" className="text-xs">
                  Learn more →
                </Badge>
              </CardFooter>
            </Card>
          ))}

          {/* Call-to-action card */}
          <Card className="border-primary bg-primary/5 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-primary">Ready to Explore?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Discover how TravelerConnect can transform your next adventure.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="default" className="w-full text-center py-2 cursor-pointer">
                Get Started
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;