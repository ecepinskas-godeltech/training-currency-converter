"use client";

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="w-full max-w-2xl bg-red-50 border-2 border-red-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">Error</h3>
          <p className="text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
