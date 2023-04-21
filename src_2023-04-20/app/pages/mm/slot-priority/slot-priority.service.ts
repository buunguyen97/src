import {Injectable} from '@angular/core';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class SlotPriorityService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/SlotPriority`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<SlotPriorityVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSlotPriority`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<SlotPriorityVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<SlotPriorityVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSlotPriorityFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<SlotPriorityVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<SlotPriorityVO>> {
    const baseUrl = `${this.httpUrl}/saveSlotPriority`;
    try {
      const result = await this.http.post<ApiResult<SlotPriorityVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<SlotPriorityVO>> {
    const baseUrl = `${this.httpUrl}/updateSlotPriority`;
    try {
      const result = await this.http.post<ApiResult<SlotPriorityVO>>(baseUrl, data).toPromise();
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
    const baseUrl = `${this.httpUrl}/deleteSlotPriority`;
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
export interface SlotPriorityVO {
  tenant: string;
  uid: number;
  warehouseId: number;
  warehouse: string;
  warehouseName: string;
  ownerId: number;
  owner: string;
  name: string;
  slotPriorityKey: string;
  ownerName: string;
  slotStyleType: string;
  setRcvTagLocFlg: string;
  priority: number;
  objectName: string;
  remarks: string;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

  SlotPriorityDetailList: LookupSlotPriorityVO[];
}

export interface LookupSlotPriorityVO {
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
