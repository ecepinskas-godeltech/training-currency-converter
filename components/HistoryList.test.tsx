import { render, screen, fireEvent } from "@testing-library/react";
import HistoryList from "./HistoryList";
import { SearchHistory } from "@/types/weather";

describe("HistoryList Component", () => {
  const mockHistory: SearchHistory[] = [
    { cityCode: "vilnius", cityName: "Vilnius", timestamp: Date.now() },
    { cityCode: "kaunas", cityName: "Kaunas", timestamp: Date.now() - 1000 },
    {
      cityCode: "klaipeda",
      cityName: "Klaipėda",
      timestamp: Date.now() - 2000,
    },
  ];

  it("should render nothing when history is empty", () => {
    const mockOnSelect = jest.fn();
    const mockOnClear = jest.fn();

    const { container } = render(
      <HistoryList history={[]} onSelect={mockOnSelect} onClear={mockOnClear} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render all history items", () => {
    const mockOnSelect = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <HistoryList
        history={mockHistory}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("Vilnius")).toBeInTheDocument();
    expect(screen.getByText("Kaunas")).toBeInTheDocument();
    expect(screen.getByText("Klaipėda")).toBeInTheDocument();
  });

  it("should call onSelect when city is clicked", () => {
    const mockOnSelect = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <HistoryList
        history={mockHistory}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    );

    const vilniusButton = screen.getByText("Vilnius");
    fireEvent.click(vilniusButton);

    expect(mockOnSelect).toHaveBeenCalledWith("vilnius");
  });

  it("should call onClear when Clear History is clicked", () => {
    const mockOnSelect = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <HistoryList
        history={mockHistory}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText("Clear History");
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it("should render Recent Searches heading", () => {
    const mockOnSelect = jest.fn();
    const mockOnClear = jest.fn();

    render(
      <HistoryList
        history={mockHistory}
        onSelect={mockOnSelect}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("Recent Searches")).toBeInTheDocument();
  });
});
