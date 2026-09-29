import { Variants, Transition } from "framer-motion";

// Helper to check for user reduced motion preference
export const getReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// 1. fadeUp
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: getReducedMotion() ? 0 : 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: getReducedMotion() ? 0.05 : 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// 2. stagger container
export const stagger = (staggerChildren: number = 0.08): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: getReducedMotion() ? 0 : staggerChildren,
      delayChildren: getReducedMotion() ? 0 : 0.05,
    },
  },
});

// 3. pageTransition
export const pageTransition: Variants = {
  hidden: {
    opacity: 0,
    y: getReducedMotion() ? 0 : 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: getReducedMotion() ? 0.05 : 0.35,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: getReducedMotion() ? 0 : -10,
    transition: {
      duration: getReducedMotion() ? 0.05 : 0.2,
      ease: "easeIn",
    },
  },
};

// 4. layoutSpring
export const layoutSpring: Transition = getReducedMotion()
  ? { duration: 0.05 }
  : {
      type: "spring",
      stiffness: 400,
      damping: 30,
    };

// 5. drawIn (for SVG charts and contours)
export const drawIn: Variants = {
  hidden: {
    pathLength: getReducedMotion() ? 1 : 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: getReducedMotion() ? 0.05 : 1.2,
      ease: "easeInOut",
    },
  },
};

// 6. crossfade
export const crossfade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: getReducedMotion() ? 0.05 : 0.25,
      ease: "easeInOut",
    },
  },
};
