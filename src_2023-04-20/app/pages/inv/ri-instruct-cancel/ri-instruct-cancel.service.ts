import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RiInstructCancelService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/riInstructCancel`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RiInstructCancelVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRiInstructCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RiInstructCancelVO[]>>(baseUrl, searchData).toPromise();
      console.log(result);
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

  // 지시 취소
  async save(data: any[]): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveRiInstructCancel`;

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
}

export interface RiInstructCancelVO {
  tenant: string;
  uid: number;

  logicalKey: string;

  locGroup: string;
  location: string;
  locationId: number;
  locId: number;
  itemId: number;
  item: string;
  relocateSts: string;
  whInDate: Date;

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
  rcvkey: number;
  moveLocationId: number;
  instructQty: number;
  remarks: string;

  relocateGroup: string;
  relocateKey: string;

  relocateBatchKey: string;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;
}
