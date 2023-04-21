import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class CostStatementService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/costStatement`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<CostStatementVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findCostStatement`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CostStatementVO[]>>(baseUrl, searchData).toPromise();
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


export interface CostStatementVO {
  tenant: string;

  uid: number;
  itemId: number;
  costYm: string;


  prodQty: number;
  unitMat: number;
  unitSaly: number;
  unitAmt: number;
  unitAmt1: number;
  unitAmt2: number;
  unitAmt3: number;
  matCost: number;

  costStatementDetailList: CostStatementDetailList[];

}


export interface CostStatementDetailList {
  tenant: string;
  uid: number;

  item: string;
  itemName: string;
  unit: string;
  spec: string;
  prodQty: number;
  unitMat: number;
  unitSaly: number;
  unitAmt: number;
  unitAmt1: number;
  unitAmt2: number;
  unitAmt3: number;
  matCost: number;
}
