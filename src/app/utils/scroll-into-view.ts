/**
 * Complete event delay
 */
const callbackTimeout = 75;

/**
 * Clear complete event timeout to prevent promise resolve before scrolling has finished
 */
let scrollTimeoutId: any;

/**
 * Checks if element is scrollable
 */
const isScrollable = (element: HTMLElement): boolean =>
  element.scrollHeight > element.clientHeight && getComputedStyle(element).overflow !== 'hidden';

/**
 * Scrolls specified element into view and resolves promise when scrolling is complete
 */
export function scrollIntoView(element: HTMLElement): Promise<HTMLElement> {
  let scrollElement: HTMLElement = element;
  while (scrollElement) {
    scrollElement = scrollElement.parentElement;

    if (!scrollElement || isScrollable(scrollElement)) {
      break;
    }
  }

  return new Promise((resolve) => {
    if (scrollElement) {
      function handleScroll() {
        clearInterval(scrollTimeoutId);

        scrollTimeoutId = setTimeout(() => {
          scrollElement.removeEventListener('scroll', handleScroll);
          resolve(element);
        }, callbackTimeout);
      }

      scrollElement.addEventListener('scroll', handleScroll);
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      handleScroll();
    } else {
      resolve(element);
    }
  });
}
