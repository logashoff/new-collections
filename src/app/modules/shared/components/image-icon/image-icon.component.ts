import { ChangeDetectionStrategy, Component, Directive, ElementRef, HostBinding, HostListener, Input } from '@angular/core';
import { usesDarkMode } from '@lib';

/**
 * Default dark theme tab icon.
 */
const darkIcon = 'icon_32_dark.png';

/**
 * Default light theme tab icon.
 */
const lightIcon = 'icon_32.png';

/**
 * Icons directory.
 */
const iconsDir = 'assets/icons';

/**
 * Dark icon full path.
 */
const darkIconPath = `${iconsDir}/${darkIcon}`;

/**
 * Light icon full path.
 */
const lightIconPath = `${iconsDir}/${lightIcon}`;

/**
 * Icon path depends on browser dark theme.
 */
const iconPath = usesDarkMode() ? darkIconPath : lightIconPath;

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
  /**
   * Handles img element src loading error.
   */
  @HostListener('error') error() {
    this.el.nativeElement.src = iconPath;
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
  /**
   * Image source path.
   */
  @Input() source: string;

  /**
   * Icon size.
   */
  @Input() size: 'medium' | 'small' = 'medium';

  @HostBinding('class.medium') get medium(): boolean {
    return this.size === 'medium';
  };

  @HostBinding('class.small') get small(): boolean {
    return this.size === 'small';
  };
}
