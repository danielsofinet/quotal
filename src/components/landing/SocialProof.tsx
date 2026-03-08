"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  TestimonialsColumn,
  type Testimonial,
} from "@/components/ui/TestimonialsColumn";

const testimonials: Testimonial[] = [
  {
    text: "We used to spend half a day normalizing supplier quotes into a single spreadsheet. Quotal does it in seconds — the time savings alone justified the switch.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    name: "Maria Lindström",
    role: "Procurement Director, Nordvik Industries",
  },
  {
    text: "The hidden fee detection caught a 4% markup we'd been overlooking for months. Paid for itself on the first comparison.",
    name: "James Whitfield",
    role: "VP Supply Chain, Bridgewell Foods",
  },
  {
    text: "Our vendors send quotes in PDFs, Excel, even plain emails. Quotal handles all of them without us reformatting anything.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    name: "Amara Osei",
    role: "Sourcing Manager, Clearpath Logistics",
  },
  {
    text: "I showed the comparison table to our CFO and he immediately asked why we hadn't been doing this all along. Clean, clear, and impossible to argue with.",
    name: "Thomas Berger",
    role: "Head of Purchasing, Vektor Energy",
  },
  {
    text: "We process 200+ RFQs per quarter. The AI normalization means we can actually compare apples to apples across vendors for the first time.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    name: "Sophie Martens",
    role: "Category Manager, Strandholm Group",
  },
  {
    text: "The email forwarding feature is a game-changer. Suppliers send quotes, I forward to Quotal, and it's ready to compare by the time I finish my coffee.",
    name: "David Chen",
    role: "Operations Lead, Apex Manufacturing",
  },
  {
    text: "We switched from a six-figure procurement platform to Quotal. It does the one thing we actually needed — fast, accurate quote comparison.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    name: "Elena Rossi",
    role: "COO, Meridian Supply Co.",
  },
  {
    text: "Line items get matched across vendors automatically. No more manual cross-referencing in spreadsheets. Our team saves 10+ hours a week.",
    name: "Marcus Webb",
    role: "Procurement Analyst, Halcyon Aerospace",
  },
  {
    text: "Simple, fast, and does exactly what it promises. Uploaded three PDFs, got a side-by-side comparison with the best price highlighted. Brilliant.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
    name: "Lena Johansson",
    role: "Buyer, Fjelltind Retail",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function SocialProof() {
  const t = useTranslations("Landing.socialProof");

  return (
    <section className="py-24 md:py-32 px-6 bg-surface border-y border-border relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center justify-center max-w-xl mx-auto mb-12"
        >
          <span className="text-xs uppercase tracking-widest font-medium text-accent-light mb-3">
            {t("label")}
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary text-center">
            {t("title")}
          </h2>
          <p className="text-text-muted text-sm mt-3 text-center">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
}
