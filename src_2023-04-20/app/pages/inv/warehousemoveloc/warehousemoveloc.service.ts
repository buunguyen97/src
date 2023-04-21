import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {RiInstructVO} from '../ri-instruct/ri-instruct.service';

@Injectable({
  providedIn: 'root'
})
export class WarehousemovelocService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/wahMoveLoc`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RiInstructVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findWahMoveLoc`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RiInstructVO[]>>(baseUrl, searchData).toPromise();
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

  // 로케이션 이동지시
  async execute(data: any[]): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/procWahMoveLoc`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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
}

export interface WarehouseMoveVO {
  tenant: string;
  uid: number;

  ownerId: number;
  companyId: number;

  moveDate: Date;

  itemAdminId: number;
  itemId: number;

  isSerial: string;
  lotId: number;

  fromWarehouseId: number;
  fromLocId: number;
  fromTagId: number;
  fromLatitude: string;
  fromLongitude: string;

  toWarehouseId: number;
  toLocId: number;
  toTagId: number;
  toLatitude: string;
  toLongitude: string;

  transWarehouseId: number;
  transLocId: number;
  tranLatitude: string;
  tranLongitude: string;

  qty1: number;
  moveQty: number;

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  lotAttribute: LotAttributeVO;
  serialList: SerialIdVO[];
}

export interface LotAttributeVO {
  tenant: string;

  uid: number;
  damageFlg: string;
}


export interface SerialIdVO {
  tenant: string;
  serial: string;
}
