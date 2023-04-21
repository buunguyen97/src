import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {SoVO} from '../../so/so/so.service';
import {InvAdjustDetailVO, InvAdjustVO} from '../invadjust/invadjust.service';

@Injectable({
  providedIn: 'root'
})
export class MatinstructService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/matInstruct`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async getBom(searchData: {}): Promise<ApiResult<MatAdjustDetailVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findBomDetail`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatAdjustDetailVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<MatAdjustVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMatInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatAdjustVO[]>>(baseUrl, searchData).toPromise();
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

  async getDetail(data: {}): Promise<ApiResult<MatAdjustVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMatInstructFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatAdjustVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveMatInstruct`;

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

  async update(data: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateMatInstruct`;

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

  async delete(data: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteMatInstruct`;

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

  async move(data: {}): Promise<ApiResult<any>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/moveMatInstruct`;

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

  async proc(data: {}): Promise<ApiResult<number[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/procMatInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<number[]>>(baseUrl, data).toPromise();
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

  async getDetailConfirmed(data: {}): Promise<ApiResult<MatAdjustVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMatConfirmedFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatAdjustVO>>(baseUrl, data).toPromise();
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

export interface MatAdjustVO {
  uid: number;
  tenant: string;

  adjustKey: string;
  ownerAdjustNo: string;
  adjustType: string;
  actFlg: string;
  sts: string;
  adjustDate: Date;
  companyId: number;
  ownerId: number;
  logisticsId: number;
  warehouseId: number;
  itemAdminId: number;
  itemId: number;

  expectQty1: number;
  inOutDate: Date;
  otherRefNo1: string;
  otherRefNo2: string;
  otherRefNo3: string;

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  adjustDetailList: MatAdjustDetailVO[];

  isSerial: string;

  masterId: number;
  relocateId: number;
}

export interface MatAdjustDetailVO {
  uid: number;
  tenant: string;

  adjustId: number;
  ownerAdjustLineNo: number;

  ownerId: number;
  warehouseId: number;
  companyId: number;
  logisticsId: number;

  itemAdminId: number;
  itemId: number;
  unit: number;
  ifItem: string;
  lotId: number;
  locId: number;
  tagId: number;

  inOutFlg: string;
  isProduct: string;

  expectQty1: number;
  expectQty2: number;
  expectQty3: number;

  adjustQty1: number;
  adjustQty2: number;
  adjustQty3: number;

  // PriceAttribute
  priceBuy: number;
  priceWholeSale: number;
  priceSale: number;

  // LogicFlgAttribute
  logicFlg1: string;
  logicFlg2: string;
  logicFlg3: string;

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

  display: string;

  whInDate: Date;
  mngDate: Date;

  relocateId: number;
  adjustKey: string;
  adjustType: string;
  adjustDate: Date;
  sts: string;

  visibleQty: number;
  bomQty: number;
  invQty: number;
  matLocQty: number;
  moveQty: number;

  moveFlg: string;
  invChkFlg: string;

  otherRefNo1: string;
  otherRefNo2: string;
  otherRefNo3: string;

  isSerial: string;

  remarks: string;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;
}


export interface MatBomVO {
  uid: number;
  tenant: string;
  itemAdminId: number;
  item: string;
  name: string;
  itemId: number;
  subItemId: number;
  // qty1: number;
  bomQty: number;
  lossQty1: number;
  lossQty2: number;
  remarks: string;

  isProduct: string;
  expectQty1: number;
  adjustQty1: number;
  visibleQty: number;
  invQty: number;
  matLocQty: number;

  warehouseId: number;
  logisticsId: number;
  ownerId: number;
  companyId: number;
}
