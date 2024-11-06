import { Component, LOCALE_ID } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterOutlet } from '@angular/router';

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
export class AppComponent {}
