import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/warehouse`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<WarehouseVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findWarehouse`;

    try {
      // Post 방식으로 조회
      // Warehouse는 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<WarehouseVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<WarehouseVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findWarehouseFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<WarehouseVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<WarehouseVO>> {
    const baseUrl = `${this.httpUrl}/saveWarehouse`;
    try {
      const result = await this.http.post<ApiResult<WarehouseVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<WarehouseVO>> {
    const baseUrl = `${this.httpUrl}/updateWarehouse`;
    try {
      const result = await this.http.post<ApiResult<WarehouseVO>>(baseUrl, data).toPromise();
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
    const baseUrl = `${this.httpUrl}/deleteWarehouse`;
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
export interface WarehouseVO {
  uid: number;
  warehouse: string;
  logisticsId: string;
  warehouseGroup: string;
  actFlg: string;

  virtualWhFlg: string;
  name: string;
  shortName: string;
  countrycd: string;
  zip: string;
  address1: string;

  address2: string;

  engAddress1: string;
  engAddress2: string;
  phone1: string;
  phone2: string;
  fax1: string;
  fax2: string;

  refName: string;
  refPhone: string;
  email: string;
  emailAccGroup: string;
  weightCapacity: number;

  capacity: number;

  tenant: string;

  remarks: string;
  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;
  rowVersion: number;

  gps_lat: string;
  gps_long: string;
}

export interface LookupWarehouseVO {
  tenant: string;
  uid: number;
  warehouse: string;
  latitude: string;
  longitude: string;
  logisticsId: number;
  name: string;
  display: string;
}
