import Svg, { Circle, Line, Rect } from "react-native-svg";

import { brandPalette } from "@/constants/colors";

type AppLogoProps = {
  size?: number;
  cloudColor?: string;
};

// The logo artboard is 64 units square. Sun, cloud and a small Ashoka-chakra
// accent (the India element) are placed in those units.
const SUN = { x: 26, y: 26, r: 10 };
const RAY_INNER = 14;
const RAY_OUTER = 19;
const CHAKRA = { x: 51, y: 13, r: 5 };
const CLOUD = { baseX: 27, baseY: 42, baseWidth: 31, baseHeight: 10 };

const SUN_RAYS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index * Math.PI) / 4;
  return {
    x1: SUN.x + RAY_INNER * Math.cos(angle),
    y1: SUN.y + RAY_INNER * Math.sin(angle),
    x2: SUN.x + RAY_OUTER * Math.cos(angle),
    y2: SUN.y + RAY_OUTER * Math.sin(angle),
  };
});

const CHAKRA_SPOKES = Array.from({ length: 8 }, (_, index) => {
  const angle = (index * Math.PI) / 4;
  return {
    x2: CHAKRA.x + CHAKRA.r * Math.cos(angle),
    y2: CHAKRA.y + CHAKRA.r * Math.sin(angle),
  };
});

export function AppLogo({ size = 64, cloudColor = brandPalette.cloudWhite }: AppLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="IndiaClimate logo">
      <Circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={brandPalette.saffron} />
      {SUN_RAYS.map((ray, index) => (
        <Line
          key={`ray-${index}`}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke={brandPalette.saffron}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      ))}

      <Rect
        x={CLOUD.baseX}
        y={CLOUD.baseY}
        width={CLOUD.baseWidth}
        height={CLOUD.baseHeight}
        rx={CLOUD.baseHeight / 2}
        fill={cloudColor}
      />
      <Circle cx={34} cy={40} r={7} fill={cloudColor} />
      <Circle cx={44} cy={37} r={9} fill={cloudColor} />
      <Circle cx={53} cy={43} r={5} fill={cloudColor} />

      <Circle
        cx={CHAKRA.x}
        cy={CHAKRA.y}
        r={CHAKRA.r}
        stroke={brandPalette.indiaGreen}
        strokeWidth={1.4}
        fill="none"
      />
      {CHAKRA_SPOKES.map((spoke, index) => (
        <Line
          key={`spoke-${index}`}
          x1={CHAKRA.x}
          y1={CHAKRA.y}
          x2={spoke.x2}
          y2={spoke.y2}
          stroke={brandPalette.indiaGreen}
          strokeWidth={0.9}
        />
      ))}
    </Svg>
  );
}
