import { CURRENCIES } from "@/utils/currency";

interface FavoriteToggleProps {
  favorites: string[];
  onToggleFavorite: (currencyCode: string) => void;
  maxFavorites?: number;
  error?: string | null;
}

/**
 * FavoriteToggle component for managing favorite currencies
 * Displays star buttons to mark/unmark currencies as favorites
 */
export default function FavoriteToggle({
  favorites,
  onToggleFavorite,
  maxFavorites = 5,
  error,
}: FavoriteToggleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Favorite Currencies
        </label>
        <span className="text-xs text-gray-500">
          {favorites.length}/{maxFavorites}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {CURRENCIES.map((currency) => {
          const isFav = favorites.includes(currency.code);
          return (
            <button
              key={currency.code}
              type="button"
              className={`px-3 py-2 rounded border text-sm transition-colors ${
                isFav
                  ? "bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200"
                  : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-pressed={isFav}
              aria-label={
                isFav
                  ? `Unmark ${currency.name} as favorite`
                  : `Mark ${currency.name} as favorite`
              }
              onClick={() => onToggleFavorite(currency.code)}
              disabled={!isFav && favorites.length >= maxFavorites}
            >
              <span className="inline-block mr-1">{currency.code}</span>
              {isFav ? "★" : "☆"}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
