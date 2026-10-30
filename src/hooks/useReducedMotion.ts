import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

// Tracks the system "reduce motion" setting. Animations that loop or slide
// are skipped when it is on, so the app stays usable for people sensitive to motion.
export function useReducedMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
