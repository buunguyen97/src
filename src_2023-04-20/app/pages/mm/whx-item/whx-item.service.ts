import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class WhxItemService {

// 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/warehouse`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<WhxItemVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findWhxItem`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<WhxItemVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<WhxItemVO[]>> {
    const baseUrl = `${this.httpUrl}/saveWhxItem`;
    try {
      const result = await this.http.post<ApiResult<WhxItemVO[]>>(baseUrl, data).toPromise();
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

  async sync(data: {}): Promise<ApiResult<any>> {
    const baseUrl = `${this.httpUrl}/syncWhxItem`;
    try {
      console.log('aaa');
      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
      console.log('aaavv');
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

export interface WhxItemVO {
  tenant: string;
  uid: number;
  warehouseId: number;
  ownerId: number;
  itemAdminId: number;
  itemId: number;
  warehouse: string;
  owner: string;
  itemAdmin: string;
  item: string;
  unit: number;
  minQty: number;
  warehouseName: string;
  ownerName: string;
  itemName: string;
  itemAdminName: string;
}
