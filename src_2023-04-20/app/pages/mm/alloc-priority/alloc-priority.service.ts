import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class AllocPriorityService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/AllocPriority`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<AllocPriorityVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findAllocPriority`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<AllocPriorityVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<AllocPriorityVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findAllocPriorityFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<AllocPriorityVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<AllocPriorityVO>> {
    const baseUrl = `${this.httpUrl}/saveAllocPriority`;
    try {
      const result = await this.http.post<ApiResult<AllocPriorityVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<AllocPriorityVO>> {
    const baseUrl = `${this.httpUrl}/updateAllocPriority`;
    try {
      const result = await this.http.post<ApiResult<AllocPriorityVO>>(baseUrl, data).toPromise();
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
    const baseUrl = `${this.httpUrl}/deleteAllocPriority`;
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
export interface AllocPriorityVO {
  tenant: string;
  uid: number;
  warehouseId: number;
  warehouse: string;
  warehouseName: string;
  ownerId: number;
  owner: string;
  name: string;
  allocPriorityKey: string;
  ownerName: string;
  allocStyleType: string;
  priority: number;
  objectName: string;
  remarks: string;

  orderByWhInDate: string;
  orderByMngDate: string;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

  AllocPriorityDetailList: LookupAllocPriorityVO[];
}

export interface LookupAllocPriorityVO {
  tenant: string;
  uid: number;

  ownerId: number;
  itemAdminId: number;
  slotPriorityKey: string;
  name: string;
  slotStyleType: string;
  priority: number;
  objectName: string;
  setRcvTagLocFlg: string;

  remarks: string;
}

