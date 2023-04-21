import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sabu020Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sabu020`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 메인 조회
  async mainList(searchData: {}): Promise<ApiResult<Sabu020VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList_alportor`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu020VO[]>>(baseUrl, searchData).toPromise();
      console.log(result.data);
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

  // 제품 목록
  async detailList(data: {}): Promise<ApiResult<Sabu020VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu020VO>>(baseUrl, data).toPromise();
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

  // 저장 함수
  async mainSave(data: {}): Promise<ApiResult<Sabu020VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu020VO>>(baseUrl, data).toPromise();
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

  // I/F함수
  async sendApi(data: {}): Promise<ApiResult<Sabu020VO>> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/interface/sendApi`;  // sendApi

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu020VO>>(baseUrl, data).toPromise();
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

export interface Sabu020VO {
  tenant: string;

  uid: string;

  ord_no: string;     // 발주번호
  pur_cd: string;       // 매입처코드
  wh_cd: string;      // 창고
  cons_dt: string;      // 품의일자
  inp_sche_dt: string;  // 입고예정일자
  cont_no: string;      // 계약번호
  mony_unit: string;    // 화폐단위
  ord_dt: string;      // 발주일자
  dg_adr1: string;      // 납품주소
  remark: string;     // 비고
  std_rate: number;     // 기준환율
  cons_qty: number;     // 품의수량
  cons_pr: number;      // 구매단가
  item_cd: string;     // 품목명
  wrk_stat: string;    // 작업상태
  first_wrk: string;	// 1차 결재
  second_wrk: string;	// 2차 결재
  final_wrk: string;	// 최종 결재
  dg_adr: string;
  cons_vat_amt: number;
  cons_amt: number;

  consItemList: ConsItemVO[];

  approval1: number;
  approval2: number;
  approval3: number;

  approval1date: Date;
  approval2date: Date;
  approval3date: Date;

  isReject: string;

  fromOrdDate: string;
  toOrdDate: string;
  ptrn_cd: string;
  damageflg: string;

  createdby: string;
  createddatetime: string;
  createdip: string;
  modifiedby: string;
  modifieddatetime: string;
  modifiedip: string;

}

export interface ConsItemVO {
  tenant: string;

  uid: string;

  ord_no: string;       // 발주번호
  ord_seq: string;      // 발주순번
  pur_cd: string;       // 매입처코드
  remark: string;       // 비고
  item_cd: string;      // 품목명
  cons_qty: number;     // 품의수량
  cons_pr: number;     // 구매단가
  cons_amt: number;	    // 품의금액
  cons_vat_amt: number; // 품의부가세금액
}
