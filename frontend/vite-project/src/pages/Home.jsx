import React from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Home";
import HowItWorks from "../components/Howitworks";
import WhyChooseUs from "../components/WhyChooseUs";
import TopProviders from "../components/TopProviders";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyChooseUs />
      <TopProviders />
      <Testimonials />
      <Footer />
    </>
  );
}