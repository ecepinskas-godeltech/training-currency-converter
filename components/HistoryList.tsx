"use client";

import { HistoryListProps } from "@/types/weather";

export default function HistoryList({
  history,
  onSelect,
  onClear,
}: HistoryListProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Recent Searches</h3>
        <button
          onClick={onClear}
          className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
        >
          Clear History
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((item) => (
          <button
            key={item.cityCode}
            onClick={() => onSelect(item.cityCode)}
            className="px-4 py-2 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full text-sm font-medium transition-colors"
          >
            {item.cityName}
          </button>
        ))}
      </div>
    </div>
  );
}
