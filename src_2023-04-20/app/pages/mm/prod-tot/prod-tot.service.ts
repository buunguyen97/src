import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class ProdTotService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/prodtot`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<ProdTotVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findProdTot`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ProdTotVO[]>>(baseUrl, searchData).toPromise();
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

  async prodTotCnt(data: {}): Promise<ApiResult<ProdTotVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/prodTotCnt`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ProdTotVO>>(baseUrl, data).toPromise();
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


export interface ProdTotVO {
  tenant: string;

  uid: number;
  prodDate: string;
  costYm: string;
  pageMove: string;
  // workDate: Date;
  // itemId: number;        // 품목
  // item: string;
  // itemName: string;
  //
  // spec: string;
  // unit: string;
  //
  // ordQty: number;   // 지시량
  // prodQty: number;  // 총실적
  // nonQty: number;        // 불량수량
  // nonQtyRate: number;     // 불량율
  //
  // totProdQty: number;
  ptProdTotDetailList: PtProdTotDetailList[];

}


export interface PtProdTotDetailList {
  tenant: string;

  uid: number;
  prodDate: string;
  costYm: string;
  // workDate: Date;
  itemId: number;        // 품목
  item: string;
  itemName: string;

  spec: string;
  unit: string;

  ordQty: number;   // 지시량
  prodQty: number;  // 총실적
  // nonQty: number;        // 불량수량
  // nonQtyRate: number;     // 불량율

  // totProdQty: number;
}

