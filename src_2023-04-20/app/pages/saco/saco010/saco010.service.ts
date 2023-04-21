import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saco010Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saco010`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 메인 조회
   async mainList(searchData: {}): Promise<ApiResult<Saco010VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;
     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Saco010VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Saco010VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {tenant: vTenant,
       ptrn_cd: vPtrnCd}
    );

    return this.http.post<ApiResult<Saco010VO[]>>(baseUrl, data);
  }

  // 저장함수
  async mainSave(data: {}): Promise<ApiResult<Saco010VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saco010VO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<Saco010VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Saco010VO>>(baseUrl, data).toPromise();
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

export interface Saco010VO {
  language: string;
  formModified: string;
  modifiedby: string;
  createdby: string;
  tenant: string;

  depo_no: string;   // 입금번호
  depo_dt: string;   // 입금일자
  expt_cd: string;   // 수출사코드
  ord_gb: string;    // 주문구분(1:판매,2:렌탈)
  depo_gb: string;   // 입금구분(1:현금,2:어음,3:기타)
  mony_unit: string; // 화폐단위
  depo_amt: number;  // 입금금액
  std_rate: number;  // 기준환율
  krw_depo_amt: number;  // 원화입금금액
  remark: string;     // 비고
  dishonor_yn: string;  // 부도여부
  expi_dt: string;      // 만기일자
  fromDepoDate: string;
  toDepoDate: string;
  claim_no: string;
  claim_amt: number;
  bal_amt: number;
}

export interface LookupExptClaim {
  tenant: string;
  expt_cd: string;   // 수출사코드

  cd: string;
  ord_gb: string;    // 주문구분(1:판매,2:렌탈)
  expt_nm: string;
  display: string;
  tot_sale_amt: number;    // 청구금액
  tot_remain_amt: number;  // 청구잔액
  bond_cls_yn: string;     // 채권마감여부
}
