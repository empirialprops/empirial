
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useState, useEffect } from "react";
import { getPartnerLogos } from "@/lib/firebase/services";

export default function Partners() {
  const verifiedFirms = [
    {
      name: "Alpha Capital",
      logo: "/logos/alpha-capital.png",
      shape: "rounded-md",
      size: "medium",
    },
    {
      name: "CK Capital",
      logo: "/logos/ck-capital.avif",
      shape: "rounded-md",
      size: "medium",
    },
    {
      name: "GTF",
      logo: "/logos/gtf.svg",
      shape: "rounded-md",
      size: "medium",
    },
    {
      name: "NYS Capital",
      logo: "/logos/nys.png",
      shape: "rounded-md",
      size: "medium",
    },
    {
      name: "Pipstone",
      logo: "/logos/pipstone.png",
      shape: "rounded-md",
      size: "medium",
    },
    {
      name: "Shark Funded",
      logo: "/logos/shark-funded.webp",
      shape: "rounded-md",
      size: "medium",
    },
    {
      name: "Sure Leverage Funding",
      logo: "/logos/sure-leverage.jpg",
      shape: "rounded-md",
      size: "medium",
    },
  ];

  const [partners, setPartners] = useState<any[]>(verifiedFirms);
  const [sectionTitle, setSectionTitle] = useState("Verified Firms");

  useEffect(() => {
    async function loadPartners() {
      try {
        const data = await getPartnerLogos();
        if (data && data.length > 0) {
          const mapped = data.map((item) => ({
            name: item.name,
            logo: item.logo || item.logo_url || "/logos/nys.png",
            shape: item.shape || "rounded-md",
            size: item.size || "medium",
          }));
          setPartners(mapped);
        } else {
          setPartners(verifiedFirms);
        }
      } catch (err) {
        console.error("Failed to load partner logos:", err);
        setPartners(verifiedFirms);
      }
    }
    loadPartners();
  }, []);

  const getShapeClass = (shape?: string) => {
    if (shape === "square" || shape === "rounded-none") return "rounded-none";
    if (shape === "rounded-lg") return "rounded-lg";
    return "rounded-md"; // default slightly rounded edges
  };

  const getSizeClass = (size?: string) => {
    if (size === "small") return "h-7 sm:h-8 max-w-[90px]";
    if (size === "large") return "h-10 sm:h-12 max-w-[130px]";
    return "h-8 sm:h-10 max-w-[110px]";
  };

  return (
    <section className="max-w-6xl w-full mx-auto px-4 py-16 sm:py-20 gap-10 md:px-8 flex flex-col justify-center items-center text-center bg-transparent">
      <motion.div
        initial={{ y: 20, opacity: 0, filter: "blur(3px)" }}
        whileInView={{
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, type: "spring", bounce: 0 }}
        className="flex flex-col gap-3"
      >
        <h2 className="text-xl font-semibold sm:text-2xl bg-gradient-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
          {sectionTitle}
        </h2>
      </motion.div>
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-6 sm:gap-8 place-items-center items-center justify-center">
        <TooltipProvider>
          {partners.map((firm, index) => (
            <Tooltip key={firm.name + index}>
              <TooltipTrigger asChild>
                <div className="shrink-0 p-1.5 flex items-center justify-center">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{
                      y: 0,
                      opacity: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.08,
                      type: "spring",
                      bounce: 0,
                    }}
                    className={`flex items-center justify-center overflow-hidden ${getShapeClass(
                      firm.shape
                    )}`}
                  >
                    <img
                      src={firm.logo}
                      alt={`${firm.name} logo`}
                      loading="lazy"
                      className={`w-auto object-contain transition-transform duration-200 hover:scale-105 ${getSizeClass(
                        firm.size
                      )} ${getShapeClass(firm.shape)}`}
                    />
                  </motion.div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-semibold text-xs bg-card border border-border text-foreground">
                {firm.name}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </section>
  );
}
