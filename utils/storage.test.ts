import {
  getSearchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from "../storage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Storage Utils", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("getSearchHistory", () => {
    it("should return empty array when no history exists", () => {
      const history = getSearchHistory();
      expect(history).toEqual([]);
    });

    it("should return stored history", () => {
      const testHistory = [
        { cityCode: "vilnius", cityName: "Vilnius", timestamp: Date.now() },
      ];
      localStorageMock.setItem(
        "weather-search-history",
        JSON.stringify(testHistory)
      );

      const history = getSearchHistory();
      expect(history).toEqual(testHistory);
    });

    it("should handle corrupted data gracefully", () => {
      localStorageMock.setItem("weather-search-history", "invalid-json");
      const history = getSearchHistory();
      expect(history).toEqual([]);
    });
  });

  describe("addToSearchHistory", () => {
    it("should add new city to history", () => {
      addToSearchHistory("vilnius", "Vilnius");
      const history = getSearchHistory();

      expect(history).toHaveLength(1);
      expect(history[0].cityCode).toBe("vilnius");
      expect(history[0].cityName).toBe("Vilnius");
      expect(history[0].timestamp).toBeDefined();
    });

    it("should move existing city to top", () => {
      addToSearchHistory("kaunas", "Kaunas");
      addToSearchHistory("vilnius", "Vilnius");
      addToSearchHistory("kaunas", "Kaunas");

      const history = getSearchHistory();
      expect(history).toHaveLength(2);
      expect(history[0].cityCode).toBe("kaunas");
      expect(history[1].cityCode).toBe("vilnius");
    });

    it("should maintain maximum of 3 items", () => {
      addToSearchHistory("vilnius", "Vilnius");
      addToSearchHistory("kaunas", "Kaunas");
      addToSearchHistory("klaipeda", "Klaipėda");
      addToSearchHistory("siauliai", "Šiauliai");

      const history = getSearchHistory();
      expect(history).toHaveLength(3);
      expect(history[0].cityCode).toBe("siauliai");
      expect(history[2].cityCode).toBe("kaunas");
    });
  });

  describe("clearSearchHistory", () => {
    it("should remove all history", () => {
      addToSearchHistory("vilnius", "Vilnius");
      addToSearchHistory("kaunas", "Kaunas");

      clearSearchHistory();
      const history = getSearchHistory();
      expect(history).toEqual([]);
    });
  });
});
