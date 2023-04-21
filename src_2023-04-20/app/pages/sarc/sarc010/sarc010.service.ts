import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sarc010Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sarc010`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 출고지시 조회
  async mainList(searchData: {}): Promise<ApiResult<Sarc010VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sarc010VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Sarc010VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {
        tenant: vTenant,
        ptrn_cd: vPtrnCd
      }
    );

    return this.http.post<ApiResult<Sarc010VO[]>>(baseUrl, data);
  }

  // 회수지시 조회
  async subList(searchData: {}): Promise<ApiResult<Sarc010VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/subList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sarc010VO[]>>(baseUrl, searchData).toPromise();
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

  // 회수지시 조회
  async mainInfo(searchData: {}): Promise<ApiResult<Sarc010VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sarc010VO>>(baseUrl, searchData).toPromise();
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

  // 저장함수
  async mainSave(data: {}): Promise<ApiResult<Sarc010VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sarc010VO>>(baseUrl, data).toPromise();
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

  // 삭제함수
  async mainDelete(data: {}): Promise<ApiResult<Sarc010VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Sarc010VO>>(baseUrl, data).toPromise();
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

  // 창고변경시 제품만 따로 조회(N건)
  async getWhList(data: {}): Promise<ApiResult<Sarc010VO[]>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/getWhList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sarc010VO[]>>(baseUrl, data).toPromise();
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
}


export interface Sarc010VO {
  tenant: string;

  uid: string;

  ord_no: string;  // 주문번호
  ord_seq: string;  // 주문순번
  ord_dt: string;  // 주문일자
  wh_cd: string;  // 물류창고코드
  wh_nm: string;
  sa_wh_cd: string;  // 회수창고코드
  sa_wh_nm: string;
  expt_cd: string;  // 수출사코드
  ptrn_cd: string;  // 파트너코드
  impt_cd: string;  // 수입사코드
  impt_sa_wh_cd: string;
  impt_sa_wh_nm: string;
  rtn_ptrn_cd: string;  // 회수파트너사코드
  wrk_stat: string;

  ord_qty: number;  // 주문수량
  out_ord_qty: number;  // 회수지시수량
  out_ord_amt: number;  // 회수지시금액
  ord_amt: number;  // 주문금액

  info: formData;
  rtnItemList: RtnItemVO[];
  fromOutDate: string;
  toOutDate: string;
  fromRtnOrdDate: string;
  toRtnOrdDate: string;

  cust_cont: string;

}

export interface formData {
  tenant: string;

  uid: string;

  ord_no: string;  // 주문번호
  ord_seq: string;  // 주문순번
  ord_dt: string;  // 주문일자
  wh_cd: string;  // 물류창고코드
  sa_wh_cd: string;  // 회수창고코드
  expt_cd: string;  // 수출사코드
  ptrn_cd: string;  // 파트너코드
  impt_cd: string;  // 수입사코드
  rtn_ptrn_cd: string;  // 회수파트너사코드
  wrk_stat: string;

  ord_qty: number;  // 주문수량
  out_ord_qty: number;  // 회수지시수량
  out_ord_amt: number;  // 회수지시금액
  ord_amt: number;  // 주문금액
  cust_cont: string;

  countrycd: string;
  rtn_adr1: string;
  rtn_adr2: string;
  zip_no: string;

}

export interface RtnItemVO {
  tenant: string;

  uid: string;

  ord_no: string;  // 주문번호
  ord_seq: string;  // 주문순번
  item_cd: string;  // 제품코드
  ord_qty: number;  // 주문수량
  ord_pr: number;  // 주문단가
  ord_amt: number;  // 주문금액
  rtn_ord_seq: string;
  curt_qty: number;
}
