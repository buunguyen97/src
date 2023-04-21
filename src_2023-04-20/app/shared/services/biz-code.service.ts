/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : common-code.service.ts
 * Author : jbh5310
 * Lastupdate : 2021-03-17 11:03:04
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {JHttpService} from './jhttp.service';
import {APPCONSTANTS} from '../constants/appconstants';
import {ApiResult} from '../vo/api-result';
import {CommonUtilService} from './common-util.service';
import {ReportMngVO} from '../../pages/mm/report-mng/report-mng.service';

@Injectable({
  providedIn: 'root'
})
export class BizCodeService {

  constructor(private http: JHttpService,
              private commonUtil: CommonUtilService) {
  }

  // changes -> savedata 변환
  collectGridData(changes: any, g, g_tenant): any[] {
    const gridList = [];
    const grid = g.instance.getVisibleRows();

    for (const rowIndex in changes) {
      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: g_tenant
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {

        const rowItem = grid.find(function(el) {
          if (el.key === changes[rowIndex].key) {
            return true;
          }
        });

        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data, rowItem.data
          )
        );
      }
    }
    return gridList;
  }

  // 특정 컬럼에 중복된 값이 있는지 체크
  getIndexWhenDup(g, colName) {

    const gridRows = g.instance.getVisibleRows();

    const gridDatas = [];
    for (const d of gridRows) {
      gridDatas.push(d.data);
    }

    const unique = new Set();
    let ix = -1;
    const dup = gridDatas.some(function(o, i) {
      const b = unique.size === unique.add(o[colName]).size;
      if (b) {
        ix = i;
      }
      return b;
    });
    return ix;
  }

  // 일자 조회
  getDay(pDay, pOprt): string {
    const d = new Date();
    const year = d.getFullYear(); // 년
    const month = d.getMonth();   // 월
    const day = d.getDate();      // 일

    const today = new Date(year, month, pOprt == '+' ? day + pDay : day - pDay);
    const seperator = '-';
    const yyyy = today.getFullYear();
    const MM = (today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
    const dd = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();

    return yyyy + seperator + MM + seperator + dd;
  }

  // ---------------------
  // 제품
  // ---------------------
  getItem(vTenant: string,
          vSetItemYn: string,
          vUseYn: string,
          vItemGb: string,
          vTemp3: string,
          vTemp4: string): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/itemList`;
    const data = Object.assign(
      {tenant: vTenant},
      {setItemYn: vSetItemYn},
      {useYn: vUseYn},
      {itemGb: vItemGb},
      {aa3: vTemp3},
      {aa4: vTemp4}
    );
    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 제품
  // ---------------------
  getCustItem(vTenant: string,
              vCustCd: string): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/custItemList`;
    const data = Object.assign(
      {tenant: vTenant},
      {custCd: vCustCd}
    );
    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 계약에 있는 제품(수출사 수입사)
  // ---------------------
  getItemExptImpt(vTenant: string,
                  vImptCd: string,
                  vExptCd: string): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getItemExptImpt`;
    const data = Object.assign(
      {tenant: vTenant},
      {impt_cd: vImptCd},
      {expt_cd: vExptCd}
    );
    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 수입사 선택시 제품있는 수출사 출력
  // ---------------------
  getExptImpt(vTenant: string,
              vImptCd: string
              ): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getExptImpt`;
    const data = Object.assign(
      {tenant: vTenant},
      {impt_cd: vImptCd}
    );
    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 제품
  // ---------------------
  getSaWh(vTenant: string,
          vPtrnCd: string): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getSaWh`;
    const data = Object.assign(
      {tenant: vTenant},
      {ptrn_cd: vPtrnCd}
    );
    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }


  // ---------------------
  // 거래처
  // ---------------------
  getCust(vTenant: string,
          vPtrnYn: string,
          vExptYn: string,
          vImptYn: string,
          vUseYn: string,
          vPurYn: string,
          vTemp2: string): Observable<ApiResult<LookupExptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/custList`;
    const data = Object.assign(
      {tenant: vTenant},
      {ptrnYn: vPtrnYn},
      {exptYn: vExptYn},
      {imptYn: vImptYn},
      {useYn: vUseYn},
      {purYn: vPurYn},
      {aa2: vTemp2},
    );
    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 리포트 조회
  // ---------------------
  getReportId(vTenant: string): Observable<ApiResult<ReportMngVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/reportmng/lookupReportId`;
    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<ReportMngVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 수출사-파트너사
  // ---------------------
  getExptPtrn(vTenant: string, vPtrnCd?: string): Observable<ApiResult<LookupExptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/exptPtrnList`;
    const data = Object.assign(
      {tenant: vTenant},
      {ptrn_cd: vPtrnCd},
    );

    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 영업창고
  // ---------------------
  getSaWhList(vTenant: string): Observable<ApiResult<LookupExptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/saWhList`;
    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 영업창고
  // ---------------------
  getImptSaWh(vTenant: string, vPtrnCd: string): Observable<ApiResult<LookupExptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getImptSaWh`;
    const data = Object.assign(
      {tenant: vTenant},
      {ptrn_cd: vPtrnCd}
    );

    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 수입사-파트너사
  // ---------------------
  getImptPtrn(vTenant: string, vPtrnCd?: string, vImptCd?: string): Observable<ApiResult<LookupExptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/imptPtrnList`;
    const data = Object.assign(
      {tenant: vTenant},
      {ptrn_cd: vPtrnCd},
      {impt_cd: vImptCd},
    );

    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 창고
  // ---------------------
  getWh(vTenant: string): Observable<ApiResult<LookupExptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/whList`;
    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 창고
  // ---------------------
  getSalesWh(vTenant: string, vUsed: string): Observable<ApiResult<LookupSalesWhVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sast070/sales_wh_list`;
    const data = Object.assign(
      {
        tenant: vTenant
        , used: vUsed
      }
    );

    return this.http.post<ApiResult<LookupSalesWhVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 파트너-창고
  // ---------------------
  getPtrnWh(vTenant: string): Observable<ApiResult<LookupExptVO[]>> {
    // const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs060/list`;
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/ptrnWhList`;
    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 영업담당자
  // ---------------------
  getSaChg(vTenant: string): Observable<ApiResult<LookupExptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/saChgList`;
    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupExptVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 수출사 계약번호
  // ---------------------
  getContNo(vTenant: string,
            vContGb: string,
            vCustCd: string,
            vImptCd: string,
            vDt: string): Observable<ApiResult<paramVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getContNo`;
    const data = Object.assign(
      {tenant: vTenant},
      {contGb: vContGb},
      {custCd: vCustCd},
      {imptCd: vImptCd},
      {dt: vDt}
    );
    return this.http.post<ApiResult<paramVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 수출사계약 품목 목록 조회
  // ---------------------
  exptContItemList(vTenant: string,
                   vContNo: string): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/exptContItemList`;
    const data = Object.assign(
      {tenant: vTenant},
      {contNo: vContNo}
    );
    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }


  // ---------------------
  // 매입처 계약번호
  // ---------------------
  getPurContNo(vTenant: string,
               vPurCd: string,
               vInpScheDt: string): Observable<ApiResult<paramVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getPurContNo`;
    const data = Object.assign(
      {tenant: vTenant},
      {purCd: vPurCd},
      {inp_sche_dt: vInpScheDt}
    );
    return this.http.post<ApiResult<paramVO[]>>(baseUrl, data);
  }

  // ---------------------
  // 매입처 계약번호로 데이터 가져오기
  // ---------------------
  getPurContData(vTenant: string,
                 vContNo: string): Observable<ApiResult<paramVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getPurContData`;
    const data = Object.assign(
      {tenant: vTenant},
      {cont_no: vContNo}
    );
    return this.http.post<ApiResult<paramVO[]>>(baseUrl, data);
  }

  async getOrdPr(vTenant: string,
                 vContNo: string,
                 vItemCd: string) {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOrdPr`;
    const data = Object.assign(
      {tenant: vTenant},
      {contNo: vContNo},
      {itemCd: vItemCd}
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  async getPurPr(vTenant: string,
                 vPurCd: string,
                 vItemCd: string) {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getPurPr`;
    const data = Object.assign(
      {tenant: vTenant},
      {purCd: vPurCd},
      {itemCd: vItemCd}
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  async getPurPrVatRateZero(vTenant: string,
                            vPurCd: string,
                            vItemCd: string) {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getPurPrVatRateZero`;
    const data = Object.assign(
      {tenant: vTenant},
      {purCd: vPurCd},
      {itemCd: vItemCd}
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  // ---------------------
  // 영업 파일ID
  // ---------------------
  getSaleFileId(vProgId: string): Observable<ApiResult<paramVO>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getSaleFileId`;
    const data = Object.assign(
      {progId: vProgId}
    );
    return this.http.post<ApiResult<paramVO>>(baseUrl, data);
  }

  /*영업담당자*/
  getSaChg_SACS010(vCompanyId: number): Observable<ApiResult<saChg_sacs010VO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs010/saChg_SACS010`;
    const data = Object.assign(
      {companyid: vCompanyId}
    );
    return this.http.post<ApiResult<saChg_sacs010VO[]>>(baseUrl, data);
  }

  // ---------------------
  // 파일 다운로드
  // ---------------------
  async fileDownload(vLogFileNm: string): Promise<void> {
    // 조회 Api 설정

    const fileName = vLogFileNm;
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

  // ---------------------
  // 포탈 파일 다운로드
  // ---------------------
  async portalFileDownload(vLogFileNm: string, vOrigFileName: string): Promise<void> {
    // 조회 Api 설정

    const fileName = vLogFileNm;
    const origFileName = vOrigFileName;

    if (!fileName) {
      return;
    }
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/azureStorage/downloadPortalFile?fileName=${fileName}&origFileName=${origFileName}`;

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

  // ---------------------
  // 파일 삭제
  // ---------------------
  async portalFileDelete(vLogFileNm: string): Promise<void> {
    // 조회 Api 설정

    const fileName = vLogFileNm;
    if (!fileName) {
      return;
    }
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/azureStorage/deletePortalFile?fileName=${fileName}`;

    const result = this.http.get(baseUrl).toPromise();
    console.log(result);
  }

  // ---------------------
  // 포탈 파일 삭제
  // ---------------------
  async fileDelete(vLogFileNm: string): Promise<void> {
    // 조회 Api 설정

    const fileName = vLogFileNm;
    if (!fileName) {
      return;
    }
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/azureStorage/deleteFile?fileName=${fileName}`;

    const result = this.http.get(baseUrl).toPromise();
    console.log(result);
  }

  // ---------------------
  // 주문번호(판매)
  // ---------------------
  getOrdNoA(vTenant: string,
            vExptCd: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOrdNoA`;
    const data = Object.assign(
      {
        tenant: vTenant,
        expt_cd: vExptCd
      }
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // ---------------------
  // 주문번호(렌탈)
  // ---------------------
  getOrdNoB(vTenant: string,
            vExptCd: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOrdNoB`;
    const data = Object.assign(
      {
        tenant: vTenant,
        expt_cd: vExptCd
      }
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // ---------------------
  // 주문번호(견본, 타계정)
  // ---------------------
  getOrdNoC(vTenant: string,
            vExptCd: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOrdNoC`;
    const data = Object.assign(
      {
        tenant: vTenant,
        expt_cd: vExptCd
      }
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // ---------------------
  // 출고번호
  // ---------------------
  getOutNo(vTenant: string, vOrdNo: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOutNo`;
    const data = Object.assign(
      {
        tenant: vTenant,
        ord_no: vOrdNo
      }
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // ---------------------
  // 국가
  // ---------------------
  getCountry(vTenant: string, vOrdNo: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getCountry`;
    const data = Object.assign(
      {
        tenant: vTenant,
        ord_no: vOrdNo
      }
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // 수출사창고 조회
  getSaWhImptCheck(vTenant: string, vImptCd: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getSaWhImptCheck`;

    const data = Object.assign(
      {tenant: vTenant},
      {ptrnCd: vImptCd}
    );

    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // 수입사창고 조회
  getSaWhExptCheck(vTenant: string, vExptCd: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getSaWhExptCheck`;

    const data = Object.assign(
      {tenant: vTenant},
      {ptrnCd: vExptCd}
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // I/F함수
  async sendApi(data: {}): Promise<ApiResult<InftVO>> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/interface/sendApi`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InftVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  // I/F함수 test start
  async recOut(data: {}): Promise<ApiResult<InftVO>> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/interface/recOut`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InftVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async recRtn(data: {}): Promise<ApiResult<InftVO>> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/interface/recRtn`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InftVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async recPurInp(data: {}): Promise<ApiResult<InftVO>> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/interface/recPurInp`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InftVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  // ---------------------
  // 계약정보
  // ---------------------
  getOrdDtData(vTenant: string, vOrdNo: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOrdDtData`;
    const data = Object.assign(
      {
        tenant: vTenant,
        ord_no: vOrdNo
      }
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // ---------------------
  // 출고정보
  // ---------------------
  getOutDtData(vTenant: string, vOutOrdNo: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOutDtData`;
    const data = Object.assign(
      {
        tenant: vTenant,
        out_ord_no: vOutOrdNo
      }
    );
    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  async getStoQty(vWhCd: string,
                  vItemCd: string,
                  vPtrnCd: string) {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getStoQty`;
    const data = Object.assign(
      {whCd: vWhCd},
      {itemCd: vItemCd},
      {ptrnCd: vPtrnCd}
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  async getVat(vContNo: string,
               vItemCd: string): Promise<any> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getVat`;
    const data = Object.assign(
      {contNo: vContNo},
      {itemCd: vItemCd}
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  /**
   * 가용재고
   */
  async getInvQty(vPtrnCd: string,
                  vSaWhCd: string,
                  vItemCd: string,
                  vTenant: string,
                  vDamageflg: string): Promise<any> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getInvQty`;
    const data = Object.assign(
      {ptrnCd: vPtrnCd},
      {saWhCd: vSaWhCd},
      {itemCd: vItemCd},
      {tenant: vTenant},
      {damageflg: vDamageflg},
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  /**
   * 수출사 가용재고
   */
  async getExptInvQty(vExptCd: string,
                      vSaWhCd: string,
                      vItemCd: string,
                      vTenant: string,
                      vDamageflg: string,
                      vPtrnCd: string): Promise<any> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getExptInvQty`;
    const data = Object.assign(
      {exptCd: vExptCd},
      {ptrnCd: vPtrnCd},
      {saWhCd: vSaWhCd},
      {itemCd: vItemCd},
      {tenant: vTenant},
      {damageflg: vDamageflg},
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  /**
   * 수입사 가용재고
   */
  async getImptInvQty(vPtrnCd: string,
                      vSaWhCd: string,
                      vItemCd: string,
                      vTenant: string,
                      vDamageflg: string,
                      vOwner: string): Promise<any> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getImptInvQty`;
    const data = Object.assign(
      {ptrnCd: vPtrnCd},
      {saWhCd: vSaWhCd},
      {itemCd: vItemCd},
      {tenant: vTenant},
      {damageflg: vDamageflg},
      {owner: vOwner}
    );
    const response = await this.http.post<ApiResult<paramVO>>(baseUrl, data).toPromise();
    return response.data;
  }

  /**
   * 사용자별 영업창고
   */
  async getAuthWarehouseByUserId(data: {}): Promise<ApiResult<LookupSalesWhVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs070/getAuthWarehouseByUserId`;
    try {
      const result = await this.http.post<ApiResult<LookupSalesWhVO[]>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  /**
   * 주문번호 조회
   */
  async getOrdNoList(data: {}): Promise<ApiResult<LookupOrdNo[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getOrdNoList`;
    try {
      const result = await this.http.post<ApiResult<LookupOrdNo[]>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  /**
   * 수출사 수입사 렌탈계약 조회
   */
  async getContNoWithCustCdAndImptCd(data: {}): Promise<ApiResult<LookupOrdNo[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getContNoWithCustCdAndImptCd`;
    try {
      const result = await this.http.post<ApiResult<LookupOrdNo[]>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  /**
   * 수출사 렌탈 계약별 수입사 조회
   */
  async getImptCdListWithExptCd(data: {}): Promise<ApiResult<LookupOrdNo[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getImptCdListWithExptCd`;
    try {
      const result = await this.http.post<ApiResult<LookupOrdNo[]>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  /**
   * 주문의 영업창고의 물류창고 위치
   **/
  getWhLocationWithOrdNo(vTenant: string, vOrdNo: string): Observable<ApiResult<any>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/comm/getWhLocationWithOrdNo`;

    const data = Object.assign(
      {tenant: vTenant},
      {ord_no: vOrdNo}
    );

    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

  // I/F함수 test end

  /*******************
   * 주문 공통계산
   *******************/

  /**
   * 부가세 계산
   * @param ordQty 주문수량
   * @param ordPr   주문단가
   * @param exptVat 부가세율
   */
  calcOrdVatAmt(rowData: any): number {
    const o = 10;
    const val = rowData.ord_qty * rowData.ord_pr * rowData.expt_vat;
    const calc = isNaN(val) ? 0 : Math.floor(val / o) * o;
    (this as any).defaultSetCellValue(rowData, calc);
    return calc;
  }

  /**
   * 주문금액
   * @param ordQty  주문수량
   * @param ordPr   주문단가
   */
  calcOrdAmt(rowData: any): number {
    const val = rowData.ord_qty * rowData.ord_pr;
    const calc = isNaN(val) ? 0 : val;
    (this as any).defaultSetCellValue(rowData, calc);
    return calc;
  }

  /**
   * 부가세 백분율
   * @param rowData
   * @param value
   */
  setExptVatValue(rowData: any, value: any): void {
    const calc = isNaN(value) ? 0 : value / 100;
    rowData.expt_vat = calc;
  }

  /**
   * 변경 불가 메시지
   */
  alertCannotChangeValue(dataField, option?): void {

    // let msg = '품목이 있는 경우 거래처를 변경할 수 없습니다.';
    // if (this.utilService.getLanguage() !== 'ko') {
    //   msg = 'Cannot change account if item exists.';
    // }
    // this.utilService.notify_error(msg);


    // 파트너사, 영업창고, 주문일자
    let msg = '';
    if (dataField === 'ptrn_cd') {
      msg = '품목이 있는 경우 파트너사를 변경할 수 없습니다.';
      // msg = '하지마 파트너사!!';
    } else if (dataField === 'sa_wh_cd') {
      msg = '품목이 있는 경우 영업창고를 변경할 수 없습니다.';
      // msg = '하지마 영업창고!!';
    } else if (dataField === 'ord_dt') {
      msg = '품목이 있는 경우 주문일자를 변경할 수 없습니다.';
      // msg = '하지마 주문일자!!';
    } else if (dataField === 'expt_cd') { // 1 = 거래처, 2 = 수출사
      if (option === '1') {
        msg = '품목이 있는 경우 거래처를 변경할 수 없습니다.';
        // msg = '하지마 거래처!!';
      } else if (option === '2') {
        msg = '품목이 있는 경우 수출사를 변경할 수 없습니다.';
        // msg = '하지마 수출사!!';
      }
    } else if (dataField === 'impt_cd') {
      msg = '품목이 있는 경우 수입사를 변경할 수 없습니다.';
      // msg = '하지마 수입사!!';
    } else if (dataField === 'sa_wh_cd') {
      msg = '';
    } else {
      msg = '품목이 있는 경유 해당 값을 변경할 수 없습니다.';
      // msg = '하지마 하지마!!';
    }

    this.commonUtil.notify_error(msg);
  }

  /**
   * DataSet 알포터 Append
   */
  appendAlpoterIntoTheDs(dataSet: any[], codeStr: string, nameStr: string, displayStr: string): void {
    if (codeStr && nameStr && displayStr) {
      const filtered = dataSet.filter(el => el[codeStr] === this.commonUtil.alpoterInfo.cd);
      if (filtered.length === 0) {
        const alpoterInfo = this.commonUtil.alpoterInfo;
        const data = {};
        data[codeStr] = alpoterInfo.cd;
        data[nameStr] = alpoterInfo.nm;
        data[displayStr] = alpoterInfo.display;
        dataSet.push(data);
      }
    }
  }
}

export interface LookupItemVO {
  tenant: string;
  uid: number;
  warehouse: string;
  logisticsId: number;
  name: string;
  display: string;
  set_item_yn: string;
}

export interface LookupExptVO {
  tenant: string;
  uid: number;
  warehouse: string;
  logisticsId: number;
  name: string;
  display: string;
  nm: string;
  cd: string;

  cust_cd: string;
  expt_cd: string;
  prtn_cd: string;
  pwh_cd: string;
  pwh_nm: string;
  displayWh: string;
  addresslocal1: string;
  addresslocal2: string;
}

export interface LookupSalesWhVO {
  tenant: string;
  uid: number;
  nm: string;
  cd: string;
  display: string;
}

export interface LookupImptVO {
  tenant: string;
  uid: number;
  warehouse: string;
  logisticsId: number;
  name: string;
  display: string;
}

export interface LookupPtrnVO {
  tenant: string;
  uid: number;
  warehouse: string;
  logisticsId: number;
  name: string;
  display: string;
}


export interface InftVO {
}

export interface paramVO {
  exptCondItem: string;
  ord_pr: number;
  file_id: any;
}

export interface saChg_sacs010VO {
  companyid: number;
  cd: number;
  name: string;
  nm: string;
  uid: number;
  display: string;
}

export interface LookupOrdNo {
  cd: string;
  nm: string;
  display: string;
  ord_gb: string;
  dg_adr1: string;
  dg_adr2: string;
  eng_biz_adr1: string;
  eng_biz_adr2: string;
  zip_no: string;
  country: string;
}

