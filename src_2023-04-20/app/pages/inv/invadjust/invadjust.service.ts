import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class InvadjustService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/invAdjust`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<InvAdjustVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findInvAdjust`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvAdjustVO[]>>(baseUrl, searchData).toPromise();
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

  async findAdjustFull(searchData: {}): Promise<ApiResult<InvAdjustVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findAdjustFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvAdjustVO>>(baseUrl, searchData).toPromise();
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

  async saveAdjust(searchData: {}): Promise<ApiResult<InvAdjustVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveAdjust`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvAdjustVO[]>>(baseUrl, searchData).toPromise();
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

  async updateAdjust(searchData: {}): Promise<ApiResult<InvAdjustVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateAdjust`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvAdjustVO[]>>(baseUrl, searchData).toPromise();
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

  async deleteAdjust(searchData: {}): Promise<ApiResult<InvAdjustVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteAdjust`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvAdjustVO[]>>(baseUrl, searchData).toPromise();
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

  async procAdjust(searchData: {}): Promise<ApiResult<number[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/procAdjust`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<number[]>>(baseUrl, searchData).toPromise();
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

  async getTag(searchData: {}): Promise<ApiResult<AdjustSerial[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findAdjustSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<AdjustSerial[]>>(baseUrl, searchData).toPromise();
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

  async deleteTag(searchData: {}): Promise<ApiResult<any[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteAdjustSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any[]>>(baseUrl, searchData).toPromise();
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

  // async saveTag(searchData: {}): Promise<ApiResult<any[]>> {
  //   // Api 설정
  //   const baseUrl = `${this.httpUrl}/saveAdjustSerial`;
  //
  //   try {
  //     // Post 방식으로 조회
  //     const result = await this.http.post<ApiResult<any[]>>(baseUrl, searchData).toPromise();
  //     return result;
  //   } catch {
  //     return {
  //       success: false,
  //       data: null,
  //       code: '-999',
  //       msg: 'Post service api error!'
  //     };
  //   }
  // }

  async saveBeginInv(searchData: {}): Promise<ApiResult<object[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveBeginInv`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<object[]>>(baseUrl, searchData).toPromise();
      return result;
    } catch (e) {
      console.log(e);
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

  async deleteBeginInv(searchData: {}): Promise<ApiResult<any[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteBeginInv`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any[]>>(baseUrl, searchData).toPromise();
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

export interface InvAdjustVO {
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
  inOutDate: Date;
  otherRefNo1: string;
  otherRefNo2: string;
  otherRefNo3: string;

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;
  fromAdjustDate: string;
  toAdjustDate: string;
  isIf: string;

  adjustDetailList: InvAdjustDetailVO[];
}

export interface InvAdjustDetailVO {
  uid: number;
  tenant: string;

  adjustId: number;
  ownerAdjustLineNo: number;
  itemAdminId: number;
  itemId: number;
  ifItem: string;
  lotId: number;
  locId: number;
  tagId: number;

  // QtyAttribute
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

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

  serialList: AdjustSerial[];
}

export interface AdjustSerial {
  tenant: string;
  uid: number;
  adjustId: number;
  adjustDetailId: number;
  itemAdminId: number;
  itemId: number;
  serial: string;
}
