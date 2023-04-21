import { Injectable } from '@angular/core';
import {APPCONSTANTS} from "../../../shared/constants/appconstants";
import {JHttpService} from "../../../shared/services/jhttp.service";
import {ApiResult} from "../../../shared/vo/api-result";

@Injectable({
  providedIn: 'root'
})
export class ReceiverequestService {

// 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/user-service/poc/simulate`;

  constructor(private http: JHttpService) { }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ReceiveRequestVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRcvRequest`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ReceiveRequestVO>>(baseUrl, searchData).toPromise();
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

export interface ReceiveRequestVO {
  uid: number;

  supplierVO: SupplierVO;
  supplierInfoVO: SupplierInfoVO;
  detailVO: DetailVO[];
  serialVO: SerialVO[];
}

export interface SupplierVO {
  rcvKey: string;
  phone1: string;
  bsNo: string;
  refName: string;
  name: string;
  address: string;
}

export interface SupplierInfoVO {
  warehouse: string;
  rcvSchDate: Date;
  address: string;
  supplierName: string;
  returnSchDate: Date;
  returnAddress: string;
  refName: string;
  phone: string;
  remarks: string;
}

export interface DetailVO {
  uid: number;
  item: string;
  spec: string;
  qty: number;
}

export interface SerialVO {
  uid: number;
  detailUid: number;
  item: string;
  spec: string;
  serial: number;
}
