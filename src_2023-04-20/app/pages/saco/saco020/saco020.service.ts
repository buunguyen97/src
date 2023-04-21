import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saco020Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saco020`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 메인 조회
   async mainList(searchData: {}): Promise<ApiResult<Saco020VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;
     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Saco020VO[]>>(baseUrl, searchData).toPromise();
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
  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Saco020VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {tenant: vTenant,
       ptrn_cd: vPtrnCd}
    );

    return this.http.post<ApiResult<Saco020VO[]>>(baseUrl, data);
  }
}

export interface Saco020VO {
  tenant: string;

  depo_no: string;   // 입금번호
  depo_dt: string;   // 입금일자
  expt_cd: string;   // 수출사코드
  ord_gb: string;    // 주문구분(1:판매,2:렌탈)
  depo_gb: string;   // 입금구분(1:현금,2:어음,3:기타)
  mony_unit: string; // 화폐단위
  depo_amt: number;  // 입금금액
  std_rate: number;  // 기준환율
  expi_dt: string;   // 만기일자
  claim_no: string;  // 청구번호
  remark: string;    // 비고
  fromDepoDate: string;
  toDepoDate: string;
}
