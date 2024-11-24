import { Component, LOCALE_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'nc-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet],
  providers: [
    {
      provide: LOCALE_ID,
      useFactory: () => chrome.i18n.getUILanguage(),
    },
  ],
})
export class AppComponent {}
