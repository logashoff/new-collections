import { ChangeDetectionStrategy, Component, Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * @description
 *
 * HTML image element directive that will populate default image when image source
 * link is broken.
 */
@Directive({
  selector: '[appImage]',
})
export class ImageDirective {
  @HostListener('error') error() {
    this.el.nativeElement.src = 'favicon.ico';
  }

  constructor(private el: ElementRef) {}
}

/**
 * @description
 *
 * Displays images as small icons.
 */
@Component({
  selector: 'app-image-icon',
  templateUrl: './image-icon.component.html',
  styleUrls: ['./image-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageIconComponent {
  @Input() source: string;
}
