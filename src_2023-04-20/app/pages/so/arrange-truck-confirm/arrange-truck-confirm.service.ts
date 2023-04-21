import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class ArrangeTruckConfirmService {
// 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/arrangetruckconfirm`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ArrangeTruckConfirmVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findArrangeTruckConfirm`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ArrangeTruckConfirmVO[]>>(baseUrl, searchData).toPromise();
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

  // 차량리스트 조회
  async getArrangeTruckConrfirmDetail(data: {}): Promise<ApiResult<ArrangeTruckConfirmDetailVO[]>> {
    const baseUrl = `${this.httpUrl}/findArrangeTruckConfirmFull`;

    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<ArrangeTruckConfirmDetailVO[]>>(baseUrl, data).toPromise();
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async save(data: {}): Promise<ApiResult<ArrangeTruckConfirmDetailVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveArrangeConfirmTruck`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ArrangeTruckConfirmDetailVO[]>>(baseUrl, data).toPromise();
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

export interface ArrangeTruckConfirmVO {
  tenant: string;
  uid: number;
  soId: number;
  pickBatchKey: number;
  soKey: string;

  warehouseId: number;
  ownerId: number;
  fromShipSchDate: Date;
  toShipSchDate: Date;
  sts: string;
  soType: string;
  soTypecd: string;
  companyId: number;
  itemId: number;
  item: string;
  itemAdmin: string;
  itemAdminId: number;
  phoneNo: string;
  receipientPhone: string;
  vehicleId: number;

  soNum: number;
  shipSchDate: Date;
  company: string;
  companyName: string;
  address: string;
  shipToId: number;
  shipTo: number;
  shipToName: number;
  shipToAddress: string;
  totalQty: number;
  totalQty1: number;
  totalCbm: number;
  remarks: string;

}

export interface ArrangeTruckConfirmDetailVO {
  tenant: string;
  soId: number;
  uid: number;
  vehicleId: number;

  country: string;
  carId: string;
  carCapa: number;
  ownerName: string;
  cbm: number;
  cbmAble: number;
  price: number;
}
//
// export interface ArrangeTruckConfirmLookupVO {
//   tenant: string;
//
//   vehicleKey: string;
//   vehicleId: number;
//   vehicleType: string;
//   country: string;
//   carId: number;
//   carCapa: number;
//   ownerName: string;
//   cbm: number;
//   cbmAble: number;
//
//   display: string;
// }
