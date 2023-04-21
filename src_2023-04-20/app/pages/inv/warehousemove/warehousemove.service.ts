import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class WarehousemoveService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/move`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<MoveVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MoveVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<MoveVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMoveFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MoveVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<MoveVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MoveVO[]>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<MoveVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MoveVO[]>>(baseUrl, data).toPromise();
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

  async delete(data: MoveVO): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

  async proc(data: any[]): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/procMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

export interface MoveVO {
  tenant: string;

  uid: number;
  moveKey: string;
  ownerMoveNo: string;
  moveType: string;
  actFlg: string;
  sts: string;
  companyId: string;
  ownerId: string;
  shipSchDate: Date;
  fromLogisticsId: number;
  fromWarehouseId: number;
  carrierNo: string;
  rcvSchDate: Date;
  toLogisticsId: number;
  toWarehouseId: number;
  transLogisticsId: number;
  transWarehouseId: number;
  transLocId: number;
  otherRefNo1: string;
  otherRefNo2: string;
  otherRefNo3: string;
  autoReceiveFlg: string;
  autoShipFlg: string;
  rcvId: number;
  rcvKey: string;
  soId: number;
  soKey: string;
  deliveryType: string;
  moveDetailList: MoveDetailVO[];

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

  fromShipSchDate: string;
  toShipSchDate: string;
  fromRcvSchDate: string;
  toRcvSchDate: string;
}

export interface MoveDetailVO {
  tenant: string;

  uid: number;
  moveId: number;
  itemAdminId: number;
  itemId: number;
  ifItem: string;

  ownerItem: string;
  supplierItem: string;
  posItem: string;
  barcode: string;
  manuItem: string;

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
  noShippingFlg: string;
  foreignCargoFlg: string;
  customsReleaseFlg: string;
  taxFlg: string;
  whInDate: Date;
  mngDate: Date;

  soXdockFlg: string;
  lotReserveFlg: string;
  rcvXdockFlg: string;

  expectQty1: number;
  expectQty2: number;
  expectQty3: number;

  shippedQty1: number;
  shippedQty2: number;
  shippedQty3: number;

  receivedQty1: number;
  receivedQty2: number;
  receivedQty3: number;

  logicFlg1: number;
  logicFlg2: number;
  logicFlg3: number;
}
