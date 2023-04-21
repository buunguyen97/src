/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : app.module.ts
 * Author : jbh5310
 * Lastupdate : 2021-09-21 16:08:12
 */

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {SideNavOuterToolbarModule, SingleCardModule} from './layouts';
import {
  ChangePasswordFormModule,
  CreateAccountFormModule,
  FooterModule,
  LoginFormModule,
  ResetPasswordFormModule
} from './shared/components';
import {AppInfoService, AuthService, ScreenService} from './shared/services';
import {UnauthenticatedContentModule} from './unauthenticated-content';
import {AppRoutingModule} from './app-routing.module';
import {JHttpService} from './shared/services/jhttp.service';
import {SessionStorageService} from './shared/services/session-storage.service';
import {authInterceptorProviders} from './shared/interceptors/jhttp.interceptor';
import {CookieService} from 'ngx-cookie-service';
import {WindowRefService} from './shared/window-ref.service';
import {CommonUtilService} from './shared/services/common-util.service';
import {CommonCodeService} from './shared/services/common-code.service';
import {JTimeZoneService} from './shared/services/jtime-zone.service';
import config from 'devextreme/core/config';
import {HttpClientModule} from '@angular/common/http';
import {SoModule} from './pages/so/so.module';
import {InvModule} from './pages/inv/inv.module';
import {RcvModule} from './pages/rcv/rcv.module';
import {MmModule} from './pages/mm/mm.module';
import {ComponentBehaviorService} from './shared/services/component-behavior.service';
import {DevExtremeModule, DxButtonModule, DxDataGridModule} from 'devextreme-angular';

import {SasdModule} from './pages/sasd/sasd.module';
import {SacsModule} from './pages/sacs/sacs.module';
import {SaorModule} from './pages/saor/saor.module';
import {SarcModule} from './pages/sarc/sarc.module';
import {SacoModule} from './pages/saco/saco.module';
import {SaclModule} from './pages/sacl/sacl.module';
import {SabuModule} from './pages/sabu/sabu.module';
import {SastModule} from './pages/sast/sast.module';
import {SacaModule} from './pages/saca/saca.module';
import {QrpageComponent} from './shared/components/qrpage/qrpage.component';

@NgModule({
  declarations: [
    AppComponent,
    QrpageComponent
  ],
  imports: [
    BrowserModule,
    SideNavOuterToolbarModule,
    SingleCardModule,
    FooterModule,
    ResetPasswordFormModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    AppRoutingModule,
    HttpClientModule,
    RcvModule,
    InvModule,
    SoModule,
    MmModule,
    DxButtonModule,
    DxDataGridModule,
    DevExtremeModule,
    DxButtonModule,
    DxDataGridModule,
    DevExtremeModule,
    SasdModule,
    SacsModule,
    SaorModule,
    SarcModule,
    SacoModule,
    SaclModule,
    SabuModule,
    SastModule,
    SacaModule
  ],
  providers: [AuthService,
    ScreenService,
    AppInfoService,
    JHttpService,
    SessionStorageService,
    authInterceptorProviders,
    CookieService,
    WindowRefService,
    CommonUtilService,
    CommonCodeService,
    JTimeZoneService,
    ComponentBehaviorService
  ],
  bootstrap: [AppComponent],
  exports: []
})
export class AppModule {

  constructor() {
    config({
      rtlEnabled: false,
      forceIsoDateParsing: true,
    });
  }
}


// AoT requires an exported function for factories
// export function httpTranslateLoader(http: HttpClient): TranslateHttpLoader {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// tslint:disable-next-line:typedef
export function windowFactory() {
  return window;
}
