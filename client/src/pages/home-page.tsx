import Hero from "@/components/home/Hero";
import BatteryAssistant from "@/components/home/BatteryAssistant";
import ProductCategories from "@/components/home/ProductCategories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Benefits from "@/components/home/Benefits";
import CTA from "@/components/home/CTA";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>PowerMaster Enterprises - Car & Inverter Batteries</title>
        <meta name="description" content="Premium car and inverter batteries with expert guidance, warranty, and doorstep delivery services." />
      </Helmet>
      <div>
        <Hero />
        <BatteryAssistant />
        {/* <ProductCategories /> */}
        <FeaturedProducts />
        <Benefits />
        <CTA />
      </div>
    </>
  );
}
