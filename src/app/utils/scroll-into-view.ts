/**
 * Complete event delay
 */
const callbackTimeout = 75;

/**
 * Clear complete event timeout to prevent promise resolve before scrolling has finished
 */
let scrollTimeoutId: any;

/**
 * Scrolls specified element into view and resolves promise when scrolling is complete
 */
export function scrollIntoView(element: HTMLElement): Promise<HTMLElement> {
  return new Promise((resolve) => {
    function handleScroll() {
      clearInterval(scrollTimeoutId);

      scrollTimeoutId = setTimeout(() => {
        window.removeEventListener('scroll', handleScroll);
        resolve(element);
      }, callbackTimeout);
    }

    window.addEventListener('scroll', handleScroll);
    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    handleScroll();
  });
}
