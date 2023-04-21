import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtProdMatTotService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodmattot`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdMatTotVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdMatTot`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdMatTotVO[]>>(baseUrl, searchData).toPromise();
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

  async ptProdMatTot(data: {}): Promise<ApiResult<PtProdMatTotVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/ptProdMatTot`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdMatTotVO>>(baseUrl, data).toPromise();
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


export interface PtProdMatTotVO {
  tenant: string;

  uid: number;
  itemId: number;
  costYm: string;
  spec: string;
  matTot: number;
  pageMove: string;
  ptProdMatTotDetailList: PtProdMatTotDetailList[];

}


export interface PtProdMatTotDetailList {
  tenant: string;
  uid: number;

  itemId: number;
  item: string;
  itemName: string;

  spec: string;
  unit: string;
  costYm: string;
  matTot: number;
  actFlg: string;
}

