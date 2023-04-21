/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : common-util.service.ts
 * Author : jbh5310
 * Lastupdate : 2021-09-01 14:00:58
 */

import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {APPCONSTANTS} from '../constants/appconstants';
import notify from 'devextreme/ui/notify';
import {JHttpService} from './jhttp.service';
import {JTimeZoneService} from './jtime-zone.service';
import {Moment} from 'moment';
import {firstValueFrom, Observable} from 'rxjs';
import {ApiResult} from '../vo/api-result';
import {formatMessage, loadMessages, locale} from 'devextreme/localization';
import {CommonCodeService} from './common-code.service';
import {custom, CustomDialogOptions} from 'devextreme/ui/dialog';
import {forEach, isNaN} from 'lodash';
import {RcvCommonUtils} from '../../pages/rcv/rcvCommonUtils';
import {navigation} from '../../app-navigation';

@Injectable({
  providedIn: 'root'
})
export class CommonUtilService {

  isShowVisibleColumn = true;
  relatedCompanyId: number;

  relatedCompany: string;

  constructor(private cookieService: CookieService,
              private http: JHttpService,
              private codeService: CommonCodeService,
              private timeService: JTimeZoneService) {
  }

  set dictionary(dic: any) {
    this._dictionary = dic;
  }

  get dictionary(): any {
    return this._dictionary;
  }

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/api/v1/mm/util`;

  dateRange: any = -7;

  private _dictionary: any = {};

  public setDateRange(dateRange: number): void {
    this.dateRange = dateRange;
  }

  alpoterInfo: any = {};
  public setAlpoterInfo(alpoterInfo: any): void {
    this.alpoterInfo = alpoterInfo;
  }

  getLanguage(): string {
    const lang = localStorage.getItem(APPCONSTANTS.TEXT_LOCALE);
    return lang != null ? lang : APPCONSTANTS.LANG_DEFAULT;
  }

  setLanguage(lang: string): void {
    localStorage.removeItem(APPCONSTANTS.TEXT_LOCALE);
    localStorage.setItem(APPCONSTANTS.TEXT_LOCALE, lang);
  }

  getTenant(): string {
    return this.cookieService.get(APPCONSTANTS.TOKEN_USER_TENANT_KEY);
  }

  getUser(): string {
    return this.cookieService.get(APPCONSTANTS.TOKEN_USER_USERID_KEY);
  }

  getUserUid(): string {
    return this.cookieService.get(APPCONSTANTS.TOKEN_USER_USERID_UID);
  }

  // TODO: POC 이후 삭제 시작
  getUserCompanyId(): number {
    return Number(this.cookieService.get(APPCONSTANTS.TOKEN_USER_COMPANYID));
  }

  /**
   *  로그인 사용자 관리자 계정여부
   */
  isAdminUser(): boolean {
    // return this.getUser() === APPCONSTANTS.ADMIN_USER;
    const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
    return RcvCommonUtils.FLAG_TRUE === data.isAdmin;
  }

  // TODO: POC 이후 삭제 끝

  getFormatDate(date: any): string {
    let month: string | number;
    let day: string | number;
    let data: Date;
    if (typeof (date) !== typeof (Date)) {
      data = new Date(date);
    } else {
      data = date;
    }

    const year = data.getFullYear();
    month = (1 + data.getMonth());
    month = month >= 10 ? month : '0' + month;

    day = data.getDate();
    day = day >= 10 ? day : '0' + day;
    return `${year}-${month}-${day}`;
  }

  getFormatMonth(date: any): string {
    let month: string | number;
    let day: string | number;
    let data: Date;
    if (typeof (date) !== typeof (Date)) {
      data = new Date(date);
    } else {
      data = date;
    }

    const year = data.getFullYear();
    month = (1 + data.getMonth());
    month = month >= 10 ? month : '0' + month;

    day = data.getDate();
    day = day >= 10 ? day : '0' + day;
    return `${year}-${month}`;
  }

  notify_success(msg: string): void {
    notify({message: msg, width: 300, shading: false}, 'success', 2000);
    // notify(msg, 'success', 600);
  }

  notify_error(msg: string): void {
    notify({message: msg, width: 300, shading: true}, 'error', 2000);
  }

  useLocale(_locale: string): void {
    this.timeService.use(_locale);
  }

  getCurrLocale(): string {
    return this.timeService.currLocale();
  }

  getTimeZoneNames(): string[] {
    return this.timeService.getTimeZoneNames();
  }

  getBrowserTimeZone(): string {
    return this.timeService.getBrowserTimeZone();
  }

  // 추후 그리드설정을 서버에 저장하기 위해 예제로 놔둠
  /////////////////////////////////////////////////////////////////////////////
  // let state = this.dataGrid.instance.state();
  // localStorage.setItem("dataGridState", JSON.stringify(state));
  // sendStorageRequest = (storageKey, dataType, method, data) => {
  //   const url = 'https://url/to/your/storage/' + JSON.stringify(storageKey);
  //   const req: HttpRequest<any> = new HttpRequest(method, url, {
  //     headers: new HttpHeaders({
  //       'Accept': 'text/html',
  //       'Content-Type': 'text/html'
  //     }),
  //     responseType: dataType
  //   });
  //
  //   if (data) {
  //     req.body = JSON.stringify(data);
  //   }
  //   return this.httpClient.request(req)
  //     .toPromise();
  // }
  //
  // loadState = () => {
  //   return this.sendStorageRequest("storageKey", "json", "Get");
  // }
  //
  // saveState = (state) => {
  //   this.sendStorageRequest("storageKey", "text", "Put", state);
  // }
  // getGridConfig(gridName: string): any {
  //   const baseUrl = `this.httpUrl/grid/${gridName}`;
  //   return this.http.get(baseUrl);
  // }
  /////////////////////////////////////////////////////////////////////////////
  getNowUtc(): Moment {
    return this.timeService.getNowUtc();
  }

  getNow(): Moment {
    return this.timeService.getNow();
  }

  /**
   *   사용자 권한에 따른 메뉴 목록 조회
   */
  getMenuListForUser(userId: number, tenant: string, lang: string): Observable<ApiResult<MenuVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/menu/findMenuList?userId=${userId}&tenant=${tenant}&locale=${lang}`;
    return this.http.get<ApiResult<MenuVO[]>>(baseUrl);
  }

  /**
   *   다국어 목록 조회 서비스
   */
  getMessages(vTenant: string): Observable<ApiResult<MessageVO[]>> {
    // const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/mfmessage/findMessage`;
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/user/findMessage`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<MessageVO[]>>(baseUrl, data);
  }

  /**
   *  메시지 목록 초기화
   */
  async initMessages(): Promise<void> {
    const dic = {};
    const lang = this.getLanguage();

    locale(lang); // 언어 선택

    const dictionary = this.dictionary;
    if (dictionary && dictionary[locale()]) { // 저장된 메시지
      loadMessages(dictionary); // 메시지 로드
      return;
    }

    return new Promise((resolve, reject) => {
      // 메시지 목록 조회
      this.getMessages(this.getTenant()).subscribe(result => {
        dic[lang] = {};
        for (const obj of result.data) {
          dic[lang][obj.messageKey] = obj[lang];
        }

        loadMessages(dic);
        this.dictionary = dic;
        resolve(null);
      });
    });
  }

  /**
   *  메시지 저장
   */
  async saveMessage(data: {}): Promise<void> {
    const saveUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/mfmessage/saveMessage`;
    try {
      await this.http.post<ApiResult<MessageVO>>(saveUrl, data).toPromise();
    } catch (e) {
    }
  }

  /**
   * 메시지 키 -> 다국어 변환
   * @param key     - 메시지 키
   * @param values  - 지정된 문자열의 형식 항목을 지정된 열거형에 있는 해당 개체의 문자열 표현으로 바꿈
   *                - {0} 과 {1} 과 {2}
   */
  convert(key: string, ...values: Array<string>): string {
    return formatMessage(key, ...values);
  }

  /**
   * 메시지 키 -> 다국어 변환(메시지키가 존재하지 않을 경우 INSERT)
   * @param key     - 메시지 키
   * @param ko      - 한국어
   * @param en      - 영어(OPTIONAL)
   */
  convert1(key: string, ko: string, en?: string): string {
    const dictionary = this.dictionary;
    if (ko && dictionary && dictionary[locale()] && !dictionary[locale()][key]) { // 저장된 메시지
      // 저장된 메시지가 없을 시 저장
      const data = {
        tenant: this.getTenant(),
        operType: 'insert',
        messageKey: key,              // 메세지코드
        ko,                           // 한국어
        en: (en || ko),              // 영어
        cn: ko,                       // 중국어
        jp: ko,                       // 일본어
        remarks: 'Common Util Insert' // 비고
      } as MessageVO;
      this.dictionary = null;
      this.saveMessage([data]);
      this.initMessages();
    }

    return formatMessage(key);
  }

  /**
   *   페이지 경로
   */
  setPagePath(path: string, parentPath: string): void {
    localStorage.removeItem(APPCONSTANTS.TEXT_PAGE_PATH);
    const SEPERATOR = parentPath && path ? APPCONSTANTS.TEXT_PATH_SEPARATOR : '';
    localStorage.setItem(APPCONSTANTS.TEXT_PAGE_PATH, `${parentPath}${SEPERATOR}${path}`);
  }

  getPagePath(): string {
    return localStorage.getItem(APPCONSTANTS.TEXT_PAGE_PATH);
  }

  setSystemType(systemType: string): void {
    localStorage.removeItem(APPCONSTANTS.TEXT_SYSTEM_TYPE);
    localStorage.setItem(APPCONSTANTS.TEXT_SYSTEM_TYPE, systemType);
  }

  getSystemType(): string {
    return localStorage.getItem(APPCONSTANTS.TEXT_SYSTEM_TYPE) || APPCONSTANTS.DEFAULT_SYSTEMT_TYPE;
  }

  /**
   *   폼 열기버튼
   */
  getFoldable(form, btn): void {
    // 검색조건이 3줄 이상이면 foldable-btn 버튼 활성화, .dx-form의 높이 56px
    // 검색조건이 3줄 이상이면 foldable-btn 버튼 활성화, .dx-form의 높이 78px
    // 검색조건이 2줄 이하면 foldable-btn 버튼 비활성화
    // 관련  css 는 생성해야 하며, 열고 닫힐경우 .dx-state-opened,  .dx.state-closed 각각 적용

    btn.instance.option('icon', 'chevrondown');
    // form[customHeight] = form.instance.element().clientHeight;
    const customOrHeight = 'customOriginHeight';
    const customCmHeight = 'customCommonHeight';
    const formItem = form.items[0];
    const formColSpan = formItem.colSpan;
    const itemDataList = formItem.items.filter(el => el.visible !== false);
    let formItemsColSpan = 0;

    itemDataList.forEach(el => formItemsColSpan += (!el.colSpan ? 1 : el.colSpan));

    const formCnt = Math.ceil(formItemsColSpan / formColSpan);
    const rowHeight = 30;
    form[customCmHeight] = 63;

    if (formCnt > 2) {
      form.height = form[customCmHeight];
      form[customOrHeight] = rowHeight * formCnt + 5;
      btn.visible = true;
    } else {
      btn.visible = false;
    }
  }

  /**
   *   리셋 공통
   *   사용안함.
   */
  onReset(form): void {
    const itemDataList = form.items[0].items.filter(el => el.visible !== false && !el.disabled && el.itemType !== 'empty');

    itemDataList.forEach(el => {

      if (!!el.dataField) {
        form.formData[el.dataField] = '';
      }
    });
  }

  /**
   *   폼 펼치기
   */
  onFoldable(form, btn): void {

    form.height = form.customCommonHeight === form.height ? form.customOriginHeight : form.customCommonHeight;
    const icon = form.customCommonHeight === form.height ? 'chevrondown' : 'chevronup';
    btn.instance.option('icon', icon);
  }

  getGridHeight(grid, extraHeight?): void {
    // const documentHeight = document.documentElement.offsetHeight;
    // const contentHeight = document.getElementsByClassName('content')[0].clientHeight;

    // offsetTop: 159
    const documentHeight = document.documentElement.clientHeight;
    const gridTop = grid.element.nativeElement.offsetTop;

    // console.log(grid);
    //
    // console.log(gridTop);
    // console.log(documentHeight - gridTop - 213);  // 765 - 213

    // const pagerElement = document.getElementsByClassName('dx-widget dx-datagrid-pager dx-pager');


    // console.log(pagerElement[pagerElement.length - 1].clientHeight);
    const margin = -120;
    // grid.height = documentHeight - gridTop - 213;
    grid.height = documentHeight - gridTop + margin - (extraHeight || 0);

    // console.log(grid.height);

    const layoutHeaderHeight = document.getElementsByClassName('layout-header')[0].clientHeight;
    const contentsHeaderHeight = document.getElementsByClassName('contents-header')[0].clientHeight;
    const searchBoxHeight = document.getElementsByClassName('search-box')[0].clientHeight;
    const padding = 30;
    // console.log(documentHeight, layoutHeaderHeight, contentsHeaderHeight, searchBoxHeight, padding);
    // console.log(documentHeight - layoutHeaderHeight - contentsHeaderHeight - searchBoxHeight - padding);
    // console.log(documentHeight - layoutHeaderHeight - contentsHeaderHeight - searchBoxHeight - 34);
    // grid.height = documentHeight - layoutHeaderHeight - contentsHeaderHeight - searchBoxHeight - 34;
  }

  getTabHeight(tab, extraHeight?): void {
    const documentHeight = document.documentElement.clientHeight;
    const tabTop = tab.element.nativeElement.offsetTop;
    const margin = -100;
    tab.height = documentHeight - tabTop + margin - (extraHeight || 0);
  }

  /**
   * willBeDeleted
   */
  getPopupGridHeight(grid, popup, extraHeight?): void {
    const popupTop = popup.element.nativeElement.offsetTop;
    const gridTop = grid.element.nativeElement.offsetTop;

    grid.height = popupTop - gridTop - 190 + (extraHeight || 0);
  }

  /**
   * 팝업 그리드 높이 조정
   */
  setPopupGridHeight(popup, form, grid): void {
    grid.height = this.getAddGridHeight(popup, form, grid);
    popup.instance.on('resize', (e) => {
      grid.height = this.getAddGridHeight(popup, form, grid);
    });
  }

  getAddGridHeight(popup, form, grid): number {
    const minHeight = 0;
    const padding = 100;

    if (String(popup.height).includes('vh')) {// 팝업 사이즈를 지정안할 경우
      popup.height = parseInt(popup.instance.content().style.height, 10) + padding;
    }
    const popupHeight = Number(popup.height) - padding;
    const formHeight = form.element.nativeElement.clientHeight;
    const gridHeight = grid.element.nativeElement.clientHeight;
    // Popup Content Height - formHeight ( 폼 안에 그리드가 포함되어 있기에 그리드 높이를 더한다. )
    const addGridHeight = (popupHeight - formHeight) + gridHeight;
    return addGridHeight >= minHeight ? addGridHeight : minHeight;
  }

  getCalcGridHeight(grid): number {

    const documentHeight = document.documentElement.clientHeight;
    const gridTop = grid.element.nativeElement.offsetTop;

    return documentHeight - gridTop - 213;
  }

  /**
   *  공통 창고VO SETTER
   */
  setCommonWarehouseVO(warehouseVO: any): void {
    localStorage.removeItem(APPCONSTANTS.TEXT_WAREHOUSE_VO);
    localStorage.setItem(APPCONSTANTS.TEXT_WAREHOUSE_VO, JSON.stringify(warehouseVO));
    // this.warehouseVO = warehouseVO;
  }

  /**
   *  공통 창고VO GETTER
   */
  getCommonWarehouseVO(): any {
    return JSON.parse(localStorage.getItem(APPCONSTANTS.TEXT_WAREHOUSE_VO));
  }

  /**
   *  공통 창고코드 SETTER
   */
  setCommonWarehouseId(warehouseId: number): void {
    localStorage.removeItem(APPCONSTANTS.TEXT_WAREHOUSE_ID);
    localStorage.setItem(APPCONSTANTS.TEXT_WAREHOUSE_ID, String(warehouseId));
  }

  /**
   *  공통 창고코드 GETTER
   */
  getCommonWarehouseId(): number {
    return Number(localStorage.getItem(APPCONSTANTS.TEXT_WAREHOUSE_ID));
  }

  /**
   *  공통 화주 SETTER
   */
  setCommonOwnerId(ownerId: number): void {
    localStorage.removeItem(APPCONSTANTS.TEXT_OWNER_ID);
    localStorage.setItem(APPCONSTANTS.TEXT_OWNER_ID, String(ownerId));
  }

  /**
   *  공통 화주 GETTER
   */
  getCommonOwnerId(): number {
    return Number(localStorage.getItem(APPCONSTANTS.TEXT_OWNER_ID));
  }

  /**
   *  공통 품목관리사 SETTER
   */
  setCommonItemAdminId(itemAdminId: number): void {
    localStorage.removeItem(APPCONSTANTS.TEXT_ITEMADMIN_ID);
    localStorage.setItem(APPCONSTANTS.TEXT_ITEMADMIN_ID, String(itemAdminId));
  }

  /**
   *  공통 화주 GETTER
   */
  getCommonItemAdminId(): number {
    return Number(localStorage.getItem(APPCONSTANTS.TEXT_ITEMADMIN_ID));
  }


  setUtSetting(data: any): void {
    localStorage.removeItem(APPCONSTANTS.APPLIED_UTSETTING);
    localStorage.setItem(APPCONSTANTS.APPLIED_UTSETTING, JSON.stringify(data));
  }

  getUtSetting(): any {
    let appliedUtSetting = JSON.parse(localStorage.getItem(APPCONSTANTS.APPLIED_UTSETTING));

    if (!appliedUtSetting) {

      appliedUtSetting = {
        theme: APPCONSTANTS.DEFAULT_THEME,
        font: APPCONSTANTS.DEFAULT_FONT,
        fontsize: APPCONSTANTS.DEFAULT_FONTSIZE
      };
    }
    return appliedUtSetting;
  }

  // /**
  //  * 테마 SETTER
  //  */
  // setTheme(theme: string): void {
  //   localStorage.removeItem(APPCONSTANTS.APPLIED_THEME);
  //   localStorage.setItem(APPCONSTANTS.APPLIED_THEME, theme);
  // }
  //
  // /**
  //  * 테마 GETTER
  //  */
  // getTheme(): string {
  //   return localStorage.getItem(APPCONSTANTS.APPLIED_THEME) || APPCONSTANTS.DEFAULT_THEME;
  // }
  //
  // /**
  //  * FONTSIZE SETTER
  //  */
  // setFontSize(fontSize: string): void {
  //   localStorage.removeItem(APPCONSTANTS.APPLIED_FONTSIZE);
  //   localStorage.setItem(APPCONSTANTS.APPLIED_FONTSIZE, fontSize);
  // }
  //
  // /**
  //  * FONTSIZE GETTER
  //  */
  // getFontSize(): string {
  //   return localStorage.getItem(APPCONSTANTS.APPLIED_FONTSIZE) || APPCONSTANTS.DEFAULT_FONTSIZE;
  // }
  //
  // /**
  //  * FONT SETTER
  //  */
  // setFont(font: string): void {
  //   localStorage.removeItem(APPCONSTANTS.APPLIED_FONT);
  //   localStorage.setItem(APPCONSTANTS.APPLIED_FONT, font);
  // }
  //
  // /**
  //  * FONT GETTER
  //  */
  // getFont(): string {
  //   return localStorage.getItem(APPCONSTANTS.APPLIED_FONT) || APPCONSTANTS.DEFAULT_FONT;
  // }

  /**
   * 아코디언 모두 펼치기
   * @param accordion 아코디언 컴포넌트 DxAccordionComponent
   */
  fnAccordionExpandAll(accordion: any): void {
    // const animationDuration = accordion.animationDuration;
    // accordion.animationDuration = 0;
    accordion.selectedItems = accordion.items;
    // accordion.animationDuration = animationDuration;
  }

  /**
   * 조회 날짜 범위
   */
  getDateRange(): any {
    const today = new Date();

    let fromDate = '';
    let toDate = '';

    const date1 = today;
    const date2 = new Date(today.getFullYear(), today.getMonth(), (today.getDate() + this.dateRange));

    if (date1 > date2) {
      fromDate = this.formatDate(date2);
      toDate = this.formatDate(date1);
    } else {
      fromDate = this.formatDate(date1);
      toDate = this.formatDate(date2);
    }

    return {fromDate, toDate};
  }

  /**
   * 날짜 -> 형식문자열 변환[yyyy-MM-dd]
   */
  formatDate(date): string {
    const seperator = '-';
    const yyyy = date.getFullYear();
    const MM = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const dd = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

    return yyyy + seperator + MM + seperator + dd;
  }
  /**
   * 날짜 -> 형식문자열 변환[yyyyMMdd]
   */
  formatDate2(date): string {
    const yyyy = date.getFullYear();
    const MM = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    const dd = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

    return yyyy + MM + dd;
  }
  /**
   * 확인창 오픈
   */
  async confirm(msg): Promise<boolean> {
    const dialogOptions = {
      title: this.convert('confirm.title'),
      messageHtml: `<div style="height: 100px; width: 300px; font-size: 15px; text-align: center; position: relative; top: 20px;">${msg}</div>`,
      buttons: [
        {
          text: this.convert('confirm.yes.text'), onClick: () => {
            return true;
          },
          focusStateEnabled: false
        },
        {
          text: this.convert('confirm.no.text'), onClick: () => {
            return false;
          },
          focusStateEnabled: false
        }],
      showTitle: true,
      dragEnabled: true
    } as CustomDialogOptions;

    let returnValue = false;

    const result = custom(dialogOptions);
    try {
      await result.show().done(r => {
        returnValue = r;
      });
    } catch {
    }
    return returnValue.valueOf();
  }

  // 시리얼템플릿다운로드
  async downloadSerialExcel(): Promise<void> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcv/downloadSerialExcel`;

    try {

      const a = window.document.createElement('a');
      // a.href = window.URL.createObjectURL(baseUrl);
      a.href = baseUrl;
      // a.download = `${excelHandler.excelFileName}.XLSX`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);

      // const result = await this.http.get<any>(baseUrl).toPromise();
      // return result;
    } catch (e) {
      // console.log(e);
      // return {
      //   success: false,
      //   data: null,
      //   code: '-999',
      //   msg: 'Post service api error!'
      // };
    }
  }

  // 시리얼템플릿다운로드
  async downloadBeginInvExcel(): Promise<void> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/invAdjust/downloadBeginInvExcel`;

    try {

      const a = window.document.createElement('a');
      // a.href = window.URL.createObjectURL(baseUrl);
      a.href = baseUrl;
      // a.download = `${excelHandler.excelFileName}.XLSX`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);

      // const result = await this.http.get<any>(baseUrl).toPromise();
      // return result;
    } catch (e) {
      // console.log(e);
      // return {
      //   success: false,
      //   data: null,
      //   code: '-999',
      //   msg: 'Post service api error!'
      // };
    }
  }

  // 스토리지 다운로드
  async download(fileName, origFileName): Promise<void> {
    // 조회 Api 설정

    // const fileName = localStorage.getItem('wmUploadFileNm');
    if (!fileName) {
      return;
    }
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/azureStorage/downloadFile?fileName=${fileName}&origFileName=${origFileName}`;

    try {

      const a = window.document.createElement('a');
      // a.href = window.URL.createObjectURL(baseUrl);
      a.href = baseUrl;
      // a.download = `${excelHandler.excelFileName}.XLSX`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // const result = await this.http.get<any>(baseUrl).toPromise();
      // return result;
    } catch (e) {
      // console.log(e);
      // return {
      //   success: false,
      //   data: null,
      //   code: '-999',
      //   msg: 'Post service api error!'
      // };
    }
  }

  async delete(fileName): Promise<void> {
    // 조회 Api 설정

    // const fileName = localStorage.getItem('wmUploadFileNm');
    if (!fileName) {
      return;
    }
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcv/deleteFile?fileName=${fileName}`;

    const result = this.http.get(baseUrl).toPromise();
    console.log(result);
  }

  async downloadSales(): Promise<void> {
    // 조회 Api 설정

    const fileName = localStorage.getItem('salesUploadFileNm');
    if (!fileName) {
      return;
    }
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/azureStorage/downloadFile?fileName=${fileName}`;

    try {

      const a = window.document.createElement('a');
      // a.href = window.URL.createObjectURL(baseUrl);
      a.href = baseUrl;
      // a.download = `${excelHandler.excelFileName}.XLSX`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // const result = await this.http.get<any>(baseUrl).toPromise();
      // return result;
    } catch (e) {
      // console.log(e);
      // return {
      //   success: false,
      //   data: null,
      //   code: '-999',
      //   msg: 'Post service api error!'
      // };
    }
  }

  async deleteSales(): Promise<void> {
    // 조회 Api 설정

    const fileName = localStorage.getItem('salesUploadFileNm');
    if (!fileName) {
      return;
    }
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/azureStorage/deleteFile?fileName=${fileName}`;

    const result = this.http.get(baseUrl).toPromise();
    console.log(result);
  }

  /**
   * Ubi Report 호출
   * reportFile : 호출 Report File 명 (확장자 *.jrf, *.jef)
   *  ex) reportFile = 'file=Test.jrf'
   * reportOption : reportFile DataSet Parameter
   *  ex) reportOption = [
   *       {
   *         dataSet : 'ApiDataSet',
   *         node : '',
   *         path : '/master-service/menu/findMenuListPost',
   *         apiParam : {
   *           userId : '101',
   *           tenant : '1000',
   *           locale : 'ko'
   *         }
   *       },
   *       {
   *         dataSet : 'ApiDataSetData',
   *         node : 'data',
   *         path : '/master-service/menu/findMenuListPost',
   *         apiParam : {
   *           userId : '101',
   *           tenant : '1000',
   *           locale : 'ko',
   *           items  : 'AC1023'
   *         }
   *       }
   *     ];
   */
  async openViewReport(reportFile, reportOption, multiple = false, left = 0, system = 'WM'): Promise<void> {
    const reportUrl = `${APPCONSTANTS.BASE_URL_RP}` + '/ubi4/ubihtml_jsondata.jsp';
    // 임시로 port 변경 Report 관련 Api Gateway 및 Authorize 작업 후 변경해야 함
    // const apiUrl = 'http://www.concplay.co.kr:10001';
    let apiUrl = '';
    if (system === 'SL') {
      apiUrl = `${APPCONSTANTS.BASE_URL_SL}`;
    } else {
      apiUrl = `${APPCONSTANTS.BASE_URL_WM}`;
    }

    let argUrl = '';
    reportOption.forEach(el => {
      argUrl += '^' + el.dataSet;
      argUrl += '^node=' + el.node;
      argUrl += '&url=' + apiUrl + el.path + '?';

      // array = ['aaa', 'bbb', 'ccc'];
      // http://server/context?array=aaa&array=bbb&array=ccc&otherparameter=x
      forEach(el.apiParam, (value, key) => {
        if (value instanceof Array) {
          value.forEach(val => {
            argUrl += key + '=' + val + '|';
          });
        } else {
          argUrl += key + '=' + value + '|';
        }
      });
    });

    /*
     URL Encoding 특수문자 코드
     ^  %5E
     #  %23
     |  %7C
     &	%26
    */
    const arg = encodeURI('arg=' + argUrl).split('%5E').join('%23').split('%7C').join('%5E').split('&').join('%26');
    console.log(arg);
    // http://www.concplay.co.kr:9080/ubi4/ubihtml_jsondata.jsp?
    // file=Test.jrf
    // tslint:disable-next-line:max-line-length
    // &arg=%23ApiDataSet%23node=%26url=http://www.concplay.co.kr:9999/master-service/menu/findMenuListPost?userId=101%5Etenant=1000%5Elocale=ko%5E%23ApiDataSetData%23node=data%26url=http://www.concplay.co.kr:9999/master-service/menu/findMenuListPost?userId=101%5Etenant=1000%5Elocale=ko%5E
    if (multiple) {
      window.open(reportUrl + '?' + reportFile + '&' + arg, '', 'height=' + window.screen.height + 'vh,width=' + 1024 + ',left=' + left + ',fullscreen=yes', true);
    } else {
      window.open(reportUrl + '?' + reportFile + '&' + arg, 'reportViewer', 'height=' + window.screen.height + 'vh,width=' + 1024 + 'fullscreen=yes', true);
    }
  }

  getUserGroup(): string {
    const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
    return data.userGroup;
  }

  getCompanyId(): string {
    const selectedCompanyId = JSON.parse(sessionStorage.getItem(APPCONSTANTS.SELECTED_COMPANY_ID));
    console.log(selectedCompanyId);
    const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
    return selectedCompanyId || data.companyId;
  }

  setCompanyId(companyId: number): void {
    // const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
    // data.companyId = companyId;
    sessionStorage.setItem(APPCONSTANTS.SELECTED_COMPANY_ID, JSON.stringify(companyId));
    this.relatedCompanyId = companyId;
  }

  getCompany(): string {
    const selectedCompany = JSON.parse(sessionStorage.getItem(APPCONSTANTS.SELECTED_COMPANY));
    const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
    // console.log(this.relatedCompany);
    // console.log(data.company);
    //
    //
    // console.log('this.relatedCompany || data.company', this.relatedCompany || data.company);
    //
    return selectedCompany || data.company;
    // return data.company;
  }

  setCompany(company: string): void {
    // const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
    // data.companyId = companyId;
    sessionStorage.setItem(APPCONSTANTS.SELECTED_COMPANY, JSON.stringify(company));
    this.relatedCompany = company;
  }

  async getNavigation(): Promise<any> {
    const userId = parseInt(this.cookieService.get(APPCONSTANTS.TOKEN_USER_USERID_UID), 0);

    if (isNaN(userId)) {  // 키가 유효하지 않으면
      return navigation.map((item) => {
        if (item.path && !(/^\//.test(item.path))) {
          item.path = `/${item.path}`;
        }
        return {...item, expanded: true};
      });
    }
    const menuList = [];
    const result = await this.getMenuListForUser(userId, this.getTenant(), this.getLanguage());

    await firstValueFrom(result).then((data) => {
      let title = '';
      let menu = {text: '', systemType: '', icon: '', items: [], expanded: true};
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < data.data.length; i++) {
        const obj = data.data[i];

        if (!obj.l2path) {
          continue;
        }

        if (!title) {
          title = obj.l1text;
        }
        if (title !== obj.l1text) {
          title = obj.l1text;
          // @ts-ignore
          menuList.push(menu);
          menu = {text: '', systemType: '', icon: '', items: [], expanded: false};
        }

        menu.text = obj.l1text;
        menu.icon = obj.l1icon;
        menu.systemType = obj.systemType;
        menu.expanded = /*!this._compactMode*/false;
        menu.items.push({text: obj.l2text, path: (obj.l1path + obj.l2path), expanded: false, uid: obj.uid});

        if (i === data.data.length - 1) {
          // @ts-ignore
          menuList.push(menu);
        }
      }
    });

    const items = menuList.filter(el => {
      return el.systemType === this.getSystemType();
    });

    const wholeItems = menuList;
    return {
      items, wholeItems
    };
  }

  // ---------------------
  // 거래처 상세 조회
  // ---------------------
  getCustInfo(vCustCd: string): Observable<ApiResult<any>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getCustInfo`;
    const data = Object.assign(
      {custCd: vCustCd}
    );
    return this.http.post<ApiResult<any>>(baseUrl, data);
  }

  /**
   * 팝업 높이 조정 - 팝업 아래 여백 조정
   */
  adjustFormHeightInPopup(): void {
    const p = document.querySelector('body > div > div > div.dx-popup-content');
    // @ts-ignore
    const heightStr = p.style.height;
    const height = Number(heightStr.replaceAll(/[^0-9]/gi, ''));
    // @ts-ignore
    p.style.height = (height + 50) + 'px';
    // @ts-ignore
    console.log('p.style.height', p.style.height);
  }

  adjustFormMarginInPopup(popup): void {
    // const p = document.querySelector('body > div > div > div.dx-popup-content');
    // // @ts-ignore
    // const heightStr = p.style.height;
    // const height = Number(heightStr.replaceAll(/[^0-9]/gi, ''));
    // // @ts-ignore
    // p.style.height = (height + 50) + 'px';
    // // @ts-ignore
    // console.log('p.style.height', p.style.height);
  }

}

export interface MenuVO {
  tenant: string;
  uid: number;
  l1path: string;
  l2path: string;
  l1text: string;
  l2text: string;
  l1icon: string;
  systemType: string;
  app: string;
  authSearch: string;
  authUpd: string;
  authDel: string;
  authExec: string;
  authPrint: string;
  l1priorities: number;
  l2priorities: number;
  apppriorities: number;
}


export interface MessageVO {
  tenant: string;
  uid: number;
  operType: string;

  messageKey: string;         // 메세지코드
  ko: string;                 // 한국어
  en: string;                 // 영어
  cn: string;                 // 중국어
  jp: string;                 // 일본어
  remarks: string;            // 비고
  code: string;

  modifiedBy: string;
  modifiedDatetime: string;
}
