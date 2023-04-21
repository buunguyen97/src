import {Injectable} from '@angular/core';
import {ApiResult} from '../../../shared/vo/api-result';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';

@Injectable({
  providedIn: 'root'
})
export class LogicalWhMoveService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/logicalWhMove`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<LogicalWhMoveVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수(디테일포함)
  async getFull(searchData: {}): Promise<ApiResult<LogicalWhMoveVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMoveFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveVO>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<any>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/saveLogicalWhMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
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

  async delete(data: LogicalWhMoveVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deleteLogicalWhMove`;

    try {
      // Post 방식으로 조회
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

  async proc(data: {}): Promise<ApiResult<any>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/procMove`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
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


export interface LogicalWhMoveVO {
  tenant: string;
  uid: number;
  moveKey: string;
  moveType: string;
  sts: string;

  companyId: number;
  ownerId: number;

  itemAdminId: number;
  itemId: number;

  moveDate: string;
  fromLogicalWhId: string;
  fromWarehouseId: string;
  toLogicalWhId: string;
  toWarehouseId: string;

  // fromCompany: string;
  fromCompanyId: string;
  // toCompany: string;
  toCompanyId: string;
  remarks: string;
  owner: string;

  logicalWhMoveDetailList: LogicalWhMoveDetailVO[];

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  shipSchDate: string;
  rcvSchDate: string;

  fromShipSchDate: string;
  toShipSchDate: string;
  fromRcvSchDate: string;
  toRcvSchDate: string;

}

export interface LogicalWhMoveDetailVO {
  tenant: string;

  uid: number;
  moveKey: string;
  itemId: number;
  item: string;
  itemAdminId: number;

  moveQty: number;
  damageFlg: string;
}


export interface LookupSalesWarehouseVO {
  tenant: string;
  uid: number;
  phyWhId: string;
  salesWhId: string;

  name: string;
  display: string;
}


