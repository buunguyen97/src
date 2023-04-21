import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class MoveLocationService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/moveLocation`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<MoveLocationVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMoveLocation`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MoveLocationVO[]>>(baseUrl, searchData).toPromise();
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

  // 로케이션 변경
  async modifyMoveLocation(searchData: any): Promise<ApiResult<MoveLocationVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/modifyMoveLocation`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MoveLocationVO[]>>(baseUrl, searchData).toPromise();
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

export interface MoveLocationVO {
  tenant: string;

  logicalKey: string;

  locGroup: string;
  location: string;
  locationId: number;
  locId: number;
  itemId: number;
  item: string;

  warehouseId: number;
  warehouse: string;
  totalItemCnt: number;
  totalInstructedQty1: number;
  totalAllocatedQty1: number;
  totalQty1: number;
  totalAbleQty1: number;
  ownerId: number;
  owner: string;
  itemAdmin: string;
  itemAdminId: number;
  whInDate: Date;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;
}
