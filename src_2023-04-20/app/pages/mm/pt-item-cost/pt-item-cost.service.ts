import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtItemCostService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptitemcost`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<ProdMatCostVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtItemCost`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ProdMatCostVO[]>>(baseUrl, searchData).toPromise();
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

  async proc(data: {}): Promise<ApiResult<ProdMatCostVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/procPtItemCost`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ProdMatCostVO[]>>(baseUrl, data).toPromise();
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

export interface ProdMatCostVO {
  tenant: string;
  actFlg: string;

  uid: number;
  itemId: number;
  itemName: string;
  spec: string;
  unit: string;
  workDate: Date;
  fromDate: Date;
  toDate: Date;
  totQty: number;
  totAmt: number;
  avgPrice: number;

  pageMove: string;
}
