import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class ReplenishPriorityService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/ReplenishPriority`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ReplenishPriorityVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findReplenishPriority`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ReplenishPriorityVO[]>>(baseUrl, searchData).toPromise();
      console.log(result);
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

  async getPopup(data: {}): Promise<ApiResult<ReplenishPriorityVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findReplenishPriorityFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ReplenishPriorityVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<ReplenishPriorityVO>> {
    const baseUrl = `${this.httpUrl}/saveReplenishPriority`;
    try {
      const result = await this.http.post<ApiResult<ReplenishPriorityVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<ReplenishPriorityVO>> {
    const baseUrl = `${this.httpUrl}/updateReplenishPriority`;
    try {
      const result = await this.http.post<ApiResult<ReplenishPriorityVO>>(baseUrl, data).toPromise();
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

  async delete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/deleteReplenishPriority`;
    try {
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

// BackEnd의 VO와 맞춤
export interface ReplenishPriorityVO {
  tenant: string;
  uid: number;
  warehouseId: number;
  warehouse: string;
  warehouseName: string;
  ownerId: number;
  owner: string;
  name: string;
  replenishPriorityKey: string;
  ownerName: string;
  objectName: string;
  remarks: string;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

  ReplenishPriorityDetailList: LookupReplenishPriorityVO[];
}

export interface LookupReplenishPriorityVO {
  tenant: string;
  uid: number;

  ownerId: number;
  itemAdminId: number;
  name: string;
  replenishPriorityKey: string;
  objectName: string;

  remarks: string;
}

