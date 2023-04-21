import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacl040Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacl040`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 메인 조회
   async mainList(searchData: {}): Promise<ApiResult<Sacl040VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Sacl040VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Sacl040VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {tenant: vTenant,
       ptrn_cd: vPtrnCd}
    );

    return this.http.post<ApiResult<Sacl040VO[]>>(baseUrl, data);
  }

   // 저장함수
   async mainSave(data: {}): Promise<ApiResult<Sacl040VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl040VO>>(baseUrl, data).toPromise();
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

export interface Sacl040VO {
  tenant: string;

  uid: string;

  fromClsYM: string;
  toClsYM: string;

  createdby: string;
  modifiedby: string;

  gridList: gridVo[];
}

export interface gridVo {
  tenant: string;

  uid: string;

  cls_mon: string;
  expt_cd: string;
  coll_expt_cd: string;
  ord_gb: string;
  claim_no: string;
  wrk_dt: Date;

  sale_amt: number;
  sale_vat_amt: number;
  tot_sale_amt: number;
}
