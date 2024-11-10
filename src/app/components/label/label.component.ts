import { ChangeDetectionStrategy, Component, HostBinding, input, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'nc-label',
  standalone: true,
  imports: [],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  readonly color = input<ThemePalette>();

  @HostBinding('class.theme-primary') get primaryColor() {
    return this.color() === 'primary';
  }

  @HostBinding('class.theme-warn') get warnColor() {
    return this.color() === 'warn';
  }

  @HostBinding('class.theme-accent') get accentColor() {
    return this.color() === 'accent';
  }
}
