import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class ArrangeTruckService {
// 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/arrangetruck`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ArrangeTruckVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findArrangeTruck`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ArrangeTruckVO[]>>(baseUrl, searchData).toPromise();
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
  async getArrangeTruckDetail(data: {}): Promise<ApiResult<ArrangeTruckDetailVO[]>> {
    const baseUrl = `${this.httpUrl}/findArrangeTruckFull`;

    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<ArrangeTruckDetailVO[]>>(baseUrl, data).toPromise();
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async save(data: {}): Promise<ApiResult<ArrangeTruckDetailVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveArrangeTruck`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ArrangeTruckDetailVO[]>>(baseUrl, data).toPromise();
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

  async merge(data: {}): Promise<ApiResult<ArrangeTruckDetailVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/mergeArrangeTruck`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ArrangeTruckDetailVO[]>>(baseUrl, data).toPromise();
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

export interface ArrangeTruckVO {
  tenant: string;
  uid: number;
  soId: number;

  vehicleArrangeKey: string;
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

  soNum: number;
  soKey: string;
  shipSchDate: Date;
  company: string;
  companyName: string;
  address: string;
  shipTo: number;
  shipToName: number;
  shipToAddress: string;
  totalQty: number;
  totalCbm: number;
  remarks: string;

}

export interface ArrangeTruckDetailVO {
  tenant: string;
  soId: number;
  uid: number;

  vehicleId: number;
  vehicleType: string;
  country: string;
  carId: string;
  carCapa: number;
  ownerName: string;
  cbm: number;
  cbmAble: number;
  totalItemCnt: number;
  totalQty1: number;
  price: number;
}

export interface ArrangeTruckLookupVO {
  tenant: string;

  vehicleKey: string;
  vehicleId: number;
  vehicleType: string;
  country: string;
  carId: string;
  carCapa: number;
  ownerName: string;
  cbm: number;
  cbmAble: number;

  display: string;
}
