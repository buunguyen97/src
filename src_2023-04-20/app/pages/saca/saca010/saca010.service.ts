import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saca010Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saca010`;

  // http 객체 Injection
  constructor(private http: JHttpService) {}

   // 메인 조회
   async mainList(searchData: {}): Promise<ApiResult<Saca010VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Saca010VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Saca010VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {tenant: vTenant,
       ptrn_cd: vPtrnCd}
    );

    return this.http.post<ApiResult<Saca010VO[]>>(baseUrl, data);
  }

   // 제품 목록
   async detailList(data: {}): Promise<ApiResult<Saca010VO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
         // Post 방식으로 조회
         const result = await this.http.post<ApiResult<Saca010VO>>(baseUrl, data).toPromise();
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
}

export interface Saca010VO {
  tenant: string;
  uid: string;

  claim_no: string;       // 청구번호
  expt_cd: string;        // 수출사코드
  expt_nm: string;        // 수출사명
  cons_dt: string;        // 품의일자
  cls_mon: string;        // 청구년월
  tran_gb: string;        // 주문구분
  sale_amt: string;       // 청구금액
  sale_vat_amt: string;   // 매출부가세
  tot_sale_amt: string;   // 총매출금액
  coll_expt_cd: string;   // 입금사(대표사)
  account_tra_yn: string; // 청구여부
  st_dt: string;          // 정산시작일자
  end_dt: string;         // 정산종료일자
  createdby: number;

  fromClaimCaYM: string;
  toClaimCaYM: string;

  consItemList: ClaimDetailVO[];
}

export interface ClaimDetailVO {
  tenant: string;
  uid: string;

  out_ord_no: string;   // 출고번호
  out_dt: string;       // 출고일자
  cont_no: string;      // 계약번호
  item_cd: string;      // 품목
  item_nm: string;      // 품목명
  spec_nm: string;      // 규격
  sto_unit: string;     // 단위
  out_ord_pr: string;   // 출고단가
  out_qty: string;	    // 출고금액
  sale_amt: string;     // 청구금액
  sale_vat_amt: string; // 매출부가세
  tot_sale_amt: string; // 총매출금액
}
