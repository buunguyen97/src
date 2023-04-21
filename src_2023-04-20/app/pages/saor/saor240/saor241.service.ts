import { Injectable } from '@angular/core';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';
import {Saor200VO} from '../saor200/saor200.service';

@Injectable({
  providedIn: 'root'
})
export class Saor241Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saor241`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 다건조회함수
   async mainList(searchData: {}): Promise<ApiResult<Saor240VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Saor240VO[]>>(baseUrl, searchData).toPromise();
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

  // 반품확정 조회
  async mainInfo(searchData: {}): Promise<ApiResult<Saor240VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor240VO>>(baseUrl, searchData).toPromise();
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

  // 반품확정취소
  async returnCancel(data: {}): Promise<ApiResult<Saor200VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/returnCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor200VO>>(baseUrl, data).toPromise();
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

export interface Saor240VO {
  fromOrdDate: string;
  toOrdDate: string;

  ord_no:      string;  // 주문번호
  ord_seq:     string;  // 주문순번

  info: formData;
  ordItemList: OrdItemVO[];
}


export interface formData {
  sa_wh_cd: string;
  tenant: string;

  uid: string;

  ord_no:      string;  // 주문번호
  ord_seq:     string;  // 주문순번
  ord_dt:      string;  // 주문일자
  expt_cd:     string;  // 수출사코드
  ord_gb:      string;  // 주문구분(1:판매,2:렌탈,3:견본,타계정)
  ptrn_cd:     string;  // 파트너코드
  expt_country:     string;
  impt_country:     string;

  rtn_ptrn_cd: string;  // 회수파트너사코드
  out_stat:    string;  // 작업상태(주문등록,주문할당)
  dg_country:  string;  // 도착국가코드
  cont_no:     string;  // 계약번호
  mony_unit:   string;  // 화폐단위
  dg_adr:      string;  // 납품주소
  rtn_adr:     string;  // 회수주소
  dg_req_dt:   string;  // 납품요청일자
  impt_cd:     string;  // 수입자코드
  rent_st_dt:  string;  // 렌탈시작일자
  rent_end_dt: string;  // 렌탈종료일자
  remark:      string;  // 비고
  out_ord_no:  string;
  wh_cd:       string;
  wrk_stat:    string;

  ord_qty:     number;  // 주문수량
  out_ord_qty: number;  // 출고지시수량
  out_ord_amt: number;  // 출고지시금액
  ord_amt:     number;  // 주문금액

}

export interface OrdItemVO {
  tenant: string;

  uid: string;

  ord_no           : string;  // 주문번호
  ord_seq          : string;  // 주문순번
  item_cd          : string;  // 제품코드
  ord_qty          : number;  // 주문수량
  ord_pr           : number;  // 주문단가
  ord_amt          : number;  // 주문금액
  re_suspen        : string;
}
