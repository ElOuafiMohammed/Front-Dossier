import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import localeFrExtra from '@angular/common/locales/extra/fr';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CoreModule } from 'app/core/core.module';

import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { AppService } from './app.service';
import { GlobalState } from './global.state';
import { PagesModule } from './pages/pages.module';
import { NgaModule } from './theme/nga.module';

// registerLocaleData(localeFr);

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'L',
  },
  display: {
    dateInput: 'L',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Application wide providers for datePickers from Material
const MATERIAL_PROVIDERS = [
  { provide: MAT_DATE_LOCALE, useValue: 'fr' },
  { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  {
    provide: APP_INITIALIZER, useFactory: (appService: AppService) => {
      return () =>
        appService.testFunction();
    },
    deps: [AppService],
    multi: true
  }

]

// Application wide providers used for theming
const APP_PROVIDERS = [
  GlobalState
];

registerLocaleData(localeFr, 'fr', localeFrExtra);

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    }),
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    NgaModule.forRoot(),
    CoreModule,
    PagesModule,
    routing
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    APP_PROVIDERS,
    MATERIAL_PROVIDERS,
    AppService,
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    {provide: LOCALE_ID,
    useValue: 'fr-FR' // 'de-DE' for Germany, 'fr-FR' for France ...
    }
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
}
