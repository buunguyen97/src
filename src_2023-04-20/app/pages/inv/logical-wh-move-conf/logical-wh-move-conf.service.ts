import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {LogicalWhMoveVO} from '../logical-wh-move/logical-wh-move.service';

@Injectable({
  providedIn: 'root'
})
export class LogicalWhMoveConfService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/logicalWhMoveConf`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<LogicalWhMoveVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMoveConf`;

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
  async getFull(searchData: {}): Promise<ApiResult<LogicalWhMoveConfVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findLogicalWhMoveConfFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveConfVO>>(baseUrl, searchData).toPromise();
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

  async execute(data: {}): Promise<ApiResult<LogicalWhMoveConfVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/executeLogicalWhMove`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LogicalWhMoveConfVO>>(baseUrl, data).toPromise();
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


export interface LogicalWhMoveConfVO {
  tenant: string;
  uid: number;
  moveKey: string;
  moveType: string;
  sts: string;

  companyId: number;
  ownerId: number;

  itemAdminId: number;
  itemId: string;
  moveQty: number;

  moveDate: string;
  fromCompanyId: string;
  fromLogicalWhId: string;
  fromWarehouseId: string;
  toCompanyId: string;
  toLogicalWhId: string;
  toWarehouseId: string;
  remarks: string;

  logicalWhMoveConfDetailList: LogicalWhMoveConfDetailVO[];

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  fromShipSchDate: string;
  toShipSchDate: string;
  fromRcvSchDate: string;
  toRcvSchDate: string;
  owner: string;

}

export interface LogicalWhMoveConfDetailVO {
  tenant: string;

  uid: number;
  moveKey: string;
  itemId: string;
  item: string;
  itemAdminId: number;

  moveQty: number;
  damageFlg: string;
}
