import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class LogicalWhMoveOutService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/logicalWhMoveOut`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<LogicalWhMoveOutVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMoveOut`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveOutVO[]>>(baseUrl, searchData).toPromise();
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
  async getFull(searchData: {}): Promise<ApiResult<LogicalWhMoveOutVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMoveOutFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveOutVO>>(baseUrl, searchData).toPromise();
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
    const baseUrl = `${this.httpUrl}/saveLogicalWhMoveOut`;

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

  async delete(data: LogicalWhMoveOutVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deleteLogicalWhMoveOut`;

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
    const baseUrl = `${this.httpUrl}/procMoveOut`;

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


export interface LogicalWhMoveOutVO {
  tenant: string;
  uid: number;
  moveKey: string;
  moveType: string;
  sts: string;

  companyId: number;
  ownerId: number;

  itemAdminId: number;
  itemId: string;

  moveDate: string;
  fromLogicalWhId: number;
  fromWarehouseId: number;
  toLogicalWhId: number;
  toWarehouseId: number;

  fromCompanyId: string;
  // toCompanyId: number;
  remarks: string;

  countrycd: string;
  address1: string;
  phone1: string;
  address2: string;

  logicalWhMoveOutDetailList: LogicalWhMoveOutDetailVO[];

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  address: string;
  owner: string;

  // shipSchDate: string;
  // rcvSchDate: string;
  //
  // fromShipSchDate: string;
  // toShipSchDate: string;
  // fromRcvSchDate: string;
  // toRcvSchDate: string;

}

export interface LogicalWhMoveOutDetailVO {
  tenant: string;

  uid: number;
  moveKey: string;
  itemId: string;
  item: string;
  itemAdminId: number;

  moveQty: number;
  damageFlg: string;
}
