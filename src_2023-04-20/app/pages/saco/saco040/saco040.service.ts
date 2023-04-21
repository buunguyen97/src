import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saco040Service {

    // 기본 URL 선언
    httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saco040`;

    // http 객체 Injection
    constructor(private http: JHttpService) { }

    // 메인 조회
    async mainList(searchData: {}): Promise<ApiResult<Saco040VO[]>> {
        // 조회 Api 설정
        const baseUrl = `${this.httpUrl}/mainList`;
        try {
            // Post 방식으로 조회
            const result = await this.http.post<ApiResult<Saco040VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Saco040VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {tenant: vTenant,
       ptrn_cd: vPtrnCd}
    );

    return this.http.post<ApiResult<Saco040VO[]>>(baseUrl, data);
  }

}

export interface Saco040VO {

  language: string;
  formModified: string;
  modifiedby: string;
  createdby: string;
  tenant: string;

  fromDate: string;
  toDate: string;

  claim_no: string; // 청구번호
  cls_mon: string; // 청구년월
  expt_cd: string; // 수출사코드
  expt_nm: string; // 수출사명
  ord_gb: string; // 주문구분
  depo_dt: string; // 입금일자
  depo_no: string; // 입금번호
  depo_amt: string; // 입금액
  coll_expt_cd: string; // 정산수출사코드
  coll_expt_nm: string; // 정산수출사명
}
