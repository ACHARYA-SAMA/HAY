import { GlobalSearch } from "@/components/global-search";
import { detailPaths } from "@/services/navigation";
import { createFileRoute, Link } from "@tanstack/react-router";

import { CategorySwitch } from "@/components/category-switch";
import { SplitFlapBoard } from "@/components/split-flap";
import { Ticket } from "@/components/ticket/ticket";
import { getCatalog } from "@/services";
import { money } from "@/lib/format";

export const Route = createFileRoute("/")({
  loader: getCatalog,
  head: () => ({
    meta: [
      { title: "HAY — Every ticket in one pocket" },
      { name: "description", content: "Movies, live events, sports and travel. One pocket." },
      { property: "og:title", content: "HAY — Every ticket in one pocket" },
      {
        property: "og:description",
        content: "Movies, live events, sports and travel. One pocket.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});
function Home() {
  const { tickets, listings } = Route.useLoaderData();
  const travel = listings.filter((x) => ["bus", "train", "flight"].includes(x.category));
  return (
    <div className="page-shell">
      <section className="section hero">
        <div className="hero-copy">
          <span className="sticker">NO FOUR APPS. ONE.</span>
          <h1 className="display mt-6">
            ONE POCKET.
            <br />
            <span className="riso" data-text="EVERY">
              EVERY
            </span>
            <br />
            TICKET.
          </h1>
          <p className="mt-8 max-w-lg text-lg font-bold">
            Films, fields, stages, stations, skies. You just have to show up.
          </p>
          <GlobalSearch hero />
        </div>
        <SplitFlapBoard />
      </section>
      <section className="section">
        <p className="eyebrow">Pick your counter</p>
        <h2 className="section-title my-5">
          SIX WINDOWS.
          <br />
          ONE QUEUE.
        </h2>
        <CategorySwitch />
      </section>
      <section className="section">
        <p className="eyebrow">Tonight near you</p>
        <div className="ticket-rail mt-6">
          {tickets.slice(0, 3).map((t) => (
            <Ticket key={t.id} ticket={t} />
          ))}
        </div>
      </section>
      <section className="section">
        <p className="eyebrow">Leaving soon</p>
        <h2 className="section-title my-6">PACK LIGHT.</h2>
        <div className="route-grid">
          {travel.map((x) => (
            <article className="route-card" key={x.id}>
              <span className={`category-tag ticket-${x.category}`}>{x.category}</span>
              <h3 className="mt-5 text-3xl font-black uppercase">
                {x.from?.city} → {x.to?.city}
              </h3>
              <div className="route-line" />
              <div className="flex justify-between font-mono font-bold">
                <span>{x.time}</span>
                <span>{money.format(x.price)}</span>
              </div>
              <Link
                to={detailPaths[x.category]}
                params={{ id: x.id }}
                className={`clicky clicky--sm clicky--${x.category} mt-6 w-full`}
              >
                BOOK IT →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">
          THREE PUNCHES.
          <br />
          YOU'RE IN.
        </h2>
        <div className="card-grid mt-8">
          {[
            ["01", "FIND IT."],
            ["02", "PICK IT."],
            ["03", "POCKET IT."],
          ].map(([n, t], i) => (
            <div
              className="block-card"
              key={n}
              style={{ transform: `translateY(${i % 2 ? 18 : 0}px)` }}
            >
              <b className="font-mono text-5xl">{n}</b>
              <h3 className="mt-12 text-3xl font-black">{t}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="grid border-b-[5px] border-ink md:grid-cols-3">
        {["REFUNDS SPELLED OUT.", "PAYMENTS LOCKED DOWN.", "ONE QR. WALK IN."].map((x) => (
          <b className="border-ink p-6 text-xl md:border-r-[3px]" key={x}>
            {x}
          </b>
        ))}
      </section>
    </div>
  );
}
