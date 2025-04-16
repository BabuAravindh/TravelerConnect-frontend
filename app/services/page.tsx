import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";

const services = [
  {
    title: "Local Guide Matching",
    category: "Personalized Travel",
    description:
      "Get matched with experienced, verified local guides based on your destination and interests — whether you're into food, trekking, or history!",
  },
  {
    title: "Real-time Chat System",
    category: "Seamless Communication",
    description:
      "Talk directly with guides to finalize plans, share details, and clarify questions. Plan and personalize your trip with zero miscommunication.",
  },
  {
    title: "Booking & Partial Payments",
    category: "Flexible & Transparent",
    description:
      "Book your guide with ease. Pay in full or split payments — we track all transactions for both users and guides with complete transparency.",
  },
  {
    title: "Secure Payment via Razorpay",
    category: "Trusted Gateway",
    description:
      "All payments are processed securely using Razorpay. Users pay the platform, and guides are paid after trip verification.",
  },
  {
    title: "Guide Onboarding & Approval",
    category: "Become a Guide",
    description:
      "Locals can apply to become guides by submitting detailed profiles. Admins review each request to ensure authenticity and quality service.",
  },
];

const ServiceCard = ({
  title,
  category,
  description,
}: {
  title: string;
  category: string;
  description: string;
}) => (
  <div className="relative h-full">
    <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-primary rounded-lg"></span>
    <div className="relative h-full p-5 bg-white border-2 border-primary rounded-lg">
      <h3 className="my-2 ml-3 text-lg font-bold text-gray-800">{title}</h3>
      <p className="mt-3 mb-1 text-xs font-medium text-gray-800 uppercase">
        {category}
      </p>
      <p className="mb-2 text-gray-600">{description}</p>
    </div>
  </div>
);

const Page = () => {
  return (
    <>
      <Navbar />
      <div className="container relative flex flex-col justify-between h-full max-w-6xl px-10 mx-auto xl:px-0 mt-5">
        <h2 className="mb-1 text-3xl font-extrabold leading-tight text-gray-900">
          Services
        </h2>
        <p className="mb-12 text-lg text-gray-500">
          We make travel easier, safer, and more personal. Here's what we offer:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
          {services.map((service, idx) => (
            <ServiceCard
              key={idx}
              title={service.title}
              category={service.category}
              description={service.description}
            />
          ))}

          {/* Placeholder to balance layout (invisible) */}
          {services.length % 2 !== 0 && (
            <div className="invisible">
              <ServiceCard
                title="Placeholder"
                category=""
                description=""
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;
