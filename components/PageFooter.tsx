interface PageFooterProps {
  lastUpdated?: number;
}

export default function PageFooter({ lastUpdated }: PageFooterProps) {
  return (
    <footer className="text-center mt-8 text-gray-600 text-sm">
      <p>Exchange rates are updated hourly</p>
      {lastUpdated && (
        <p className="mt-1">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </p>
      )}
      <p className="mt-4 text-xs sm:text-sm">
        © 2026 Godel Technologies. All rights reserved.
      </p>
    </footer>
  );
}
