import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConversionHistory from "./ConversionHistory";
import { ConversionResult } from "@/types";

// Mock the formatAmount utility
jest.mock("@/utils/currency", () => ({
  formatAmount: jest.fn((value: number, decimals?: number) => {
    return value.toFixed(decimals || 2);
  }),
}));

describe("ConversionHistory", () => {
  const mockConversions: ConversionResult[] = [
    {
      amount: 100,
      from: "USD",
      to: "EUR",
      result: 85.5,
      rate: 0.855,
      timestamp: new Date("2026-01-14T12:00:00.000Z").getTime(),
    },
    {
      amount: 50,
      from: "GBP",
      to: "JPY",
      result: 7500,
      rate: 150,
      timestamp: new Date("2026-01-14T11:30:00.000Z").getTime(),
    },
  ];

  const defaultProps = {
    history: mockConversions,
    showHistory: true,
    onToggle: jest.fn(),
    onClear: jest.fn(),
    onLoadConversion: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render title", () => {
    render(<ConversionHistory {...defaultProps} />);

    expect(screen.getByText("Conversion History")).toBeInTheDocument();
  });

  it("should render toggle button with correct text when showHistory is true", () => {
    render(<ConversionHistory {...defaultProps} showHistory={true} />);

    const toggleButton = screen.getByRole("button", { name: /hide/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent("Hide (2)");
  });

  it("should render toggle button with correct text when showHistory is false", () => {
    render(<ConversionHistory {...defaultProps} showHistory={false} />);

    const toggleButton = screen.getByRole("button", { name: /show/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent("Show (2)");
  });

  it("should display history count in toggle button", () => {
    render(
      <ConversionHistory {...defaultProps} history={[mockConversions[0]]} />
    );

    const toggleButton = screen.getByRole("button", { name: /hide/i });
    expect(toggleButton).toHaveTextContent("(1)");
  });

  it("should call onToggle when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConversionHistory {...defaultProps} />);

    const toggleButton = screen.getByRole("button", { name: /hide/i });
    await user.click(toggleButton);

    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  it("should render clear button when history is not empty", () => {
    render(<ConversionHistory {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: /clear history/i })
    ).toBeInTheDocument();
  });

  it("should not render clear button when history is empty", () => {
    render(<ConversionHistory {...defaultProps} history={[]} />);

    expect(
      screen.queryByRole("button", { name: /clear history/i })
    ).not.toBeInTheDocument();
  });

  it("should call onClear when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<ConversionHistory {...defaultProps} />);

    const clearButton = screen.getByRole("button", { name: /clear history/i });
    await user.click(clearButton);

    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it("should not render history items when showHistory is false", () => {
    render(<ConversionHistory {...defaultProps} showHistory={false} />);

    expect(screen.queryByText(/USD → EUR/)).not.toBeInTheDocument();
  });

  it("should render empty state message when history is empty and showHistory is true", () => {
    render(
      <ConversionHistory {...defaultProps} history={[]} showHistory={true} />
    );

    expect(screen.getByText("No conversion history yet")).toBeInTheDocument();
  });

  it("should not render empty state message when showHistory is false", () => {
    render(
      <ConversionHistory {...defaultProps} history={[]} showHistory={false} />
    );

    expect(
      screen.queryByText("No conversion history yet")
    ).not.toBeInTheDocument();
  });

  it("should render all history items when showHistory is true", () => {
    render(<ConversionHistory {...defaultProps} />);

    expect(screen.getByText(/100.00 USD → 85.50 EUR/)).toBeInTheDocument();
    expect(screen.getByText(/50.00 GBP → 7500.00 JPY/)).toBeInTheDocument();
  });

  it("should display exchange rate for each conversion", () => {
    render(<ConversionHistory {...defaultProps} />);

    expect(screen.getByText(/Rate: 1 USD = 0.8550 EUR/)).toBeInTheDocument();
    expect(screen.getByText(/Rate: 1 GBP = 150.0000 JPY/)).toBeInTheDocument();
  });

  it("should display formatted timestamp for each conversion", () => {
    render(<ConversionHistory {...defaultProps} />);

    const timestamp1 = new Date(
      new Date("2026-01-14T12:00:00.000Z").getTime()
    ).toLocaleString();
    const timestamp2 = new Date(
      new Date("2026-01-14T11:30:00.000Z").getTime()
    ).toLocaleString();

    expect(screen.getByText(timestamp1)).toBeInTheDocument();
    expect(screen.getByText(timestamp2)).toBeInTheDocument();
  });

  it("should call onLoadConversion with correct data when history item is clicked", async () => {
    const user = userEvent.setup();
    render(<ConversionHistory {...defaultProps} />);

    const firstItem = screen.getByText(/100.00 USD → 85.50 EUR/).closest("div");
    if (firstItem) {
      await user.click(firstItem);
    }

    expect(defaultProps.onLoadConversion).toHaveBeenCalledTimes(1);
    expect(defaultProps.onLoadConversion).toHaveBeenCalledWith(
      mockConversions[0]
    );
  });

  it("should call onLoadConversion with correct data for second history item", async () => {
    const user = userEvent.setup();
    render(<ConversionHistory {...defaultProps} />);

    const secondItem = screen
      .getByText(/50.00 GBP → 7500.00 JPY/)
      .closest("div");
    if (secondItem) {
      await user.click(secondItem);
    }

    expect(defaultProps.onLoadConversion).toHaveBeenCalledTimes(1);
    expect(defaultProps.onLoadConversion).toHaveBeenCalledWith(
      mockConversions[1]
    );
  });

  it("should apply hover styling classes to history items", () => {
    render(<ConversionHistory {...defaultProps} />);

    const historyItem = screen.getByText(/100.00/).closest(".cursor-pointer");

    expect(historyItem).toHaveClass("hover:bg-gray-50");
    expect(historyItem).toHaveClass("cursor-pointer");
  });

  it("should handle single conversion in history", () => {
    const singleConversion = [mockConversions[0]];
    render(<ConversionHistory {...defaultProps} history={singleConversion} />);

    expect(screen.getByText(/100.00 USD → 85.50 EUR/)).toBeInTheDocument();
    expect(screen.queryByText(/GBP → JPY/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hide/i })).toHaveTextContent(
      "(1)"
    );
  });

  it("should render with multiple conversions", () => {
    const multipleConversions: ConversionResult[] = [
      ...mockConversions,
      {
        amount: 200,
        from: "CAD",
        to: "CHF",
        result: 140,
        rate: 0.7,
        timestamp: new Date("2026-01-14T10:00:00.000Z").getTime(),
      },
    ];

    render(
      <ConversionHistory {...defaultProps} history={multipleConversions} />
    );

    // Verify all 3 items are rendered by checking for unique result amounts
    expect(screen.getByText(/85.50/)).toBeInTheDocument();
    expect(screen.getByText(/7500.00/)).toBeInTheDocument();
    expect(screen.getByText(/140.00/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hide/i })).toHaveTextContent(
      "(3)"
    );
  });
});
