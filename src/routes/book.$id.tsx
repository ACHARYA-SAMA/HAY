import { parseCatalogSearch } from "@/services/navigation";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { SeatMap } from "@/components/seat-map";

import { HoldTimer } from "@/components/hold-timer";

import { Stamp } from "@/components/stamp";

import { Button } from "@/components/ui/button";

import { getListing } from "@/services";

import { berthLabel, passengerSchema, contactSchema, priceSeats } from "@/services/checkout";

import { EMPTY_SEATS, useAppStore } from "@/stores/app-store";

import { TravelFacts } from "@/components/travel-facts";

import { InkSelect } from "@/components/ink-controls";

import type { Passenger } from "@/services/types";

import { money, shortDate } from "@/lib/format";

export const Route = createFileRoute("/book/$id")({
  validateSearch: parseCatalogSearch,
  loader: ({ params }) => getListing(params.id),
  head: () => ({
    meta: [
      { title: "Book your ticket — HAY" },
      { name: "description", content: "Choose seats, add details, review and pay." },
      { property: "og:title", content: "Book your ticket — HAY" },
      { property: "og:description", content: "Choose seats, add details, review and pay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => {
    const source = Route.useLoaderData(),
      search = Route.useSearch(),
      showing = source.showings?.find(
        (s) => s.venue === search.venue && s.times.includes(search.time ?? ""),
      ),
      listing = showing
        ? { ...source, venue: showing.venue, time: search.time!, format: showing.format }
        : source;
    return <Booking key={listing.id} listing={listing} />;
  },
});

function Booking({ listing }: { listing: Awaited<ReturnType<typeof getListing>> }) {
  const seats = useAppStore((s) => s.selectedByListing[listing.id] ?? EMPTY_SEATS),
    expires = useAppStore((s) => s.holds[listing.id]),
    startHold = useAppStore((s) => s.startHold),
    release = useAppStore((s) => s.release),
    purchase = useAppStore((s) => s.purchase);

  const search = Route.useSearch(),
    chosenClass = useAppStore((s) => s.classByListing[listing.id]),
    chooseClass = useAppStore((s) => s.chooseClass),
    travelClass = chosenClass ?? listing.fares?.[0]?.code;

  const [passengers, setPassengers] = useState<Record<string, Passenger>>({}),
    [passengerError, setPassengerError] = useState("");

  const passenger = (seat: string): Passenger =>
    passengers[seat] ?? { name: "", age: 0, gender: "", berthPreference: "Any" };

  const updatePassenger = (seat: string, patch: Partial<Passenger>) =>
    setPassengers((p) => ({ ...p, [seat]: { ...passenger(seat), ...patch } }));

  useEffect(() => {
    if (!chosenClass && listing.fares) {
      const requested = search.travelClass ?? search.cabin ?? search.seatType;
      chooseClass(
        listing.id,
        listing.fares.find((f) => f.code === requested && f.seats > 0)?.code ??
          listing.fares[0]!.code,
      );
    }
  }, [
    chosenClass,
    chooseClass,
    listing.id,
    listing.fares,
    search.travelClass,
    search.cabin,
    search.seatType,
  ]);

  const [step, setStep] = useState(1),
    [paid, setPaid] = useState(false),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [errors, setErrors] = useState<{
      name?: string | undefined;
      email?: string | undefined;
      payment?: string | undefined;
    }>({});

  const navigate = useNavigate(),
    price = priceSeats(listing, seats, travelClass);

  const expire = useCallback(() => {
    release(listing.id);
    void navigate({
      to: "/explore",
      search: { cat: listing.category, expired: true },
      replace: true,
    });
  }, [listing.id, listing.category, navigate, release]);

  const next = () => {
    const current = useAppStore.getState().holds[listing.id];
    if (current && current <= Date.now()) {
      expire();
      return;
    }
    if (step === 1) startHold(listing.id);
    setStep((s) => Math.min(4, s + 1));
  };

  const details = (event: FormEvent) => {
    event.preventDefault();
    if (
      listing.category === "train" &&
      seats.some((seat) => !passengerSchema.safeParse(passenger(seat)).success)
    ) {
      setPassengerError(
        "Complete every passenger: name, age (1·120), gender and berth preference.",
      );
      return;
    }
    setPassengerError("");
    const parsed = contactSchema.safeParse({ name, email });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({ name: fields.name?.[0], email: fields.email?.[0] });
      return;
    }
    setName(parsed.data.name);
    setEmail(parsed.data.email);
    setErrors({});
    next();
  };

  const pay = () => {
    try {
      purchase(listing, { name, email }, Date.now(), { passengers: seats.map(passenger) });
      setPaid(true);
    } catch (error) {
      if (!useAppStore.getState().holds[listing.id]) expire();
      else
        setErrors({
          payment:
            error instanceof Error ? error.message : "Unable to issue your ticket. Try again.",
        });
    }
  };

  if (paid)
    return (
      <div className="page-shell">
        <section className="section min-h-[70vh] text-center">
          <Stamp>BOOKED.</Stamp>
          <h1 className="section-title mt-12">THE INK IS DRY.</h1>
          <p className="mt-5 text-lg font-bold">Your ticket is in your pocket.</p>
          <Link to="/wallet" className="clicky clicky--primary clicky--event mt-8 px-6 py-4">
            OPEN WALLET
          </Link>
        </section>
      </div>
    );

  return (
    <div className="page-shell">
      <section className="section">
        <p className="eyebrow">Booking {listing.title}</p>
        <h1 className="section-title">PICK. PRINT. GO.</h1>
      </section>
      <section className="section booking-layout">
        <div className="booking-steps">
          <div className="step-block">
            <h2 className="text-3xl font-black">
              <span className="step-no">1</span>SELECT
            </h2>
            {step === 1 && (
              <>
                {listing.fares && (
                  <div className="class-tabs" role="group" aria-label="Travel class">
                    {listing.fares.map((f) => (
                      <button
                        key={f.code}
                        type="button"
                        className={"clicky clicky--" + listing.category}
                        aria-pressed={travelClass === f.code}
                        disabled={f.seats === 0}
                        onClick={() => chooseClass(listing.id, f.code)}
                      >
                        <b>{f.code}</b>
                        <span>{f.availability}</span>
                        <span>{money.format(f.price)}</span>
                      </button>
                    ))}
                  </div>
                )}
                <SeatMap listing={listing} />
                <Button className="mt-7" disabled={!seats.length} onClick={next}>
                  HOLD {seats.length || ""} SEAT{seats.length === 1 ? "" : "S"}
                </Button>
              </>
            )}
          </div>

          <div className="step-block">
            <h2 className="text-3xl font-black">
              <span className="step-no">2</span>DETAILS
            </h2>
            {step === 2 && (
              <form noValidate onSubmit={details} className="grid gap-4 mt-5">
                <label className="font-bold" htmlFor="buyer-name">
                  FULL NAME
                  <input
                    id="buyer-name"
                    required
                    autoComplete="name"
                    className="hard-field mt-2"
                    placeholder="Name on ticket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </label>
                {errors.name && (
                  <p id="name-error" role="alert" className="font-bold">
                    {errors.name}
                  </p>
                )}
                <label className="font-bold" htmlFor="buyer-email">
                  EMAIL
                  <input
                    id="buyer-email"
                    required
                    autoComplete="email"
                    className="hard-field mt-2"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </label>
                {errors.email && (
                  <p id="email-error" role="alert" className="font-bold">
                    {errors.email}
                  </p>
                )}
                {listing.category === "train" &&
                  seats.map((seat, i) => (
                    <fieldset className="passenger-form" key={seat}>
                      <legend>
                        PASSENGER {i + 1} · {berthLabel(seat)}
                      </legend>
                      <label>
                        Passenger {i + 1} name
                        <input
                          className="hard-field"
                          value={passenger(seat).name}
                          onChange={(e) => updatePassenger(seat, { name: e.target.value })}
                        />
                      </label>
                      <label>
                        Passenger {i + 1} age
                        <input
                          type="number"
                          min="1"
                          max="120"
                          className="hard-field"
                          value={passenger(seat).age || ""}
                          onChange={(e) => updatePassenger(seat, { age: Number(e.target.value) })}
                        />
                      </label>
                      <InkSelect
                        label={"Passenger " + (i + 1) + " gender"}
                        value={passenger(seat).gender}
                        onChange={(gender) => updatePassenger(seat, { gender })}
                        options={[
                          { value: "", label: "Choose gender" },
                          ...["Female", "Male", "Non-binary", "Prefer not to say"].map((value) => ({
                            value,
                            label: value,
                          })),
                        ]}
                      />
                      <InkSelect
                        label={"Passenger " + (i + 1) + " berth preference"}
                        value={passenger(seat).berthPreference}
                        onChange={(berthPreference) => updatePassenger(seat, { berthPreference })}
                        options={["Any", "LB", "MB", "UB", "SL", "SU"].map((value) => ({
                          value,
                          label: value,
                        }))}
                      />
                    </fieldset>
                  ))}
                {passengerError && <p role="alert">{passengerError}</p>}
                <Button type="submit">REVIEW IT</Button>
              </form>
            )}
          </div>

          <div className="step-block">
            <h2 className="text-3xl font-black">
              <span className="step-no">3</span>REVIEW
            </h2>
            {step === 3 && (
              <div className="mt-5 border-[3px] border-dashed border-ink bg-card p-5 font-mono">
                <p className="font-bold">{listing.title}</p>
                <TravelFacts listing={listing} />
                {!listing.from && (
                  <p>
                    {listing.venue} · {shortDate(listing.date)} · {listing.time}
                  </p>
                )}
                <p>{travelClass}</p>
                {listing.category === "train" &&
                  seats.map((seat) => (
                    <p key={seat}>
                      {passenger(seat).name} · {passenger(seat).age} · {passenger(seat).gender} ·
                      Preference {passenger(seat).berthPreference}
                    </p>
                  ))}
                <p className="mt-3">{name}</p>
                <p>{email}</p>
                <dl className="mt-5 grid gap-3">
                  {price.items.map((item) => (
                    <div key={item.seat} className="flex justify-between gap-3">
                      <dt>
                        {listing.category === "train"
                          ? "BERTH " + berthLabel(item.seat)
                          : "SEAT " + item.seat}
                      </dt>
                      <dd>{money.format(item.price)}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-3">
                    <dt>FEES</dt>
                    <dd>{money.format(price.fee)}</dd>
                  </div>
                  <div className="flex justify-between gap-3 border-t-[3px] border-ink pt-3 font-bold">
                    <dt>TOTAL</dt>
                    <dd>{money.format(price.total)}</dd>
                  </div>
                </dl>
                <Button className="mt-6 w-full" onClick={next}>
                  LOOKS RIGHT
                </Button>
              </div>
            )}
          </div>

          <div className="step-block">
            <h2 className="text-3xl font-black">
              <span className="step-no">4</span>PAY
            </h2>
            {step === 4 && (
              <div className="mt-5 grid gap-3">
                {["UPI", "CARD", "NETBANKING"].map((x, i) => (
                  <label className="clicky payment-slab p-4" key={x}>
                    <input type="radio" name="pay" defaultChecked={i === 0} /> {x}
                  </label>
                ))}
                {errors.payment && <p role="alert">{errors.payment}</p>}
                <Button onClick={pay}>PAY {money.format(price.total)}</Button>
                <p className="font-mono text-xs">MOCK PAYMENT. NO MONEY MOVES.</p>
              </div>
            )}
          </div>
        </div>
        <aside className="summary">
          <HoldTimer expiresAt={expires} onExpire={expire} />
          <div className="route-card mt-5">
            <span className={`category-tag ticket-${listing.category}`}>{listing.category}</span>
            <h2 className="mt-4 text-2xl font-black uppercase">{listing.title}</h2>
            <TravelFacts listing={listing} />
            {!listing.from && (
              <p className="mt-2 font-bold">
                {listing.venue} · {shortDate(listing.date)} · {listing.time}
              </p>
            )}
            <p className="mt-3 font-mono font-bold">{travelClass}</p>
            <p className="mt-5 font-mono">
              {seats.length
                ? seats.map((s) => (listing.category === "train" ? berthLabel(s) : s)).join(" / ")
                : "NO SEATS YET"}
            </p>
            {!!seats.length && (
              <p className="mt-3 font-mono font-bold">TOTAL {money.format(price.total)}</p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
