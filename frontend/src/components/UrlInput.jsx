import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiGithub, FiAlertCircle } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import toast from "react-hot-toast";
import { repoService } from "../services/api";
import { cn } from "../utils/cn";

const schema = z.object({
  url: z
    .string()
    .min(1, "GitHub URL is required")
    .regex(
      /^(?:https?:\/\/)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/,
      "Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)",
    ),
});

export default function UrlInput() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const urlValue = watch("url");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Clean up URL (remove trailing slash if any)
      const cleanUrl = data.url.replace(/\/$/, "");
      const response = await repoService.validate(cleanUrl);

      // If validation succeeds, navigate to dashboard with data
      toast.success("Repository verified!");
      navigate("/dashboard", {
        state: { repoUrl: cleanUrl, repoData: response },
      });
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.error?.message ||
        "Failed to validate repository. Ensure it is public and exists.";
      toast.error(message, {
        icon: "⚠️",
        style: {
          background: "var(--color-bg-card)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border-default)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex flex-col gap-3"
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiGithub className="h-5 w-5 text-text-secondary group-focus-within:text-accent transition-colors duration-300" />
          </div>
          <input
            type="text"
            {...register("url")}
            disabled={isLoading}
            placeholder="https://github.com/owner/repository"
            className={cn(
              "block w-full pl-12 pr-36 py-4 rounded-xl bg-bg-surface border text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 transition-all duration-300 shadow-sm",
              errors.url
                ? "border-danger focus:ring-danger/20 focus:border-danger"
                : "border-border-default focus:ring-accent/20 focus:border-accent hover:border-text-secondary/50",
              isLoading && "opacity-60 cursor-not-allowed",
            )}
            autoComplete="off"
            spellCheck="false"
          />

          <div className="absolute inset-y-1 right-1 flex items-center">
            <button
              type="submit"
              disabled={!isValid || isLoading || !isDirty}
              className={cn(
                "flex items-center justify-center h-full px-6 rounded-lg font-medium transition-all duration-300",
                !isValid || !isDirty
                  ? "bg-bg-card text-text-secondary cursor-not-allowed border border-transparent"
                  : "bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] shadow-md active:scale-95",
                isLoading && "opacity-90 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <BiLoaderAlt className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline mr-2">Analyze</span>
                  <FiArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {errors.url && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="flex items-center text-sm text-danger mt-1 overflow-hidden px-2"
            >
              <FiAlertCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>{errors.url.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
