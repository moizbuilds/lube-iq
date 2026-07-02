// Guide: the "how" layer of Lube IQ — a static reading page for anyone who
// has never had to think about engine oil before. No data, no interactivity,
// just the five things a novice actually needs to know, in the order they'll
// run into them: read the label, check the level, know when to change it,
// pick between fitting oils, then store or dispose of it properly. Reached
// via the "Guide" nav link (/guide).
const SECTIONS = [
  {
    number: '01',
    title: 'How to read an oil label',
    fact: '5W-30 → 5W is cold flow, 30 is hot thickness',
    body: (
      <>
        <p>
          The code on every bottle, like <strong translate="no">5W-30</strong>, is two
          numbers pretending to be one. The first number plus the <strong>W</strong> (for
          Winter, not weight) tells you how easily the oil flows when the engine is cold —
          lower means it reaches your engine&rsquo;s moving parts faster on a cold start.
          The second number is how thick the oil stays once the engine has reached full
          working temperature. Neither number is a quality score; they&rsquo;re just the
          grade your engine was designed around.
        </p>
        <p>
          You&rsquo;ll also see a circular <strong>API donut</strong> printed on the
          bottle — the American standard confirming the oil passed a set of lab and engine
          tests. An <strong>ACEA</strong> code (a European classification, like C3) tells
          you which category of engine it&rsquo;s built for. And any <strong>OEM
          approval</strong> — a code like &ldquo;MB 229.51&rdquo; — means the actual
          manufacturer tested and signed off on that exact oil. That approval is the
          strongest guarantee on the bottle.
        </p>
      </>
    ),
  },
  {
    number: '02',
    title: 'Checking and topping up',
    fact: 'Check on flat ground, engine cool, little and often',
    body: (
      <>
        <p>
          Check your level on flat ground with the engine cool — ideally before you&rsquo;ve
          driven that day, or at least 10 minutes after switching off so oil has time to
          drain back into the sump. Pull the dipstick, wipe it clean, reinsert it fully,
          then pull it again and read where the film sits between the two marks.
        </p>
        <p>
          If you&rsquo;re topping up, add a little at a time and recheck — it&rsquo;s much
          easier to add more than to remove excess. Never fill past the top mark: overfilled
          oil gets whipped into froth by the moving parts inside, and frothy oil can&rsquo;t
          get pumped where it needs to go, starving the engine of protection exactly when
          it needs it most.
        </p>
        <p>
          Topping up with a different brand at the same grade is fine in a pinch — base
          oils and additives are broadly compatible. Topping up with a different
          <em> grade</em>, though, changes how the oil behaves, so match the number on your
          own dipstick or manual whenever you can.
        </p>
      </>
    ),
  },
  {
    number: '03',
    title: 'When to shorten your drain interval',
    fact: 'In the Gulf, the severe schedule is the normal schedule',
    body: (
      <>
        <p>
          Every manual lists two drain intervals: normal and severe. Severe service covers
          extreme heat, dust, towing, and mostly short trips that never let the engine fully
          warm up — and across the Gulf, that&rsquo;s not an edge case, it&rsquo;s daily
          driving. Treat the severe interval as your default, not the exception.
        </p>
        <p>
          Heat accelerates how fast oil breaks down chemically, and fine dust that gets past
          the air filter turns oil into a mild abrasive. Short trips are worse than they look
          too: an engine that never reaches full temperature never burns off the condensation
          and fuel that dilute the oil, so it ages faster per kilometre than one on a long
          motorway run.
        </p>
        <p>
          That&rsquo;s also why manuals give a distance <em>and</em> a time limit, not just
          one. A car parked for months still has oil quietly oxidising inside it — so if
          you&rsquo;re under the kilometre limit but past the month limit, it&rsquo;s still
          time for a change.
        </p>
      </>
    ),
  },
  {
    number: '04',
    title: 'Choosing between oils that all “fit”',
    fact: 'A manufacturer approval outranks every other number',
    body: (
      <>
        <p>
          Once you&rsquo;ve found several oils that meet your engine&rsquo;s grade and API/
          ACEA requirements, they&rsquo;re not all equal. An <strong>OEM approval</strong>{' '}
          is the strongest signal on the shelf — it means the carmaker itself ran that exact
          oil through its own tests, not just a generic industry standard.
        </p>
        <p>
          Between two oils that are otherwise similar, <strong>full synthetic</strong> holds
          its protective film better at sustained high temperatures than semi-synthetic or
          mineral oil — a real advantage in Gulf summers where the engine bay routinely runs
          hot. And a higher <strong>TBN</strong> (Total Base Number, the oil&rsquo;s reserve
          for neutralising acidic combustion by-products) suits an engine you plan to run
          closer to the longer drain interval, since that reserve is what runs out first.
        </p>
        <p>
          When none of that breaks the tie, price and brand availability are a perfectly
          reasonable way to decide.
        </p>
      </>
    ),
  },
  {
    number: '05',
    title: 'Storage & disposal',
    fact: 'Sealed, shaded, roughly a 5-year shelf life',
    body: (
      <>
        <p>
          Unopened oil keeps well if you store it sealed in its original container, out of
          direct sun and away from extreme heat — a garage shelf is fine, a car boot in
          summer is not. Under those conditions it&rsquo;s good for roughly five years;
          heat and sunlight are what age it prematurely, not time alone.
        </p>
        <p>
          Used oil is a different matter — it carries the metal particles and combustion
          by-products it was protecting your engine from, so it counts as hazardous waste.
          Never pour it down a drain, into soil, or into household rubbish; a small amount
          contaminates a huge volume of water. Take it to a workshop or an authorised
          collection point instead — most garages that perform oil changes will also accept
          your own used oil for proper disposal.
        </p>
      </>
    ),
  },
];

export default function Guide() {
  return (
    <div className="guide">
      <p className="eyebrow">Lube IQ — Guide</p>
      <h1>Using engine oil, explained simply.</h1>
      <p className="guide-lede">
        Five things worth knowing, in the order you&rsquo;ll actually run into them —
        from reading the label to disposing of what comes out.
      </p>

      {/* Each section is numbered because this genuinely is the order a new
          owner encounters these questions — not decoration, a reading path.
          The number sits in a left "spine" column, echoing the drain panel's
          two-column data-plate layout from the machine results page. */}
      <div className="guide-sections">
        {SECTIONS.map((section) => (
          <section key={section.number} className="guide-section" aria-labelledby={`guide-${section.number}`}>
            <div className="guide-spine" aria-hidden="true">{section.number}</div>
            <div className="guide-content">
              <h2 id={`guide-${section.number}`}>{section.title}</h2>
              <span className="chip chip-accent guide-fact">{section.fact}</span>
              <div className="guide-body">{section.body}</div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
