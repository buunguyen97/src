import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sabu010Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sabu010`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }


  //메인 조회
  async mainList(searchData: {}): Promise<ApiResult<Sabu010VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu010VO[]>>(baseUrl, searchData).toPromise();
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

  //제품 목록
  async detailList(data: {}): Promise<ApiResult<Sabu010VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu010VO>>(baseUrl, data).toPromise();
      console.log(result);
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

  async contNoInfo(data: {}): Promise<ApiResult<Sabu010VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/contNoInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu010VO>>(baseUrl, data).toPromise();
      console.log(result);
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

  //저장함수
  async mainSave(data: {}): Promise<ApiResult<Sabu010VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu010VO>>(baseUrl, data).toPromise();
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

  //삭제함수
  async mainDelete(data: {}): Promise<ApiResult<Sabu010VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Sabu010VO>>(baseUrl, data).toPromise();
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


  //I/F함수
  async sendApi(data: {}): Promise<ApiResult<Sabu010VO>> {
    // 조회 Api 설정

    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/interface/sendApi`;  // sendApi
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu010VO>>(baseUrl, data).toPromise();
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

export interface Sabu010VO {
  tenant: string;
  uid: string;
  ord_no: string;       // 발주번호
  pur_cd: string;       // 매입처코드
  wh_cd: string;        // 창고
  cons_dt: string;      // 품의일자
  inp_sche_dt: string;  // 입고예정일자
  cont_no: string;      // 계약번호
  mony_unit: string;    // 화폐단위
  remark: string;       // 비고
  std_rate: number;     // 기준환율
  wrk_stat: string;     // 작업상태
  consItemList: ConsItemVO[];

  approval1: number;    // 결재자1
  approval2: number;    // 결재자2
  approval3: number;    // 결재자3

  fromOrdDate: string;
  toOrdDate: string;
  ptrn_cd: string;
  damageflg: string;
}

export interface ConsItemVO {
  tenant: string;
  uid: string;
  ord_no: string;           // 발주번호
  ord_seq: string;          // 발주순번
  item_cd: string;          // 품목명
  cons_qty: number;         // 품의수량
  pur_pr: number;           // 구매단가
  cons_amt: number;	        // 품의금액
  cons_vat_amt: number;     // 품의부가세금액
  std_pur_vat_rate: number; // 표준매입부가세율
}
