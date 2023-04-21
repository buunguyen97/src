import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RcvproducestatusService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvProduceStatus`;

  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<RcvProduceStatusVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRcvProduceStatus`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvProduceStatusVO[]>>(baseUrl, searchData).toPromise();
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

  async getDetail(searchData: {}): Promise<ApiResult<RelocateDetailVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRelocateDetail`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RelocateDetailVO[]>>(baseUrl, searchData).toPromise();
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


  async getSerial(searchData: {}): Promise<ApiResult<RelocateSerial[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRelocateSerial`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RelocateSerial[]>>(baseUrl, searchData).toPromise();
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

export interface RcvProduceStatusVO {
  tenant: string;
  uid: number;
  relocateBatchKey: string;
  relocateType: string;
  relocateGroup: string;
  actFlg: string;
  relocateLineTotal: number;
  logisticsId: number;
  warehouseId: number;
  pickBatchId: number;
  remarks: string;
  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  itemAdminId: number;
  itemId: number;

  fromRelocateDate: string;
  toRelocateDate: string;
}

export interface RelocateDetailVO {

  tenant: string;
  uid: number;
  relocateBatchId: number;
  actFlg: string;
  sts: string;
  ownerId: number;
  itemAdminId: number;
  itemId: number;
  ifItem: string;
  lotId: number;
  logisticsId: number;
  fromLocId: number;
  fromTagId: number;
  slotFlg: string;
  toLocId: number;
  toTagId: number;
  locId: number;
  tagId: number;
  oddsFlg: string;
  instructQty1: number;
  instructQty2: number;
  instructQty3: number;

  relocateQty1: number;
  relocateQty2: number;
  relocateQty3: number;

  prospectFlg: string;
  slotType: string;
  slottedUserId: number;
  pickId: number;
  rcvTagDetailId: number;
  remarks: string;
  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;
}

export interface RelocateSerial {
  tenant: string;
  uid: number;
  relocateBatchId: number;
  relocateDetailId: number;
  itemAdminId: number;
  itemId: number;
  serial: string;
  latitude: string;
  longitude: string;
  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;
}
