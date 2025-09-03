export function findElement<T extends HTMLElement>(selector: string): T {
  let element = document.querySelector(selector)
  if (!element) {
    throw new Error(`Element not found, selector: ${selector}`)
  }
  return element as T
}
