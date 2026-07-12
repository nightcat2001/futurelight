import { pages } from "./data.js";

export function currentPage() {
  const hash = window.location.hash || pages[0].route;
  return pages.find((page) => page.route === hash) || pages[0];
}

export function goTo(pageId) {
  const page = pages.find((item) => item.id === pageId);
  if (page) window.location.hash = page.route;
}

export function nextPageId(pageId) {
  const index = pages.findIndex((item) => item.id === pageId);
  return pages[Math.min(index + 1, pages.length - 1)].id;
}

export function previousPageId(pageId) {
  const index = pages.findIndex((item) => item.id === pageId);
  return pages[Math.max(index - 1, 0)].id;
}
