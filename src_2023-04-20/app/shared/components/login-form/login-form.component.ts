/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : login-form.component.ts
 * Author : jbh5310
 * Lastupdate : 2021-09-01 14:00:58
 */

import {CommonModule} from '@angular/common';
import {AfterViewInit, Component, NgModule, ViewChild} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {DxFormComponent, DxFormModule} from 'devextreme-angular/ui/form';
import {DxLoadIndicatorModule} from 'devextreme-angular/ui/load-indicator';
import {AuthService} from '../../services';
import {
  DxButtonComponent,
  DxDropDownButtonModule,
  DxPopupComponent,
  DxPopupModule,
  DxTextBoxModule
} from 'devextreme-angular';
import {APPCONSTANTS} from '../../constants/appconstants';
import {SessionStorageService} from '../../services/session-storage.service';
import {CookieService} from 'ngx-cookie-service';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonUtilService} from '../../services/common-util.service';
import themes from 'devextreme/ui/themes';
import {ProfileService} from '../../../pages/profile/profile.service';


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements AfterViewInit {
  @ViewChild(DxFormComponent) loginForm: DxFormComponent;

  @ViewChild('pwdPopup', {static: false}) pwdPopup: DxPopupComponent;
  @ViewChild('pwdPopupForm', {static: false}) pwdPopupForm: DxFormComponent;
  @ViewChild('pwdBtn', {static: false}) pwdBtn: DxButtonComponent;

  loading = false;
  formData: any = {};

  tzNames: string[];

  selectedTz: string;

  pwdPopupData = {
    changePassword: ''
  };

  country = [
    {code: 'ko', value: '한국어', icon: 'https://flagcdn.com/40x30/kr.png'},
    {code: 'en', value: 'English', icon: 'https://flagcdn.com/40x30/us.png'},
    {code: 'cn', value: '中文', icon: 'https://flagcdn.com/40x30/cn.png'},
    {code: 'jp', value: '日本語', icon: 'https://flagcdn.com/40x30/jp.png'},
  ];

  constructor(private authService: AuthService,
              private router: Router,
              private sessionStorageService: SessionStorageService,
              private cookieService: CookieService,
              public utilService: CommonUtilService,
              private service: ProfileService,
              private commonUtilSerivce: CommonUtilService) {
    this.tzNames = this.commonUtilSerivce.getTimeZoneNames();
    this.onSubmit = this.onSubmit.bind(this);
    this.pwdPopupSaveClick = this.pwdPopupSaveClick.bind(this);
    this.utilService.setCompanyId(null);
    this.utilService.setCompany(null);
  }

  ngAfterViewInit(): void {
    const locale = this.commonUtilSerivce.getLanguage();
    this.commonUtilSerivce.setLanguage(locale);

    let timeZone = this.cookieService.get(APPCONSTANTS.TEXT_TIMEZONE);

    if ((timeZone !== 'undefined') && timeZone && (timeZone !== '') && (timeZone !== undefined)) {
      this.selectedTz = timeZone;
    } else {
      timeZone = this.commonUtilSerivce.getBrowserTimeZone();
    }
    this.commonUtilSerivce.useLocale(timeZone);

    if (this.cookieService.get(APPCONSTANTS.TOKEN_USER_TENANT_KEY)) {
      // this.formData.controls.tenant.value = this.cookieService.get(APPCONSTANTS.TOKEN_USER_TENANT_KEY);
      this.loginForm.instance.getEditor('tenant').option('value', this.cookieService.get(APPCONSTANTS.TOKEN_USER_TENANT_KEY));
      this.loginForm.instance.getEditor('id').option('value', this.cookieService.get(APPCONSTANTS.TOKEN_USER_USERID_KEY));
      // this.loginForm.instance.getEditor('rememberMe').option('value', this.cookieService.get(APPCONSTANTS.TOKEN_USER_REMEMBERME));
    } else {
      const DEFAULT_TENANT = '1000';  // TODO 상수로 이동 할 것인가
      this.loginForm.instance.getEditor('tenant').option('value', DEFAULT_TENANT);

      // 기본 테넌트 - 처음에 테넌트가 없어서 다국어를 로드할 수가 없음
      this.cookieService.set(APPCONSTANTS.TOKEN_USER_TENANT_KEY, DEFAULT_TENANT, 7);
    }

    this.loginForm.instance.getEditor('Country').option('value', locale);
    this.loginForm.instance.getEditor('TimeZone').option('value', timeZone);

    themes.current(this.commonUtilSerivce.getUtSetting().theme);  // 저장된 테마 적용

    // 로딩 페이지 숨기기
    const spinner = document.querySelector('#nb-global-spinner');
    if (spinner) {
      this.commonUtilSerivce.dictionary = null;
      this.commonUtilSerivce.setLanguage(locale);
      this.commonUtilSerivce.initMessages().then(() => {
        console.log('로드 완료');
        spinner.setAttribute('style', 'display: none;');
      });
    }

  }

  async onSubmit(): Promise<void> {
    const {tenant, id, password, TimeZone, Country} = this.formData;

    this.loading = true;

    // 공통 조회변수 초기화
    await localStorage.removeItem(APPCONSTANTS.TEXT_WAREHOUSE_ID);
    await localStorage.removeItem(APPCONSTANTS.TEXT_WAREHOUSE_VO);
    await localStorage.removeItem(APPCONSTANTS.TEXT_OWNER_ID);

    if (!this.formData.tenant) {
      const msg = this.commonUtilSerivce.convert1('tenant_none', 'tenant가 없습니다.');

      this.utilService.notify_error(msg);
      return;
    }

    // Tenant를 헤더에 담기 위해 쿠키에 먼저 담음.
    this.cookieService.set(APPCONSTANTS.TOKEN_USER_TENANT_KEY, tenant, 7);


    const result = await this.authService.logIn(tenant, id, password, Country);

    if (!result.success) {
      this.loading = false;
      this.utilService.notify_error(result.msg);
      // notify(result.msg, 'error', 2000);
    } else {
      console.log('login');
      const companyId = result.data.companyId !== null ? result.data.companyId.toString() : null;
      this.cookieService.set(APPCONSTANTS.TOKEN_USER_TENANT_KEY, result.data.tenant, 7);
      this.cookieService.set(APPCONSTANTS.TOKEN_USER_USERID_KEY, result.data.user, 7);
      this.cookieService.set(APPCONSTANTS.TOKEN_USER_USERID_UID, result.data.uid.toString(), 7);
      this.cookieService.set(APPCONSTANTS.TOKEN_USER_COMPANYID, companyId, 7);
      // this.cookieService.set(APPCONSTANTS.TOKEN_USER_REMEMBERME, rememberMe, 7);

      this.cookieService.set(APPCONSTANTS.TEXT_TIMEZONE, TimeZone, 7);
      this.cookieService.set(APPCONSTANTS.TEXT_LOCALE, Country, 7);

      this.commonUtilSerivce.useLocale(TimeZone);

      // 최초 로그인 체크
      if (result.code === APPCONSTANTS.CHANGE_PASSWORD_REQUIRED) {
        this.formData.uid = result.data.uid;
        this.pwdPopup.visible = true;
        return;
        // 최초 로그인시 비밀번호 변경 팝업 호출
      }
    }
  }

  onCreateAccountClick = () => {
    // this.router.navigate(['/create-account']);
    this.returnMSG();
  }

  countryChanged = (e: any) => {
    let lang: string;
    lang = e.value;
    localStorage.setItem(APPCONSTANTS.TEXT_LOCALE, lang);
  }

  returnMSG(): void {
    const msg = this.commonUtilSerivce.convert1('Please contact the administrator.', 'Please contact the administrator.');
    this.commonUtilSerivce.notify_error(msg);
  }

  async pwdPopupSaveClick(): Promise<void> {
    const pwdPopData = this.pwdPopupForm.instance.validate();
    const saveData = Object.assign(this.formData, this.pwdPopupData);

    if (pwdPopData.isValid) {

      try {
        const result = await this.service.updatePwd(saveData);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.pwdPopup.visible = false;
          this.loginForm.instance.getEditor('password').option('value', '');
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  passwordComparison = () => this.pwdPopupData.changePassword;

  onHidden(): void {
    this.pwdPopupForm.instance.resetValues();
  }

  onEnterKey(e): void {
    if (e.dataField === 'password') {
      this.onSubmit();
    }

  }
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    DxFormModule,
    DxLoadIndicatorModule,
    DxDropDownButtonModule,
    DxTextBoxModule,
    ReactiveFormsModule,
    DxPopupModule,
  ],
  declarations: [LoginFormComponent],
  exports: [LoginFormComponent]
})
export class LoginFormModule {
}
