import "whatwg-fetch";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { resetData } from "../mocks/handlers";
import { server } from "../mocks/server";
import ShoppingList from "../components/ShoppingList";

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  resetData();
});
afterAll(() => server.close());

test("displays all the items from the server after the initial render", async () => {
  render(<ShoppingList />);

  await waitFor(() => {
    expect(screen.getByText(/Yogurt/)).toBeInTheDocument();
    expect(screen.getByText(/Pomegranate/)).toBeInTheDocument();
    expect(screen.getByText(/Lettuce/)).toBeInTheDocument();
  });
});

test("adds a new item to the list when the ItemForm is submitted", async () => {
  render(<ShoppingList />);

  const dessertCount = screen.queryAllByText(/Dessert/).length;

  fireEvent.change(screen.getByLabelText(/Name/i), {
    target: { value: "Ice Cream" },
  });
  fireEvent.change(screen.getByLabelText(/Category/i), {
    target: { value: "Dessert" },
  });
  fireEvent.submit(screen.getByText(/Add to List/i));

  await waitFor(() => {
    expect(screen.getByText(/Ice Cream/)).toBeInTheDocument();
    expect(screen.getAllByText(/Dessert/).length).toBe(dessertCount + 1);
  });
});

test("updates the isInCart status of an item when the Add/Remove from Cart button is clicked", async () => {
  render(<ShoppingList />);

  await waitFor(() => {
    expect(screen.getAllByText(/Add to Cart/).length).toBe(3);
  });

  const addButton = screen.getAllByText(/Add to Cart/)[0];
  fireEvent.click(addButton);

  await waitFor(() => {
    expect(screen.getByText(/Remove From Cart/)).toBeInTheDocument();
  });
});

test("removes an item from the list when the delete button is clicked", async () => {
  render(<ShoppingList />);

  await waitFor(() => {
    expect(screen.getByText(/Yogurt/)).toBeInTheDocument();
  });

  const deleteButton = screen.getAllByText(/Delete/)[0];
  fireEvent.click(deleteButton);

  await waitForElementToBeRemoved(() => screen.queryByText(/Yogurt/));
  expect(screen.queryByText(/Yogurt/)).not.toBeInTheDocument();
});
