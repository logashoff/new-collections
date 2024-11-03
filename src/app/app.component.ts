import { Component } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterOutlet } from '@angular/router';
import { Locale, setDefaultOptions } from 'date-fns';
import { enUS, es } from 'date-fns/locale';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatBottomSheetModule, RouterOutlet],
})
export class AppComponent {
  constructor() {
    const browserLocale = chrome.i18n.getUILanguage();

    let dateLocale: Locale;

    switch (browserLocale) {
      case 'es':
      case 'es-ES':
        dateLocale = es;
        break;
      default:
        dateLocale = enUS;
        break;
    }

    setDefaultOptions({
      locale: dateLocale,
    });
  }
}
