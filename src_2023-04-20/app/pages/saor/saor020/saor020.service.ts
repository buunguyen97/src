import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saor020Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saor020`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  //다건조회함수
  async mainList(searchData: {}): Promise<ApiResult<Saor020VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor020VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Saor020VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {tenant: vTenant,
       ptrn_cd: vPtrnCd}
    );

    return this.http.post<ApiResult<Saor020VO[]>>(baseUrl, data);
  }

  //단건조회함수
  async detailList(data: {}): Promise<ApiResult<Saor020VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor020VO>>(baseUrl, data).toPromise();
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

  async contNoInfo(data: {}): Promise<ApiResult<Saor020VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/contNoInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor020VO>>(baseUrl, data).toPromise();
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
  async mainSave(data: {}): Promise<ApiResult<Saor020VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor020VO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<Saor020VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Saor020VO>>(baseUrl, data).toPromise();
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

  // Sales WareHouse
  sales_wh_list(vTenant: string, vUsedYn: string, vPtrnCd: string): Observable<ApiResult<SalesWhVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sast070/sales_wh_list`;
    const data = Object.assign(
      {
        tenant: vTenant
        , used_yn: vUsedYn
        , ptrn_cd: vPtrnCd
      }
    );
    return this.http.post<ApiResult<SalesWhVO[]>>(baseUrl, data);
  }

}

export interface Saor020VO {
  wrkStat: string;
  tenant: string;

  uid: string;

  ord_no: string,       // 주문번호
  ord_seq: string,      // 주문순번
  expt_cd: string,      // 수출사코드
  ord_gb: string,       // 주문구분(1:판매,2:렌탈,3:견본,타계정)
  ord_dt: string,       // 주문일자
  ptrn_cd: string,      // 파트너사코드
  out_stat: string,     // 작업상태(주문등록,주문할당)
  dg_country: string,   // 도착국가코드
  cont_no: string,      // 계약번호
  mony_unit: string,    // 화폐단위
  std_rate: number,     // 기준환율
  dg_adr1: string,      // 납품주소1
  dg_adr2: string,      // 납품주소2
  dg_req_dt: string,    // 납품요청일자
  impt_cd: string,      // 수입사코드
  remark: string,       // 비고
  rtn_ptrn_cd: string,  // 회수파트너사코드
  rent_st_dt: string,   // 렌탈시작일자
  rent_end_dt: string,  // 렌탈종료일자
  sa_chg_nm: string,    // 영업담당자
  sa_chg_tel_no: string,
  country: string,
  biz_adr1: string;
  biz_adr2: string;
  eng_biz_adr1: string;
  eng_biz_adr2: string;
  zip_no: string;
  fromOrdDate: string;
  toOrdDate: string;

  sa_wh_cd: string;
  cont_rental_period: number;

  ordItemList: OrdItemVO[];
}

export interface OrdItemVO {
  tenant: string;

  uid: string;

  ord_no: string;  // 주문번호
  ord_seq: string;  // 주문순번
  item_cd: string;  // 제품코드
  ord_qty: number;  // 주문수량
  ord_pr: number;  // 주문단가
  ord_amt: number;  // 주문금액
}

export interface SalesWhVO {
  tenant: string;

  used_yn: string;
  ptrn_cd: string;
  cd: string;
  nm: string;
  display: string;
}
