import { Footer } from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";

const Page = () => {
  return (
    <>
    <Navbar/>
    <div className="container relative flex flex-col justify-between h-full max-w-6xl px-10 mx-auto xl:px-0 mt-5">
      <h2 className="mb-1 text-3xl font-extrabold leading-tight text-gray-900">
        Services
      </h2>
      <p className="mb-12 text-lg text-gray-500">
        Here are a few of the awesome services we provide.
      </p>

      <div className="w-full">
        {/* First Row */}
        <div className="flex flex-col w-full mb-10 sm:flex-row">
          <div className="w-full mb-10 sm:mb-0 sm:w-1/2">
            <div className="relative h-full sm:mr-10">
              <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-primary rounded-lg"></span>
              <div className="relative h-full p-5 bg-white border-2 border-primary rounded-lg">
                <h3 className="my-2 ml-3 text-lg font-bold text-gray-800">
                  DAPP Development
                </h3>
                <p className="mt-3 mb-1 text-xs font-medium text-indigo-500 uppercase">
                  ------------
                </p>
                <p className="mb-2 text-gray-600">
                  A decentralized application (dapp) is an application built on
                  a decentralized network that combines a smart contract and a
                  frontend user interface.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2">
            <div className="relative h-full md:mr-10">
              <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-primary rounded-lg"></span>
              <div className="relative h-full p-5 bg-white border-2 border-primary rounded-lg">
                <h3 className="my-2 ml-3 text-lg font-bold text-gray-800">
                  Web 3.0 Development
                </h3>
                <p className="mt-3 mb-1 text-xs font-medium text-gray-800 uppercase">
                  ------------
                </p>
                <p className="mb-2 text-gray-600">
                  Web 3.0 is the third generation of Internet services that will
                  focus on understanding and analyzing data to provide a
                  semantic web.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="flex flex-col w-full mb-5 sm:flex-row">
          <div className="w-full mb-10 sm:mb-0 sm:w-1/2">
            <div className="relative h-full sm:mr-10">
              <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-primary rounded-lg"></span>
              <div className="relative h-full p-5 bg-white border-2 border-primary rounded-lg">
                <h3 className="my-2 ml-3 text-lg font-bold text-gray-800">
                  Project Audit
                </h3>
                <p className="mt-3 mb-1 text-xs font-medium text-gray-800 uppercase">
                  ------------
                </p>
                <p className="mb-2 text-gray-600">
                  A Project Audit is a formal review of a project, which is
                  intended to assess the extent up to which project management
                  standards are being upheld.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full mb-10 sm:mb-0 sm:w-1/2">
            <div className="relative h-full sm:mr-10">
              <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-primary rounded-lg"></span>
              <div className="relative h-full p-5 bg-white border-2 border-primary rounded-lg">
                <h3 className="my-2 ml-3 text-lg font-bold text-gray-800">
                  Hacking / RE
                </h3>
                <p className="mt-3 mb-1 text-xs font-medium text-gray-800 uppercase">
                  ------------
                </p>
                <p className="mb-2 text-gray-800">
                  A security hacker is someone who explores methods for
                  breaching defenses and exploiting weaknesses in a computer
                  system or network.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2">
            <div className="relative h-full md:mr-10">
              <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-primary rounded-lg"></span>
              <div className="relative h-full p-5 bg-white border-2 border-primary rounded-lg">
                <h3 className="my-2 ml-3 text-lg font-bold text-gray-800">
                  Bot/Script Development
                </h3>
                <p className="mt-3 mb-1 text-xs font-medium text-gray-800 uppercase">
                  ------------
                </p>
                <p className="mb-2 text-gray-800">
                  Bot development frameworks were created as advanced software
                  tools that eliminate a large amount of manual work and
                  accelerate the development process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default Page;
