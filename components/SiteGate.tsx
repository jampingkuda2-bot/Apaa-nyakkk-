"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntroGate from "./IntroGate";
import ReactionConsent from "./ReactionConsent";
import ReactionRecorder from "./ReactionRecorder";
import BirthdayPopup from "./BirthdayPopup";
import Experience from "./Experience";
import { SiteConfig } from "@/lib/types";

type Phase = "intro" | "consent" | "revealed";

export default function SiteGate({ config }: { config: SiteConfig }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [recordReaction, setRecordReaction] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  function reveal() {
    setPhase("revealed");
    setShowPopup(true);
  }

  function handleGateOpened() {
    fetch("/api/notify/visit", { method: "POST" }).catch(() => {});
    setPhase("consent");
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <IntroGate
            key="intro"
            recipientName={config.recipientName}
            onOpen={handleGateOpened}
          />
        )}

        {phase === "consent" && (
          <ReactionConsent
            key="consent"
            onAccept={() => {
              setRecordReaction(true);
              reveal();
            }}
            onDecline={() => {
              setRecordReaction(false);
              reveal();
            }}
          />
        )}

        {phase === "revealed" && (
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

      {recordReaction && phase === "revealed" && <ReactionRecorder />}

      <AnimatePresence>
        {showPopup && (
          <BirthdayPopup
            recipientName={config.recipientName}
            onClose={() => setShowPopup(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
