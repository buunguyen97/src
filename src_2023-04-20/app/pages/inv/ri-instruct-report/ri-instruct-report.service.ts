import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RiInstructReportService {
// 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/riInstructReport`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RiInstructReportVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRiInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RiInstructReportVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<any[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRiInstructFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any[]>>(baseUrl, data).toPromise();
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

export interface RiInstructReportVO {
  tenant: string;
  uid: number;

  relocateKey: string;
  logicalKey: string;

  fromRelocateDate: string;
  toRelocateDate: string;
  relocateGroup: string;
  relocateSts: string;
  remarks: string;

  relocateBatchKey: string;
  relocateDate: Date;
  itemQty: number;
  instructQty: number;

  itemId: number;
  item: string;
  actFlg: string;
  damageFlg: string;

  whInDate: Date;
  fromLocId: number;
  toLocId: number;

  relocateQty: number;

  warehouseId: number;
  warehouse: string;

  ownerId: number;
  owner: string;

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;
}
