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
  | "home" | "building" | "sparkle" | "spray" | "hammer" | "sofa" | "box"
  | "pin" | "tag" | "timer" | "shield" | "smile";

export type Service = {
  /** Used in links like /request-a-quote?service=deep-cleaning. Keep it stable. */
  id: string;
  name: string;
  icon: IconName;
  /** One line, shown on the home page. */
  summary: string;
  /** Shown on the services page. */
  description: string;
  /** Shown exactly as written, e.g. "From ₱1,500". null shows "Ask for a quote". Never guess. */
  price: string | null;
};

export const siteConfig = {
  contentReviewed: false,

  /**
   * Show the "DEMO WEBSITE" banner and badge. It is always on while
   * `contentReviewed` is false (sample content). Set this to true to keep
   * showing it on a reviewed site, e.g. a client preview before launch.
   */
  demoMode: false,

  /** The live address of the site, no trailing slash. */
  siteUrl: "https://www.example.com",

  business: {
    /** Placeholder: confirm the exact business name with the client. */
    name: "Queen Clean",
    headline: ["Spotless spaces.", "Zero stress."] as const,
    description: "Professional cleaning services for homes and businesses in Bacolod City.",
    /** Shown above the home headline and in search results. */
    serviceArea: "Bacolod City",

    phone: "0917 000 0000",
    email: "hello@example.com",
    address: {
      streetAddress: "123 Sample Street, Barangay Sample",
      addressLocality: "Bacolod City",
      addressRegion: "Negros Occidental",
      postalCode: "6100",
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
      { days: "Monday to Saturday", time: "8:00 AM – 5:00 PM" },
      { days: "Sunday", time: "Closed" },
    ],
  },

  services: [
    {
      id: "house-cleaning",
      name: "House Cleaning",
      icon: "home",
      summary: "Regular cleaning to keep your home fresh and tidy.",
      description:
        "Dusting, sweeping, mopping, and wiping down surfaces, plus kitchen and bathroom cleaning. A good fit for weekly or monthly upkeep.",
      price: null,
    },
    {
      id: "deep-cleaning",
      name: "Deep Cleaning",
      icon: "sparkle",
      summary: "A thorough top-to-bottom clean, including the hard-to-reach spots.",
      description:
        "A more detailed clean for places that haven't been cleaned in a while: corners, grout, fixtures, and areas regular cleaning skips. Tell us what needs the most attention.",
      price: null,
    },
    {
      id: "office-cleaning",
      name: "Office & Commercial Cleaning",
      icon: "building",
      summary: "Clean, welcoming workspaces, shops, and business premises.",
      description:
        "Cleaning for offices, shops, clinics, and other business premises, on a one-time or regular schedule that suits your opening hours.",
      price: null,
    },
    {
      id: "move-in-out",
      name: "Move-in / Move-out Cleaning",
      icon: "box",
      summary: "Get a place ready for new occupants, or ready to hand back.",
      description:
        "A full clean of an empty home or unit before you move in, or before you return the keys.",
      price: null,
    },
    {
      id: "post-construction",
      name: "Post-Construction Cleaning",
      icon: "hammer",
      summary: "Dust, debris, and residue cleared after renovation or building work.",
      description:
        "Cleaning after construction or renovation, including fine dust, paint splatter, and leftover debris, so the space is ready to use.",
      price: null,
    },
    {
      id: "upholstery-cleaning",
      name: "Sofa, Mattress & Carpet Cleaning",
      icon: "sofa",
      summary: "Fresh upholstery, mattresses, and carpets.",
      description:
        "Deep cleaning for sofas, mattresses, and carpets. Tell us the type and size so we can give you an accurate quote.",
      price: null,
    },
  ] as Service[],

  /** Shown under the services list. Keep it factual. */
  pricingNote:
    "Final prices depend on the size and condition of the space and the work needed. Send a request and we'll confirm your quote before we start.",

  /** "Why choose us". Keep only what the client can actually stand behind. */
  benefits: [
    { icon: "pin", title: "Local to Bacolod", text: "A Bacolod-based team that knows the area and is easy to reach." },
    { icon: "sparkle", title: "Quality cleaning", text: "We pay attention to the details, from corners to fixtures." },
    { icon: "tag", title: "Clear pricing", text: "You get a quote before we start, so there are no surprises." },
    { icon: "timer", title: "Reliable scheduling", text: "We confirm a date and time with you and keep to it." },
    { icon: "shield", title: "Careful with your space", text: "We treat your home or workplace and your belongings with care." },
    { icon: "smile", title: "Friendly service", text: "Questions are welcome. Message or call us any time we're open." },
  ] satisfies { icon: IconName; title: string; text: string }[],

  steps: [
    { title: "Submit your request", text: "Tell us about your space and what you need using the quote form. It takes about a minute." },
    { title: "We review your needs", text: "We look at the service, the property, and any special instructions." },
    { title: "We confirm the details", text: "We contact you with the quotation and agree a schedule." },
    { title: "We clean your space", text: "Our team arrives, gets to work, and leaves your place fresh." },
  ],

  about: {
    intro:
      "Queen Clean is a local cleaning company serving homes and businesses in Bacolod City.",
    /** One string per paragraph. Write the client's real story; don't invent history. */
    story: [
      "We started this business to give households and businesses in Bacolod a reliable, friendly cleaning service, so people can spend less time cleaning and more time on what matters to them.",
      "Every job is handled by our own team. We take the time to listen to what you need, clean carefully, and follow any special instructions.",
    ],
    /** Optional. An empty array hides the section. */
    values: [
      { title: "Care", text: "We treat your space the way we'd treat our own." },
      { title: "Honesty", text: "Clear prices and clear timelines, confirmed before we start." },
      { title: "Reliability", text: "When we give you a date, we keep it." },
    ],
  },

  form: {
    /** Start of every inquiry ID, e.g. QC-20261006-7KQ2M. */
    inquiryIdPrefix: "QC",
    /** Added to the end of the service dropdown. */
    extraServiceOptions: ["Other"],
    /** What kind of place is being cleaned. Customers must pick one. */
    propertyTypes: ["House", "Condo / Apartment", "Office / Commercial", "Other"],
    /** How the business sizes a job. Don't assume square metres. */
    sizeLabel: "Approximate size",
    sizeHint: "For example: 3 bedrooms, about 80 sqm, or a 2-storey house.",
    timeSlots: ["Morning", "Afternoon", "Any time"],
  },
};

export type SiteConfig = typeof siteConfig;

/** True while the site is a demo: sample content, or demoMode switched on. */
export const isDemo = !siteConfig.contentReviewed || siteConfig.demoMode;

/** Every value the service dropdown accepts. The API rejects anything else. */
export const serviceOptions = [
  ...siteConfig.services.map((s) => s.name),
  ...siteConfig.form.extraServiceOptions,
];
