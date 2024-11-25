import { Timeout } from './models';

/**
 * Scroll complete event delay targets worst case 15 FPS animation
 */
const callbackTimeout = (1 / 15) * 1000;

/**
 * Clear complete event timeout to prevent promise resolve before scrolling has finished
 */
let scrollTimeoutId: Timeout;

/**
 * Scrolls specified element into view and resolves promise when scrolling is complete
 */
export function scrollIntoView(
  element: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center', inline: 'center' }
): Promise<HTMLElement> {
  return new Promise((resolve) => {
    const { body } = document;
    const handleScroll = () => {
      clearInterval(scrollTimeoutId);

      scrollTimeoutId = setTimeout(() => {
        body.removeEventListener('scroll', handleScroll);
        resolve(element);
      }, callbackTimeout);
    };

    body.addEventListener('scroll', handleScroll);
    element.scrollIntoView(options);
    handleScroll();
  });
}
