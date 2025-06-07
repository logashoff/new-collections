import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[dataTestId]',
  host: {
    '[attr.data-testid]': 'attr()',
  },
})
export class DataTestIdDirective {
  readonly dataTestId = input.required<string>();
  readonly attr = computed<string>(() =>
    this.dataTestId()
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLocaleLowerCase()
  );
}
