import { useState, useEffect } from "react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  onError?: (error: Error) => void;
}

export default function RefreshButton({
  onRefresh,
  isLoading = false,
  onError,
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cooldownExpiryTime, setCooldownExpiryTime] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const COOLDOWN_MS = 10000; // 10 seconds

  useEffect(() => {
    if (cooldownRemaining <= 0) return;

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    // Early exit: prevent refresh if already loading or refreshing
    if (isLoading || isRefreshing) {
      return;
    }

    const now = Date.now();

    // Check if cooldown is still active
    if (now < cooldownExpiryTime) {
      setCooldownRemaining(Math.ceil((cooldownExpiryTime - now) / 1000));
      return;
    }

    setIsRefreshing(true);
    try {
      await onRefresh();
      setCooldownExpiryTime(now + COOLDOWN_MS);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Refresh failed:", err);
      onError?.(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isDisabled = isRefreshing || isLoading || cooldownRemaining > 0;
  const buttonText =
    cooldownRemaining > 0 ? `Refresh (${cooldownRemaining}s)` : "Refresh";

  return (
    <button
      onClick={handleRefresh}
      disabled={isDisabled}
      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
      title={
        isDisabled
          ? `Refresh available in ${cooldownRemaining}s`
          : "Refresh exchange rates"
      }
      aria-label={
        cooldownRemaining > 0
          ? `Refresh unavailable, cooldown active (${cooldownRemaining}s)`
          : "Refresh exchange rates"
      }
    >
      <svg
        className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span className="text-sm" role="status" aria-live="polite">
        {buttonText}
      </span>
    </button>
  );
}
