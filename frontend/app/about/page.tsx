"use client";

import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import React from "react";

const About1 = () => {
  return (
    <>
      <Navbar />
      <div className="2xl:container 2xl:mx-auto lg:py-16 lg:px-20 md:py-12 md:px-6 py-9 px-4">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="w-full lg:w-5/12 flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 pb-4">
              About Us
            </h1>
            <p className="font-normal text-base leading-6 text-gray-600">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout. The
              point of using Lorem Ipsum...
            </p>
          </div>
          <div className="w-full lg:w-8/12">
            <Image
              src="https://i.ibb.co/FhgPJt8/Rectangle-116.png"
              alt="A group of People"
              width={800}
              height={500}
              layout="responsive"
              className="rounded-md"
            />
          </div>
        </div>

        <div className="flex lg:flex-row flex-col justify-between gap-8 pt-12">
          <div className="w-full lg:w-5/12 flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-bold leading-9 text-gray-800 pb-4">
              Our Story
            </h1>
            <p className="font-normal text-base leading-6 text-gray-600">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout. The
              point of using Lorem Ipsum...
            </p>
          </div>
          <div className="w-full lg:w-8/12 lg:pt-8">
            <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 lg:gap-4 shadow-lg rounded-md">
              {[
                { name: "Alexa", src: "https://i.ibb.co/FYTKDG6/Rectangle-118-2.png" },
                { name: "Olivia", src: "https://i.ibb.co/fGmxhVy/Rectangle-119.png" },
                { name: "Liam", src: "https://i.ibb.co/Pc6XVVC/Rectangle-120.png" },
                { name: "Elijah", src: "https://i.ibb.co/7nSJPXQ/Rectangle-121.png" },
              ].map((person) => (
                <div key={person.name} className="p-4 pb-6 flex justify-center flex-col items-center">
                  <Image
                    src={person.src}
                    alt={`${person.name} featured`}
                    width={150}
                    height={150}
                    className="rounded-full"
                  />
                  <p className="font-medium text-xl leading-5 text-gray-800 mt-4">{person.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default About1;
