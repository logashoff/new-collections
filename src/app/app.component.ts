import { Component, Inject, LOCALE_ID } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterOutlet } from '@angular/router';
import { Locale, setDefaultOptions } from 'date-fns';
import { enUS, es, ja, pt, ru } from 'date-fns/locale';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatBottomSheetModule, RouterOutlet],
  providers: [
    {
      provide: LOCALE_ID,
      useFactory: () => chrome.i18n.getUILanguage(),
    },
  ],
})
export class AppComponent {
  constructor(@Inject(LOCALE_ID) locale: string) {
    let dateLocale: Locale;

    switch (locale) {
      case 'es':
      case 'es-ES':
        dateLocale = es;
        break;
      case 'ja':
        dateLocale = ja;
        break;
      case 'pt-PT':
        dateLocale = pt;
        break;
      case 'ru':
        dateLocale = ru;
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
