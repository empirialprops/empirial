
import Hero from "@/components/hero";
import Partners from "@/components/partners";
import Stats from "@/components/stats";
import Testimonials from "@/components/testimonials";
import Pricing from "@/components/pricing";
import Faq from "@/components/faq";
import Footer from "@/components/footer";
import { motion } from "framer-motion";

export function HomeClient() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background w-full text-foreground transition-colors duration-200 overflow-x-clip">
      {/* Continuous Atmospheric Tilted Blue Light Beam */}
      <div className="absolute top-0 inset-x-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="relative w-full max-w-5xl mx-auto h-full flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
            className="absolute -top-12 sm:-top-20 right-0 sm:right-6 md:right-12 w-20 sm:w-28 md:w-36 h-[2400px] sm:h-[3200px] lg:h-[4000px] bg-gradient-to-b from-[#016fee] from-0% via-[#016fee]/65 via-35% to-transparent to-85% blur-[70px] sm:blur-[85px] rounded-full rotate-[28deg] sm:rotate-[32deg] origin-top will-change-transform opacity-80 dark:opacity-70"
          />
        </div>
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 w-full flex flex-col">
        <Hero />
        <Partners />
        <Pricing />
        <Stats />
        <Testimonials />
        <Faq />
        <Footer />
      </div>
    </div>
  );
}
