import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class InvTagWhService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/invTagWh`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<InvTagWhVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findInvTagWh`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvTagWhVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<InvSerialVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findInvTagWhFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvSerialVO>>(baseUrl, data).toPromise();
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

export interface InvTagWhVO {
  tenant: string;

  logicalKey: string;

  locGroup: string;
  locid: number;
  itemId: number;
  item: string;
  itemName: string;
  spec: string;

  warehouseId: number;
  warehouse: string;
  warehouseName: string;
  totalItemCnt: number;
  totalInstructedQty1: number;
  totalAllocatedQty1: number;
  totalQty1: number;
  totalAbleQty1: number;
  ownerId: number;
  owner: string;
  ownerName: string;
  itemAdmin: string;
  itemAdminName: string;
  itemAdminId: number;
  minQty: number;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

}

export interface InvSerialVO {
  tenant: string;
  uid: number;

  warehouseId: number;
  warehouse: string;
  warehouseName: string;

  ownerId: number;
  owner: string;
  ownerName: string;

  itemAdminId: number;
  itemAdmin: string;
  itemAdminName: string;

  itemId: number;
  item: string;
  itemName: string;

  lotId: number;

  lot1: string;
  lot2: string;
  lot3: string;
  lot4: string;
  lot5: string;
  lot6: string;
  lot7: string;
  lot8: string;
  lot9: string;
  lot10: string;

  damageFlg: string;
  noShippingFlg: boolean;
  foreignCargoFlg: boolean;
  customsReleaseFlg: boolean;
  taxFlg: boolean;
  whInDate: Date;
  mngDate: Date;

  serial: string;
  txType: string;
  key: number;
  lineNo: number;
}


