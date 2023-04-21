import {Injectable} from '@angular/core';
import {ApiResult} from '../../../shared/vo/api-result';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Injectable({
  providedIn: 'root'
})
export class RiInstructResultService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/riInstructResult`;


  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RiInstructResultVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRiInstructResult`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RiInstructResultVO[]>>(baseUrl, searchData).toPromise();
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

  // 실적
  async riInstructPerform(data: any[]): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveRiInstructResult`;

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


export interface RiInstructResultVO {
  tenant: string;
  uid: number;
  relocateId: number;

  logicalKey: string;

  locGroup: string;
  location: string;
  locationId: number;
  locId: number;
  itemId: number;
  item: string;
  relocateSts: string;

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
  relocateQty1: number;
  remarks: string;

  whInDate: Date;

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

