import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtProdCostService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodcost`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdCostVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdCost`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdCostVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수(디테일포함)
  async getFull(searchData: {}): Promise<ApiResult<PtProdCostVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdCostFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdCostVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<PtProdCostVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/savePtProdCost`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdCostVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<PtProdCostVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updatePtProdCost`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdCostVO>>(baseUrl, data).toPromise();
      return result;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }


  async delete(data: PtProdCostVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deletePtProdCost`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

export interface PtProdCostVO {
  tenant: string;
  itemAdminId: number;
  uid: number;
  reqDate: string;
  fromReqDate: string;
  toReqDate: string;

  costGb: string;

  ptProdCostDetailList: PtProdCostDetailVO[];

}


export interface PtProdCostDetailVO {
  tenant: string;

  uid: number;
  reqDate: string;
  costGb: string;
  amt: number;

  divdYn: string;
  remarks: string;
}

