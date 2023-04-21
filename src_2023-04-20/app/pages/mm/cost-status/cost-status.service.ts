import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class CostStatusService {


  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/coststatus`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<CostStatusVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findCostStatus`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CostStatusVO[]>>(baseUrl, searchData).toPromise();
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

export interface CostStatusVO {
  tenant: string;
  itemAdminId: number;
  uid: number;
  reqDate: string;
  fromReqDate: string;
  toReqDate: string;

  itemId: number;

  costGb: string;

  costStatusDetailList: CostStatusDetailVO[];

}

export interface CostStatusDetailVO {
  tenant: string;

  uid: number;
  reqDate: string;
  fromReqDate: string;
  toReqDate: string;

  itemId: number;
  item: string;
  itemName: string;
  spec: string;
  unit: string;

  costYm: string;

  prodQty: number;
  matCost: number;
  unitMat: number;
  unitSaly: number;
  unitAmt: number;

  fromDate: Date;
  toDate: Date;
}

