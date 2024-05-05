import { Component } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatBottomSheetModule, RouterOutlet],
})
export class AppComponent {
  constructor(translate: TranslateService) {
    const supportedLangs = ['en'];
    const [defaultLang] = supportedLangs;

    translate.addLangs(supportedLangs);
    translate.setDefaultLang(defaultLang);

    const browserLang = translate.getBrowserLang();
    const matchLangs = new RegExp(supportedLangs.join('|'));
    const langMatch = browserLang.match(matchLangs);

    translate.use(langMatch ? browserLang : defaultLang);
  }
}
