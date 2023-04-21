import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';
import {Saor060VO} from "../saor060/saor060.service";

@Injectable({
  providedIn: 'root'
})
export class Saor251Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saor251`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 메인 조회
  async mainList(searchData: {}): Promise<ApiResult<Saor250VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO[]>>(baseUrl, searchData).toPromise();
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

  // 디테일 조회
  async detailList(searchData: {}): Promise<any> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<any>(baseUrl, searchData).toPromise();
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

  // 항구 조회
  async searchPort(searchData: {}): Promise<any> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/searchPort`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<any>(baseUrl, searchData).toPromise();
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

  // Invoice 조회
  async subList(searchData: {}): Promise<ApiResult<Saor250VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/subList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO[]>>(baseUrl, searchData).toPromise();
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

  // 출고지시 조회
  async mainInfo(searchData: {}): Promise<ApiResult<Saor250VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO>>(baseUrl, searchData).toPromise();
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
  async itemList(data: {}): Promise<ApiResult<Saor250VO[]>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/itemList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO[]>>(baseUrl, data).toPromise();
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


  // 저장함수
  async mainSave(data: {}): Promise<ApiResult<Saor250VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO>>(baseUrl, data).toPromise();
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
  async mainUpdate(data: {}): Promise<ApiResult<Saor250VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainUpdate`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<Saor250VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Saor250VO>>(baseUrl, data).toPromise();
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

  // 확정
  async execInvoiceProcess(data: {}): Promise<ApiResult<Saor250VO>> {
    const baseUrl = `${this.httpUrl}/execInvoiceProcess`;
    try {
      const result = await this.http.post<ApiResult<Saor250VO>>(baseUrl, data).toPromise();
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

  // 시리얼 조회
  async selectInvoiceSerial(searchData: {}): Promise<ApiResult<Saor250VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/selectInvoiceSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO[]>>(baseUrl, searchData).toPromise();
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

  // 시리얼 삭제
  async deleteInvoiceSerial(searchData: {}): Promise<ApiResult<Saor250VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deleteInvoiceSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO>>(baseUrl, searchData).toPromise();
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
   * 사용중이지 않은 인보이스 시리얼 조회
   */
  async selectNotUsingInvoiceSerial(searchData: {}): Promise<ApiResult<any[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/selectNotUsingInvoiceSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any[]>>(baseUrl, searchData).toPromise();
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

  // invoice취소
  async invoiceCancel(data: {}): Promise<ApiResult<Saor250VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/invoiceCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor250VO>>(baseUrl, data).toPromise();
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

export interface Saor250VO {
  exportslip_cd: string;
  item_cd: string;
  toDate: string;
  fromDate: string;
  language: string;
  formModified: string;
  modifiedby: any;
  createdby: any;
  tenant: string;

  uid: string;

  ord_no: string;  // 주문번호
  ord_seq: string;  // 주문순번
  ord_dt: string;  // 주문일자
  expt_cd: string;  // 수출사코드
  ord_gb: string;  // 주문구분(1:판매,2:렌탈,3:견본,타계정)
  ptrn_cd: string;  // 파트너코드
  expt_country: string;
  impt_country: string;
  rtn_ptrn_cd: string;  // 회수파트너사코드
  out_stat: string;  // 작업상태(주문등록,주문할당)
  dg_country: string;  // 도착국가코드
  cont_no: string;  // 계약번호
  mony_unit: string;  // 화폐단위
  dg_adr: string;  // 납품주소
  rtn_adr: string;  // 회수주소
  dg_req_dt: string;  // 납품요청일자
  impt_cd: string;  // 수입자코드
  rent_st_dt: string;  // 렌탈시작일자
  rent_end_dt: string;  // 렌탈종료일자
  remark: string;  // 비고
  out_ord_no: string;
  wh_cd: string;
  wrk_stat: string;

  ord_qty: number;  // 주문수량
  out_ord_qty: number;  // 출고지시수량
  out_ord_amt: number;  // 출고지시금액
  ord_amt: number;  // 주문금액

  info: formData,
  ordItemList: OrdItemVO[];
}

export interface formData {
  salesWhCd: string;
  slipdate: string;
  impt_port: string;
  expt_port: string;
  unload_port: string;
  load_port: string;
  language: string;
  formModified: string;
  modifiedby: any;
  createdby: any;
  ordItemList: any[];
  tenant: string;
  exportslip_cd: string;
  uid: string;

  ord_no: string,  // 주문번호
  ord_seq: string,  // 주문순번
  ord_dt: string,  // 주문일자
  expt_cd: string,  // 수출사코드
  ord_gb: string,  // 주문구분(1:판매,2:렌탈,3:견본,타계정)
  ptrn_cd: string,  // 파트너코드
  expt_country: string,
  impt_country: string,

  rtn_ptrn_cd: string,  // 회수파트너사코드
  out_stat: string,  // 작업상태(주문등록,주문할당)
  dg_country: string,  // 도착국가코드
  cont_no: string,  // 계약번호
  mony_unit: string,  // 화폐단위
  dg_adr: string,  // 납품주소
  rtn_adr: string,  // 회수주소
  dg_req_dt: string,  // 납품요청일자
  impt_cd: string,  // 수입자코드
  rent_st_dt: string,  // 렌탈시작일자
  rent_end_dt: string,  // 렌탈종료일자
  remark: string,  // 비고
  out_ord_no: string,
  wh_cd: string,
  wrk_stat: string,

  ord_qty: number,  // 주문수량
  out_ord_qty: number,  // 출고지시수량
  out_ord_amt: number,  // 출고지시금액
  ord_amt: number,  // 주문금액

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
