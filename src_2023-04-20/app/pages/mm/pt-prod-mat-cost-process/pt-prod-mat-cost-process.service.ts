import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtProdMatCostProcessService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodmatcostprocess`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdMatCostProcessVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdMatCostProcess`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdMatCostProcessVO[]>>(baseUrl, searchData).toPromise();
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


  async checkProgress(searchData: {}): Promise<ApiResult<PtProdMatCostProcessVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/checkProgress`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdMatCostProcessVO[]>>(baseUrl, searchData).toPromise();
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

  async costOut(data: {}): Promise<ApiResult<PtProdMatCostProcessVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/costOut`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdMatCostProcessVO[]>>(baseUrl, data).toPromise();
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

export interface PtProdMatCostProcessVO {
  tenant: string;
  actFlg: string;

  uid: number;
  costYm: string;

  itemId: number;
  itemName: string;
  spec: string;
  unit: string;

  workName: string;
  process: string;
  progress: string;
  result: string;

}

