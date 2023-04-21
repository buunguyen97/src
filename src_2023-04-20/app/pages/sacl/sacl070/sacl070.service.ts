import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacl070Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacl070`;

  constructor(private http: JHttpService) { }

  // 메인 조회
  async mainList(searchData: {}): Promise<ApiResult<Sacl070VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl070VO[]>>(baseUrl, searchData).toPromise();
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

export interface Sacl070VO {
  tenant: string;

  uid: string;


  fromDate: string;
  toDate: string;
  ptrn_cd: string;
  item_cd: string;
  total_sum: string;

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
  bond_cls_yn: string;

  sale_amt: number;
  sale_vat_amt: number;
  tot_sale_amt: number;
}
