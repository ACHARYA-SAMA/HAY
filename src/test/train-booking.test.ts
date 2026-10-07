import { beforeEach, expect, it } from "vitest";
import { getInventory } from "@/services/fixtures";
import { priceSeats } from "@/services/checkout";
import { useAppStore } from "@/stores/app-store";
const train = getInventory().listings.find((l) => l.category === "train")!;
beforeEach(() =>
  useAppStore.setState({
    selectedByListing: {},
    holds: {},
    purchasedTickets: [],
    classByListing: {},
  }),
);
it("uses the chosen class fare in the seat map and receipt", () => {
  expect(priceSeats(train, ["A2"], "3A").subtotal).toBe(train.fares![1]!.price);
});
it("validates passengers and issues persistent train metadata", () => {
  const s = useAppStore.getState();
  s.chooseClass(train.id, "3A");
  s.toggleSeat(train.id, "A2");
  s.startHold(train.id, 1000);
  expect(() =>
    s.purchase(train, { name: "Asha Rao", email: "a@example.com" }, 2000, { passengers: [] }),
  ).toThrow("passenger");
  const [ticket] = s.purchase(train, { name: "Asha Rao", email: "a@example.com" }, 2000, {
    passengers: [{ name: "Asha Rao", age: 29, gender: "Female", berthPreference: "LB" }],
  });
  expect(ticket!.serial).toMatch(/^HAY-/);
  expect(ticket!.pnr).toMatch(/^\d{10}$/);
  expect(ticket!.travelClass).toBe("3A");
  expect(ticket!.from).toEqual(train.from);
  expect(ticket!.passengers![0]!.name).toBe("Asha Rao");
});
it("clears old class selection and hold when switching classes", () => {
  const s = useAppStore.getState();
  s.chooseClass(train.id, "SL");
  s.toggleSeat(train.id, "A2");
  s.startHold(train.id, 1000);
  s.chooseClass(train.id, "3A");
  expect(useAppStore.getState().selectedByListing[train.id]).toBeUndefined();
  expect(useAppStore.getState().holds[train.id]).toBeUndefined();
});
