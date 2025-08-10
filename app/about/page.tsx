"use client";

import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const About1 = () => {
  const teamMembers = [
    { name: "Aarav", src: "/about1.png", role: "Founder & CEO" },
    { name: "Diya", src: "/about2.png", role: "Lead Guide Coordinator" },
    { name: "Rohan", src: "/about3.png", role: "Tech Lead" },
    { name: "Sneha", src: "/about4.png", role: "Customer Experience" },
  ];

  const stats = [
    { value: "500+", label: "Local Guides" },
    { value: "10K+", label: "Travelers Served" },
    { value: "100+", label: "Destinations" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="lg:w-1/2 space-y-6">
            <Badge variant="outline" className="text-sm font-medium">
              About Us
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight">
              About <span className="text-primary">TravelerConnect</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your ultimate companion for exploring India like never before. Whether you're a solo traveler 
              or a family on vacation, we help you connect with trusted local guides to create memorable 
              experiences.
            </p>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="text-center p-4">
                  <CardTitle className="text-2xl font-bold text-primary">
                    {stat.value}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2">
            <Card>
              <Image
                src="/aboutHome.png"
                alt="Travelers exploring nature"
                width={800}
                height={500}
                className="rounded-lg w-full h-auto"
              />
            </Card>
          </div>
        </section>

        {/* Our Journey Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Our Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">
                TravelerConnect was born out of a passion for travel and a desire to bridge the gap 
                between curious travelers and experienced local guides. Our platform empowers travelers 
                with personalized itineraries and secure booking options, while also supporting local 
                tourism communities across India.
              </p>
              <Separator />
              <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
                {teamMembers.map((member) => (
                  <Card key={member.name} className="text-center p-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={member.src} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Authentic Experiences</h3>
                <p className="text-muted-foreground">
                  Connect travelers with local guides for genuine cultural immersion beyond tourist spots.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Empower Communities</h3>
                <p className="text-muted-foreground">
                  Support local economies by providing guides with fair opportunities to showcase their expertise.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Seamless Planning</h3>
                <p className="text-muted-foreground">
                  Make trip planning effortless with personalized itineraries and secure booking in one platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default About1;