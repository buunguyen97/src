import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class BomService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/bom`;

  // http 객체 Injection
  constructor(
    private http: JHttpService
  ) {
  }

  async get(searchData: {}): Promise<ApiResult<BomVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findBom`;
    try {
      // post 방식으로 조회
      const result = await this.http.post<ApiResult<BomVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<BomVO[]>> {
    const baseUrl = `${this.httpUrl}/saveBom`;
    try {
      const result = await this.http.post<ApiResult<BomVO[]>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

  async getItemAdminIdFull(searchData: {}): Promise<ApiResult<BomVO[]>> {
    const baseUrl = `${this.httpUrl}/findItemAdminIdFull`;
    try {
      // post 방식으로 조회
      const result = await this.http.post<ApiResult<BomVO[]>>(baseUrl, searchData).toPromise();
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
}

export interface BomVO {
  uid: number;
  tenant: string;
  itemAdminId: number;
  item: string;
  name: string;
  itemId: number;
  subItemId: string;
  rootItemId: number;
  qty1: number;
  lossQty1: number;
  lossQty2: number;

  remarks: string;
  createdBy: string;
  createdDateTime: Date;
  createIp: string;
  modifiedBy: string;
  modifiedDateTime: Date;
  modifiedIp: string;

}

