import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sabu040Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sabu040`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  //발주 조회
  async mainList(searchData: {}): Promise<ApiResult<Sabu040VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList_alporter`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu040VO[]>>(baseUrl, searchData).toPromise();
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


  // 발주 조회
  async mainInfo(searchData: {}): Promise<ApiResult<Sabu040VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu040VO>>(baseUrl, searchData).toPromise();
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
  async purWrkStatChange(data: {}): Promise<ApiResult<Sabu040VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/purWrkStatChange`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu040VO>>(baseUrl, data).toPromise();
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
  async mainSave(data: {}): Promise<ApiResult<Sabu040VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu040VO>>(baseUrl, data).toPromise();
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

export interface GridVO {
  tenant: string;
  uid: string;

  ord_no: string;  // 발주번호
  ord_seq: string;  // 발주순번
  item_cd: string;  // 제품코드

  ord_pr: number;  // 발주단가
  ord_qty: number;  // 발주수량
  ord_amt: number;  // 발주금액

  chk_qty: number;
  chk_amt: number;
  chk_vat_amt: number;
}

export interface Sabu040VO {
  tenant: string;

  uid: string;

  ord_no: string;  // 발주번호
  ord_dt: string;  // 발주일자
  pur_cd: string;  // 수출사코드
  wh_cd: string;

  cont_no: string;  // 계약번호
  mony_unit: string;  // 화폐단위
  wrk_stat: string;
  ptrn_cd: string;

  info: FormData;
  gridList: GridVO[];

  fromOrdDate: string;
  toOrdDate: string;
  damageflg: string;
  ownerId: string;

  add_price1: number;
  add_price2: number;
  add_price3: number;
  add_price4: number;
  add_price5: number;
}

export interface FormData {
  tenant: string;
  uid: string;

  ord_no: string;  // 발주번호
  ord_dt: string;  // 발주일자
  pur_cd: string;  // 매입처코드
  wh_cd: string;  // 창고코드

  cont_no: string;  // 계약번호
  mony_unit: string;  // 화폐단위
  wrk_stat: string;
  ptrn_cd: string;
  damageflg: string;

}
