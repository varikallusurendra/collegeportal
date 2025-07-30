// API for events section

export async function fetchAllEvents() {
  const res = await fetch('/api/events', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchCompanies() {
  const events = await fetchAllEvents();
  // Get unique companies
  return Array.from(new Set(events.map((e: any) => e.company).filter(Boolean)));
}

export async function fetchYears(company: string) {
  const events = await fetchAllEvents();
  // Get unique years for company
  return Array.from(new Set(events.filter((e: any) => e.company === company).map((e: any) => new Date(e.startDate).getFullYear()))).sort();
}

export async function fetchEventsByCompanyYear(company: string, year: number) {
  const events = await fetchAllEvents();
  return events.filter((e: any) => e.company === company && new Date(e.startDate).getFullYear() === year);
}

export async function fetchEventById(id: number) {
  const events = await fetchAllEvents();
  return events.find((e: any) => e.id === id);
} 