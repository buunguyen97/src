import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sabu081Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sabu081`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 다건조회함수
  async mainList(searchData: {}): Promise<ApiResult<Sabu080VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList_alporter`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu080VO[]>>(baseUrl, searchData).toPromise();
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

  // 발주확정 조회
  async mainInfo(searchData: {}): Promise<ApiResult<Sabu080VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu080VO>>(baseUrl, searchData).toPromise();
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

  // 구매발주확정취소
  async purCancel(data: {}): Promise<ApiResult<Sabu080VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/purCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu080VO>>(baseUrl, data).toPromise();
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

export interface Sabu080VO {
  inp_no: string;
  ord_no: string;
  fromChkDate: string;
  toChkDate: string;

  info: FormData;
  gridList: GridVO[];

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

export interface FormData {
  tenant: string;
  uid: string;

  inp_no: string;
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
