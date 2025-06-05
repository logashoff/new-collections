import { computed, Directive, input } from '@angular/core';

@Directive({
  selector: '[dataTestId]',
  host: {
    '[attr.data-testid]': 'attr()',
  },
})
export class DataTestIdDirective {
  readonly dataTestId = input.required<string>();
  readonly attr = computed<string>(() => this.dataTestId().toLocaleLowerCase().replace(' ', '-'));
}
