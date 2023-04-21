import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class LogicalWhMoveOutConfService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/logicalWhMoveOutConf`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<LogicalWhMoveOutConfVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMoveOutConf`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveOutConfVO[]>>(baseUrl, searchData).toPromise();
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
  async getFull(searchData: {}): Promise<ApiResult<LogicalWhMoveOutConfVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMoveOutConfFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveOutConfVO>>(baseUrl, searchData).toPromise();
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
    const baseUrl = `${this.httpUrl}/saveLogicalWhMoveOutConf`;

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

  async execute(data: {}): Promise<ApiResult<LogicalWhMoveOutConfVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/executeLogicalWhMoveOut`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveOutConfVO[]>>(baseUrl, data).toPromise();
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


export interface LogicalWhMoveOutConfVO {
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
  shipSchDate: Date;
  rcvSchDate: Date;

  fromLogicalWhId: string;
  fromWarehouseId: string;
  toLogicalWhId: string;
  toWarehouseId: string;

  fromCompanyId: string;
  toCompanyId: string;
  remarks: string;

  countrycd: string;
  address1: string;
  phone1: string;
  address2: string;

  toCountrycd: string;
  toAddress1: string;
  toPhone1: string;
  toAddress2: string;

  logicalWhMoveOutConfDetailList: LogicalWhMoveOutConfDetailVO[];

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  address: string;
  owner: string;

}

export interface LogicalWhMoveOutConfDetailVO {
  tenant: string;

  uid: number;
  moveKey: string;
  itemId: string;
  item: string;
  itemAdminId: number;

  moveQty: number;
  operType: string;
  damageFlg: string;
}
