import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class InvTagWhLocationService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/invTagWhLocation`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<InvTagWhLocationVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findInvTagWhLocation`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvTagWhLocationVO[]>>(baseUrl, searchData).toPromise();
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

export interface InvTagWhLocationVO {
  tenant: string;

  logicalKey: string;

  locGroup: string;
  location: string;
  locationId: number;
  locid: number;
  itemId: number;
  item: string;
  itemName: string;

  warehouseId: number;
  warehouse: string;
  warehouseName: string;
  totalItemCnt: number;
  totalInstructedQty1: number;
  totalAllocatedQty1: number;
  totalExpectedQty1: number;
  totalQty1: number;
  totalAbleQty1: number;
  ownerId: number;
  owner: string;
  ownerName: string;
  itemAdmin: string;
  itemAdminId: number;
  itemAdminName: string;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;
}

