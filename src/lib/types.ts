export const APPLICATION_STATUSES = [
  "a_envoyer",
  "envoyee",
  "ouverte",
  "relance",
  "entretien",
  "acceptee",
  "refusee",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  a_envoyer: "À envoyer",
  envoyee: "Envoyée",
  ouverte: "Ouverte",
  relance: "Relancée",
  entretien: "Entretien",
  acceptee: "Acceptée",
  refusee: "Refusée",
};

// Couleurs (classes Tailwind) par statut — minimal, restylable.
export const STATUS_STYLES: Record<ApplicationStatus, string> = {
  a_envoyer: "bg-zinc-100 text-zinc-700",
  envoyee: "bg-blue-100 text-blue-700",
  ouverte: "bg-violet-100 text-violet-700",
  relance: "bg-amber-100 text-amber-700",
  entretien: "bg-cyan-100 text-cyan-700",
  acceptee: "bg-green-100 text-green-700",
  refusee: "bg-red-100 text-red-700",
};

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export interface Application {
  id: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  role: string | null;
  contact_name: string | null;
  contact_email: string | null;
  status: ApplicationStatus;
  notes: string | null;
  applied_at: string | null;
}

export interface TrackedLink {
  id: string;
  created_at: string;
  application_id: string | null;
  slug: string;
  destination_url: string;
  label: string | null;
  is_active: boolean;
}

export interface LinkOpen {
  id: string;
  opened_at: string;
  link_id: string;
  ip: string | null;
  country: string | null;
  city: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  is_bot: boolean;
  bot_reason: string | null;
}

export const MEDIA_TYPES = ["ecrit", "audio", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_LABELS: Record<MediaType, string> = {
  ecrit: "Écrit",
  audio: "Audio",
  video: "Vidéo",
};

export interface Publication {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  media_type: MediaType;
  outlet: string | null;
  published_date: string | null;
  url: string | null;
  category: string | null;
  excerpt: string | null;
  cover_image_url: string | null;
  display_order: number;
  published: boolean;
}

export interface PageVisit {
  id: string;
  created_at: string;
  path: string;
  referrer: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  is_bot: boolean;
  bot_reason: string | null;
}
