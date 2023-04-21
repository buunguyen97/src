import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RcvproduceService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvProduce`;

  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<RcvProduceVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRcvProduce`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvProduceVO[]>>(baseUrl, searchData).toPromise();
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

  async executeRcvProduce(dataList: {}): Promise<ApiResult<RcvProduceVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/executeRcvProduce`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvProduceVO[]>>(baseUrl, dataList).toPromise();
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

export interface RcvProduceVO {
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
  moveQty: number;

  workDate: string;
  prodKey: string;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;
}
