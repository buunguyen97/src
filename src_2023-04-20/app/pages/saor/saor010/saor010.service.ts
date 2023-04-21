import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saor010Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saor010`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  //메인 조회
  async mainList(searchData: {}): Promise<ApiResult<Saor010VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor010VO[]>>(baseUrl, searchData).toPromise();
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
  async detailList(data: {}): Promise<ApiResult<Saor010VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor010VO>>(baseUrl, data).toPromise();
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

  async contNoInfo(data: {}): Promise<ApiResult<Saor010VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/contNoInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor010VO>>(baseUrl, data).toPromise();
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
  async mainSave(data: {}): Promise<ApiResult<Saor010VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor010VO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<Saor010VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Saor010VO>>(baseUrl, data).toPromise();
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

  //I/F함수
  async sendApi(data: {}): Promise<ApiResult<Saor010VO>> {
    // 조회 Api 설정

    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/interface/sendApi`;  // sendApi
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor010VO>>(baseUrl, data).toPromise();
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

export interface Saor010VO {
  language: string;
  formModified: string;
  modifiedby: string;
  createdby: string;
  tenant: string;

  uid: string;

  ord_no: string;      // 주문번호
  ord_seq: string;     // 주문순번
  expt_cd: string;     // 수출사코드
  ord_gb: string;      // 주문구분(1:판매,2:렌탈,3:견본,타계정)
  ord_dt: string;      // 주문일자
  ptrn_cd: string;     // 파트너코드
  out_stat: string;    // 작업상태(주문등록,주문할당)
  dg_country: string;  // 도착국가코드
  cont_no: string;     // 계약번호
  mony_unit: string;   // 화폐단위
  std_rate: number;    // 기준환율
  biz_adr1: string;     // 납품주소1
  biz_adr2: string;     // 납품주소2
  eng_biz_adr1: string; // 영어주소1
  zip_no: string;      // 우편번호
  country: string;     // 국가
  dg_req_dt: string;   // 납품요청일자
  impt_cd: string;     // 수입자코드
  remark: string;      // 비고
  sa_chg_nm: string;   // 영업담당자
  sa_chg_tel_no: string; // 담당자번호
  item_cd: string;
  fromOrdDate: string;
  toOrdDate: string;

  sa_wh_cd: string;
  eng_biz_adr2: string;

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
