import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "./SearchBar";

describe("SearchBar Component", () => {
  it("should render input and button", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    expect(
      screen.getByPlaceholderText(/Enter Lithuanian city name/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search/i })).toBeInTheDocument();
  });

  it("should call onSearch with trimmed city name", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Enter Lithuanian city name/i);
    const button = screen.getByRole("button", { name: /Search/i });

    fireEvent.change(input, { target: { value: "  Vilnius  " } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith("Vilnius");
  });

  it("should show error for empty input", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const button = screen.getByRole("button", { name: /Search/i });
    fireEvent.click(button);

    expect(screen.getByText(/Please enter a city name/i)).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it("should show error for too short input", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Enter Lithuanian city name/i);
    const button = screen.getByRole("button", { name: /Search/i });

    fireEvent.change(input, { target: { value: "V" } });
    fireEvent.click(button);

    expect(screen.getByText(/City name is too short/i)).toBeInTheDocument();
    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it("should disable input and button when loading", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);

    const input = screen.getByPlaceholderText(/Enter Lithuanian city name/i);
    const button = screen.getByRole("button", { name: /Loading.../i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("should clear error when typing", () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/Enter Lithuanian city name/i);
    const button = screen.getByRole("button", { name: /Search/i });

    // Trigger error
    fireEvent.click(button);
    expect(screen.getByText(/Please enter a city name/i)).toBeInTheDocument();

    // Type to clear error
    fireEvent.change(input, { target: { value: "Vilnius" } });
    expect(
      screen.queryByText(/Please enter a city name/i)
    ).not.toBeInTheDocument();
  });
});
