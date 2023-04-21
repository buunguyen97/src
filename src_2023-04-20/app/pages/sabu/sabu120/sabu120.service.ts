import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sabu120Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sabu120`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 반품 조회
  async mainList(searchData: {}): Promise<ApiResult<Sabu120VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu120VO[]>>(baseUrl, searchData).toPromise();

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

  // 매입 조회
  async inpList(searchData: {}): Promise<ApiResult<Sabu120VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/inpList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu120VO[]>>(baseUrl, searchData).toPromise();

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

  // mainForm 조회
  async mainInfo(searchData: {}): Promise<ApiResult<Sabu120VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu120VO>>(baseUrl, searchData).toPromise();
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
  async mainSave(data: {}): Promise<ApiResult<Sabu120VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu120VO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<Sabu120VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Sabu120VO>>(baseUrl, data).toPromise();
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

export interface Sabu120VO {
  tenant: string;

  uid: string;

  pur_rtn_no: string;  // 주문번호
  pur_rtn_seq: string;  // 주문순번
  ord_dt: string;  // 주문일자
  wh_cd: string;  // 회수창고코드
  expt_cd: string;  // 수출사코드
  ptrn_cd: string;  // 파트너코드
  impt_cd: string;  // 수입사코드
  rtn_ptrn_cd: string;  // 회수파트너사코드
  wrk_stat: string;

  fromInpDate: string;
  toInpDate: string;
  inpNoSch: string;
  purCdSch: string;
  whCdSch: string;
  zipNoSch: string;
  bizAdrSch: string;

  ord_qty: number;  // 주문수량
  out_ord_qty: number;  // 회수지시수량
  out_ord_amt: number;  // 회수지시금액
  ord_amt: number;  // 주문금액

  info: formData;
  rtnItemList: RtnItemVO[];

  fromRtnDate: string;
  toRtnDate: string;
}

export interface formData {
  tenant: string;

  uid: string;

  pur_rtn_no: string;  // 주문번호
  pur_rtn_seq: string;  // 주문순번
  ord_dt: string;  // 주문일자
  wh_cd: string;  // 회수창고코드
  expt_cd: string;  // 수출사코드
  ptrn_cd: string;  // 파트너코드
  impt_cd: string;  // 수입사코드
  rtn_ptrn_cd: string;  // 회수파트너사코드
  wrk_stat: string;

  fromInpDate: string;
  toInpDate: string;
  inpNoSch: string;
  purCdSch: string;
  whCdSch: string;
  zipNoSch: string;
  bizAdrSch: string;

  ord_qty: number;  // 주문수량
  out_ord_qty: number;  // 회수지시수량
  out_ord_amt: number;  // 회수지시금액
  ord_amt: number;  // 주문금액

  inp_no: string;

}

export interface RtnItemVO {
  tenant: string;

  uid: string;

  ord_no: string;  // 주문번호
  pur_rtn_seq: string;  // 주문순번
  item_cd: string;  // 제품코드
  ord_qty: number;  // 주문수량
  ord_pr: number;  // 주문단가
  ord_amt: number;  // 주문금액
}
