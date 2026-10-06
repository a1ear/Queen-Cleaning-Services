// ─────────────────────────────────────────────────────────────────────────────
// Site content. This is the one file to edit when the business details,
// services, prices, or form options change.
//
// EVERYTHING BELOW IS SAMPLE CONTENT until the client confirms it. Do not ship
// invented prices, hours, or claims. Once every value is the client's real
// information, set `contentReviewed` to true. Until then a production build
// fails (unless ALLOW_SAMPLE_CONTENT=1, for preview deploys) and search
// engines are told not to index the site.
// ─────────────────────────────────────────────────────────────────────────────

export type IconName =
  | "fold" | "washer" | "hanger" | "truck" | "sparkle" | "pin" | "tag" | "timer" | "shield" | "smile";

export type Service = {
  /** Used in links like /request-a-quote/?service=wash-fold. Keep it stable. */
  id: string;
  name: string;
  icon: IconName;
  /** One line, shown on the home page. */
  summary: string;
  /** Shown on the services page. */
  description: string;
  /** Shown exactly as written, e.g. "₱35 per kg". null shows "Ask for a quote". Never guess. */
  price: string | null;
};

export const siteConfig = {
  contentReviewed: false,

  /** The live address of the site, no trailing slash. */
  siteUrl: "https://www.example.com",

  business: {
    name: "FreshFold Laundry",
    headline: ["Fresh clothes.", "Less hassle."] as const,
    description: "Professional laundry services designed to make your everyday life easier.",
    /** e.g. "Mandaue City". Shown above the home headline. Empty shows a generic line. */
    serviceArea: "",

    phone: "0917 000 0000",
    email: "hello@example.com",
    address: {
      streetAddress: "123 Sample Street, Barangay Sample",
      addressLocality: "Sample City",
      addressRegion: "Sample Province",
      postalCode: "0000",
      addressCountry: "PH",
    },
    /** Google Maps → Share → Copy link. */
    mapsUrl: "",
    /** Google Maps → Share → Embed a map → copy only the src="..." URL. Empty hides the map. */
    mapEmbedUrl: "",

    /** Leave any of these empty to hide them. */
    facebookUrl: "",
    messengerUrl: "",
    instagramUrl: "",

    hours: [
      { days: "Monday to Saturday", time: "8:00 AM – 7:00 PM" },
      { days: "Sunday", time: "Closed" },
    ],
  },

  services: [
    {
      id: "wash-fold",
      name: "Wash & Fold",
      icon: "fold",
      summary: "Washed, dried, and neatly folded, ready to put away.",
      description:
        "Drop off your everyday clothes and pick them up washed, dried, and neatly folded. Good for weekly household laundry.",
      price: null,
    },
    {
      id: "wash-dry",
      name: "Wash & Dry",
      icon: "washer",
      summary: "Washed and dried, without folding.",
      description:
        "Your laundry is washed and dried, then packed for pickup. A simple option when you prefer to fold at home.",
      price: null,
    },
    {
      id: "dry-cleaning",
      name: "Dry Cleaning",
      icon: "hanger",
      summary: "For suits, gowns, and fabrics that can't go in the wash.",
      description:
        "For formal wear, delicate fabrics, and items labelled dry clean only. Tell us what you have and we'll confirm what we can take.",
      price: null,
    },
    {
      id: "pickup-delivery",
      name: "Pickup & Delivery",
      icon: "truck",
      summary: "We collect your laundry and bring it back clean.",
      description:
        "We collect your laundry from your door and bring it back when it's done. Send us your address and we'll confirm if you're within our area.",
      price: null,
    },
    {
      id: "special-care",
      name: "Special Care Laundry",
      icon: "sparkle",
      summary: "Comforters, curtains, and items that need extra attention.",
      description:
        "Bulky and delicate items such as comforters, blankets, curtains, and stuffed toys, handled separately with extra care.",
      price: null,
    },
  ] satisfies Service[] as Service[],

  /** Shown under the services list. Keep it factual. */
  pricingNote:
    "Final prices depend on the type and amount of laundry. Send a request and we'll confirm your quote before we start.",

  /** "Why choose us". Keep only what the client can actually stand behind. */
  benefits: [
    { icon: "pin", title: "Convenient", text: "Drop off on your way, or ask about pickup and delivery." },
    { icon: "sparkle", title: "Quality cleaning", text: "Every load is sorted and washed with the right settings." },
    { icon: "tag", title: "Clear pricing", text: "You get a quote before we start, so there are no surprises." },
    { icon: "timer", title: "On-time turnaround", text: "We confirm a ready date with you and keep to it." },
    { icon: "shield", title: "Careful handling", text: "Your items are kept together and handled with care." },
    { icon: "smile", title: "Friendly service", text: "Questions are welcome. Message or call us any time we're open." },
  ] satisfies { icon: IconName; title: string; text: string }[],

  steps: [
    { title: "Submit your request", text: "Tell us what you need using the quote form. It takes about a minute." },
    { title: "We review your needs", text: "We look at the service, amount, and any special instructions." },
    { title: "We confirm the details", text: "We contact you with the quotation and the pickup or drop-off schedule." },
    { title: "Your laundry gets done", text: "We clean your laundry and let you know when it's ready." },
  ],

  about: {
    intro:
      "FreshFold Laundry is a local laundry shop that helps busy households and workers keep up with their washing.",
    /** One string per paragraph. Write the client's real story; don't invent history. */
    story: [
      "We started this business to give our neighbors a simple, reliable place to bring their laundry, so they can spend less time washing and more time on everything else.",
      "Every load is handled by our own team. We take the time to sort, wash, dry, and fold your clothes properly, and we're always happy to follow special instructions.",
    ],
    /** Optional. An empty array hides the section. */
    values: [
      { title: "Care", text: "We treat your clothes the way we'd treat our own." },
      { title: "Honesty", text: "Clear prices and clear timelines, confirmed before we start." },
      { title: "Reliability", text: "When we give you a date, we keep it." },
    ],
  },

  form: {
    /** Start of every inquiry ID, e.g. LAU-20261006-7KQ2M. */
    inquiryIdPrefix: "LAU",
    /**
     * false if the shop only takes drop-offs: the pickup and delivery questions
     * are hidden and every inquiry is recorded as "Drop-off".
     */
    offersPickupDelivery: true,
    /** The first option must stay exactly "Drop-off" (see DROP_OFF in lib/validate.ts). */
    serviceTypes: ["Drop-off", "Pickup", "Delivery", "Pickup & Delivery"],
    /** Added to the end of the service dropdown. */
    extraServiceOptions: ["Other"],
    /** How the business measures laundry. Don't assume kilograms. */
    amountLabel: "Estimated laundry amount",
    amountHint: "For example: 2 bags, about 6 kg, or 10 pieces.",
    timeSlots: ["Morning", "Afternoon", "Evening", "Any time"],
  },
};

export type SiteConfig = typeof siteConfig;

/** Every value the service dropdown accepts. The API rejects anything else. */
export const serviceOptions = [
  ...siteConfig.services.map((s) => s.name),
  ...siteConfig.form.extraServiceOptions,
];
