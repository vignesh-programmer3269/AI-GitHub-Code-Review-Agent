import { cn } from "../../utils/cn";
import openaiLogo from "../../assets/models_logo/openai_logo.png";
import claudeLogo from "../../assets/models_logo/claude_logo.png";
import geminiLogo from "../../assets/models_logo/gemini_logo.jpeg";

export default function ProviderLogo({ provider, className }) {
  const providerLower = provider?.toLowerCase();
  
  if (providerLower === "openai") {
    return (
      <img src={openaiLogo} alt="OpenAI Logo" className={cn("object-contain rounded-[4px]", className)} />
    );
  }
  if (providerLower === "claude" || providerLower === "anthropic") {
    return (
      <img src={claudeLogo} alt="Claude Logo" className={cn("object-contain rounded-[4px]", className)} />
    );
  }
  if (providerLower === "gemini" || providerLower === "google") {
    return (
      <img src={geminiLogo} alt="Gemini Logo" className={cn("object-contain rounded-[4px]", className)} />
    );
  }
  
  // Default fallback SVG
  return (
    <div className={cn("text-text-secondary", className)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
        <rect x="9" y="9" width="6" height="6"/>
        <line x1="9" y1="1" x2="9" y2="4"/>
        <line x1="15" y1="1" x2="15" y2="4"/>
        <line x1="9" y1="20" x2="9" y2="23"/>
        <line x1="15" y1="20" x2="15" y2="23"/>
        <line x1="20" y1="9" x2="23" y2="9"/>
        <line x1="20" y1="14" x2="23" y2="14"/>
        <line x1="1" y1="9" x2="4" y2="9"/>
        <line x1="1" y1="14" x2="4" y2="14"/>
      </svg>
    </div>
  );
}
