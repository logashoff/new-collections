const callbackTimeout = 75;
let scrollTimeoutId: any;

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
