import logoLight from "../../assets/logos/Solais Logo - Light.png";
import logoDark from "../../assets/logos/Solais Logo - Dark.png";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function Logo({ variant = "light", className }: LogoProps) {
  const logo = variant === "light" ? logoLight : logoDark;

  return <img src={logo} alt="Solaís Lifestyle" className={className} />;
}
