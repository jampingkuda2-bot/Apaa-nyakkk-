"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntroGate from "./IntroGate";
import Experience from "./Experience";
import { SiteConfig } from "@/lib/types";

export default function SiteGate({ config }: { config: SiteConfig }) {
  const [opened, setOpened] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!opened ? (
        <IntroGate key="intro" recipientName={config.recipientName} onOpen={() => setOpened(true)} />
      ) : (
        <motion.div
          key="experience"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1 }}
        >
          <Experience config={config} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
