import { render, screen, fireEvent } from "@testing-library/react";
import FavoriteToggle from "./FavoriteToggle";
import userEvent from "@testing-library/user-event";

const defaultProps = {
  favorites: [] as string[],
  onToggleFavorite: jest.fn(),
};

describe("FavoriteToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the label and counter", () => {
    render(<FavoriteToggle {...defaultProps} />);

    expect(screen.getByText("Favorite Currencies")).toBeInTheDocument();
    expect(screen.getByText("0/5")).toBeInTheDocument();
  });

  it("should render all currency buttons", () => {
    render(<FavoriteToggle {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(10); // 10 currencies
  });

  it("should call onToggleFavorite when a button is clicked", async () => {
    const onToggleFavorite = jest.fn();
    render(
      <FavoriteToggle {...defaultProps} onToggleFavorite={onToggleFavorite} />
    );

    const usdButton = screen.getByRole("button", {
      name: /Mark US Dollar as favorite/i,
    });

    await userEvent.click(usdButton);

    expect(onToggleFavorite).toHaveBeenCalledWith("USD");
  });

  it("should show unfilled star for non-favorites and filled star for favorites", () => {
    const { rerender } = render(
      <FavoriteToggle {...defaultProps} favorites={["USD"]} />
    );

    // USD should have filled star (★)
    const usdButton = screen.getByRole("button", {
      name: /Unmark US Dollar as favorite/i,
    });
    expect(usdButton).toHaveTextContent("★");

    // EUR should have unfilled star (☆)
    const eurButton = screen.getByRole("button", {
      name: /Mark Euro as favorite/i,
    });
    expect(eurButton).toHaveTextContent("☆");
  });

  it("should update counter when favorites change", () => {
    const { rerender } = render(
      <FavoriteToggle {...defaultProps} favorites={[]} />
    );

    expect(screen.getByText("0/5")).toBeInTheDocument();

    rerender(
      <FavoriteToggle {...defaultProps} favorites={["USD", "EUR", "GBP"]} />
    );

    expect(screen.getByText("3/5")).toBeInTheDocument();
  });

  it("should disable buttons when max favorites is reached", () => {
    render(
      <FavoriteToggle
        {...defaultProps}
        favorites={["USD", "EUR", "GBP", "JPY", "AUD"]}
        maxFavorites={5}
      />
    );

    // Favorite buttons should be enabled
    const usdButton = screen.getByRole("button", {
      name: /Unmark US Dollar as favorite/i,
    });
    expect(usdButton).not.toBeDisabled();

    // Non-favorite buttons should be disabled
    const cadButton = screen.getByRole("button", {
      name: /Mark Canadian Dollar as favorite/i,
    });
    expect(cadButton).toBeDisabled();
  });

  it("should show error message when provided", () => {
    render(
      <FavoriteToggle
        {...defaultProps}
        error="You can only select up to 5 favorite currencies."
      />
    );

    expect(
      screen.getByText("You can only select up to 5 favorite currencies.")
    ).toBeInTheDocument();
  });

  it("should have proper aria labels for accessibility", () => {
    render(<FavoriteToggle {...defaultProps} favorites={["USD"]} />);

    const usdButton = screen.getByRole("button", {
      name: /Unmark US Dollar as favorite/i,
    });
    expect(usdButton).toHaveAttribute("aria-pressed", "true");

    const eurButton = screen.getByRole("button", {
      name: /Mark Euro as favorite/i,
    });
    expect(eurButton).toHaveAttribute("aria-pressed", "false");
  });
});
