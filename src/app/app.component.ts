import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(translate: TranslateService) {
    const supportedLangs = ['en'];
    const [ defaultLang ] = supportedLangs;

    translate.addLangs(supportedLangs);
    translate.setDefaultLang(defaultLang);

    const browserLang = translate.getBrowserLang();
    const matchLangs = new RegExp(supportedLangs.join('|'));
    const langMatch = browserLang.match(matchLangs);

    translate.use(langMatch ? browserLang : defaultLang);
  }
}
