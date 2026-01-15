import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurrencySelect from "./CurrencySelect";
import { CURRENCIES } from "@/utils/currency";

describe("CurrencySelect", () => {
  it("should render select with all currencies", () => {
    render(<CurrencySelect value="USD" onChange={jest.fn()} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    // Check that all currencies are in the select
    CURRENCIES.forEach((currency) => {
      const option = screen.getByRole("option", {
        name: `${currency.code} - ${currency.name}`,
      });
      expect(option).toBeInTheDocument();
    });
  });

  it("should display selected currency", () => {
    render(<CurrencySelect value="EUR" onChange={jest.fn()} />);

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("EUR");
  });

  it("should call onChange when currency is selected", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<CurrencySelect value="USD" onChange={handleChange} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "EUR");

    expect(handleChange).toHaveBeenCalledWith("EUR");
  });

  it("should display label when provided", () => {
    render(
      <CurrencySelect value="USD" onChange={jest.fn()} label="From Currency" />
    );

    expect(screen.getByText("From Currency")).toBeInTheDocument();
  });

  it("should have correct styling classes", () => {
    render(<CurrencySelect value="USD" onChange={jest.fn()} />);

    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("w-full", "border", "rounded-lg");
  });

  it("should render dropdown icon", () => {
    const { container } = render(
      <CurrencySelect value="USD" onChange={jest.fn()} />
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should have all major currencies in correct format", () => {
    render(<CurrencySelect value="USD" onChange={jest.fn()} />);

    expect(
      screen.getByRole("option", { name: /USD - US Dollar/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /EUR - Euro/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /GBP - British Pound/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /JPY - Japanese Yen/ })
    ).toBeInTheDocument();
  });

  it("should group currencies into Favorites and All Currencies when favorites provided", () => {
    const { container } = render(
      <CurrencySelect
        value="USD"
        onChange={jest.fn()}
        favorites={["EUR", "GBP"]}
      />
    );

    const optgroups = container.querySelectorAll("optgroup");
    expect(optgroups.length).toBeGreaterThanOrEqual(2);

    // Check for Favorites group
    const favoritesGroup = Array.from(optgroups).find(
      (group) => group.label === "Favorites"
    );
    expect(favoritesGroup).toBeInTheDocument();

    // Check that EUR and GBP are in Favorites group
    expect(
      favoritesGroup?.querySelector('option[value="EUR"]')
    ).toBeInTheDocument();
    expect(
      favoritesGroup?.querySelector('option[value="GBP"]')
    ).toBeInTheDocument();
  });

  it("should render All Currencies optgroup with non-favorite currencies", () => {
    const { container } = render(
      <CurrencySelect value="USD" onChange={jest.fn()} favorites={["EUR"]} />
    );

    const optgroups = container.querySelectorAll("optgroup");
    const allCurrenciesGroup = Array.from(optgroups).find(
      (group) => group.label === "All Currencies"
    );

    expect(allCurrenciesGroup).toBeInTheDocument();

    // USD should be in All Currencies group (not a favorite)
    expect(
      allCurrenciesGroup?.querySelector('option[value="USD"]')
    ).toBeInTheDocument();
  });

  it("should not render Favorites group when no favorites provided", () => {
    const { container } = render(
      <CurrencySelect value="USD" onChange={jest.fn()} />
    );

    const optgroups = container.querySelectorAll("optgroup");
    // When no favorites, should only have "All Currencies" group
    expect(optgroups.length).toBe(1);
    expect(optgroups[0].label).toBe("All Currencies");
  });

  it("should not render Favorites group when favorites array is empty", () => {
    const { container } = render(
      <CurrencySelect value="USD" onChange={jest.fn()} favorites={[]} />
    );

    const optgroups = container.querySelectorAll("optgroup");
    // When favorites is empty array, should only have "All Currencies" group
    expect(optgroups.length).toBe(1);
    expect(optgroups[0].label).toBe("All Currencies");
  });

  it("should maintain favorites order in optgroup", () => {
    const { container } = render(
      <CurrencySelect
        value="USD"
        onChange={jest.fn()}
        favorites={["JPY", "EUR", "GBP"]}
      />
    );

    const optgroups = container.querySelectorAll("optgroup");
    // Find Favorites group (should be first)
    const favoritesGroup = Array.from(optgroups).find(
      (group) => group.label === "Favorites"
    );

    const options = favoritesGroup?.querySelectorAll("option");
    expect(options?.length).toBe(3);
    // Order should match CURRENCIES constant: USD, EUR, GBP, JPY, ...
    // So EUR comes first, then GBP, then JPY
    expect(options?.[0]?.value).toBe("EUR");
    expect(options?.[1]?.value).toBe("GBP");
    expect(options?.[2]?.value).toBe("JPY");
  });
});
