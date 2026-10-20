// All data here is fake. No real members, APIs or backend.

export const SUPPORT_PHONE_DISPLAY = "1-888-445-1069";
export const SUPPORT_PHONE_TEL = "tel:+18884451069";

export const TRACKING_NUMBER = "9400 1000 0000 0000 0000";
export const TRACKING_URL = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${TRACKING_NUMBER.replace(/\s/g, "")}`;

export type Status = "ordered" | "preparingToShip" | "shipped" | "outForDelivery" | "delivered";
export type Mode = "no-change" | "full";

export type Address = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
};

export type Member = {
  key: string;
  firstName: string;
  lastName: string;
  memberId: string;
  dob: string;
  status: Status;
  aep: boolean;
};

export const DEFAULT_ADDRESS: Address = {
  line1: "1234 Main St",
  line2: "Apt 2",
  city: "Louisville",
  state: "KY",
  zip: "40202",
};

export const CONTACT = {
  phone: "972-762-7700",
  email: "janesmith123@gmail.com",
};

export const MEMBERS: Member[] = [
  { key: "smith", firstName: "Jane", lastName: "Smith", memberId: "H12345678", dob: "04/12/1956", status: "ordered", aep: false },
  { key: "lopez", firstName: "Jane", lastName: "Lopez", memberId: "H10000002", dob: "06/03/1950", status: "ordered", aep: true },
  { key: "nguyen", firstName: "Jane", lastName: "Nguyen", memberId: "H10000003", dob: "09/22/1948", status: "preparingToShip", aep: false },
  { key: "johnson", firstName: "Jane", lastName: "Johnson", memberId: "H10000004", dob: "01/15/1952", status: "shipped", aep: false },
  { key: "patel", firstName: "Jane", lastName: "Patel", memberId: "H10000005", dob: "11/30/1949", status: "outForDelivery", aep: false },
  { key: "brown", firstName: "Jane", lastName: "Brown", memberId: "H10000006", dob: "07/08/1955", status: "delivered", aep: false },
];

export const STATUS_LABEL: Record<Status, string> = {
  ordered: "Ordered",
  preparingToShip: "Preparing to ship",
  shipped: "Shipped",
  outForDelivery: "Out for delivery",
  delivered: "Delivered",
};

export function findMember(lastName: string, memberId: string, dob: string): Member | undefined {
  const last = lastName.trim().toLowerCase();
  const id = memberId.trim().toUpperCase();
  return MEMBERS.find((m) => m.lastName.toLowerCase() === last && m.memberId === id && m.dob === dob.trim());
}

export function memberByKey(key: string | null): Member | undefined {
  return MEMBERS.find((m) => m.key === key);
}

export function formatAddressLines(address: Address): [string, string] {
  const street = address.line2 ? `${address.line1}, ${address.line2}` : address.line1;
  return [street, `${address.city}, ${address.state} ${address.zip}`];
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "04/12/1956" -> "April 12, 1956" */
export function formatLongDate(mmddyyyy: string): string {
  const [mm, dd, yyyy] = mmddyyyy.split("/").map(Number);
  return `${MONTHS[mm - 1]} ${dd}, ${yyyy}`;
}

export function isValidDob(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const [mm, dd, yyyy] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(yyyy, mm - 1, dd);
  return date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd && yyyy >= 1900 && date < new Date();
}

/** Formats raw digits into mm/dd/yyyy as the member types. */
export function maskDob(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// --- Address helpers (mock "Google" autocomplete + validation) ---

export type Suggestion = { line1: string; city: string; state: string; zip: string };

export const SUGGESTIONS: Suggestion[] = [
  { line1: "5510 Abrams Road", city: "Dallas", state: "TX", zip: "75209" },
  { line1: "5519 Arapaho Road", city: "Dallas", state: "TX", zip: "75240" },
  { line1: "5515 Glen Lakes", city: "Dallas", state: "TX", zip: "75231" },
  { line1: "551 South Plano Road", city: "Dallas", state: "TX", zip: "75243" },
  { line1: "5518 Alpha Road", city: "Dallas", state: "TX", zip: "75240" },
];

/**
 * Mock "Google" autocomplete: suggestions appear from the first character typed. Addresses starting with the
 * query come first, then ones containing it; with no match the full list still shows, like a real lookup.
 */
export function matchSuggestions(query: string): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts = SUGGESTIONS.filter((s) => s.line1.toLowerCase().startsWith(q));
  const contains = SUGGESTIONS.filter((s) => !starts.includes(s) && s.line1.toLowerCase().includes(q));
  const matches = [...starts, ...contains];
  return matches.length ? matches : SUGGESTIONS;
}

// ZIP prefixes the prototype knows about; anything else passes as long as it's 5 digits.
const CITY_ZIP_PREFIX: Record<string, string> = {
  "dallas|TX": "752",
  "louisville|KY": "402",
};
const ZIP_PREFIX_STATE: Record<string, string> = { "75": "TX", "40": "KY" };

export function zipMatches(address: Address): boolean {
  if (!/^\d{5}$/.test(address.zip)) return false;
  const prefix = CITY_ZIP_PREFIX[`${address.city.trim().toLowerCase()}|${address.state}`];
  if (prefix && !address.zip.startsWith(prefix)) return false;
  const zipState = ZIP_PREFIX_STATE[address.zip.slice(0, 2)];
  if (zipState && zipState !== address.state) return false;
  return true;
}

const ABBREVIATIONS: [RegExp, string][] = [
  [/\bRoad\b/i, "Rd"],
  [/\bStreet\b/i, "St"],
  [/\bAvenue\b/i, "Ave"],
  [/\bDrive\b/i, "Dr"],
  [/\bBoulevard\b/i, "Blvd"],
  [/\bLane\b/i, "Ln"],
];

/** Mock USPS standardization used for the "Recommended" address. */
export function recommendAddress(address: Address): Address {
  let line1 = address.line1.trim();
  for (const [pattern, short] of ABBREVIATIONS) line1 = line1.replace(pattern, short);
  return { ...address, line1, city: address.city.trim() };
}

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
  "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
  "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export const MOCK_DELAY_MS = 1200;
