import { Injectable } from '@angular/core';
import {ApiResult} from '../../../shared/vo/api-result';
import {ItemVO} from '../item/item.service';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Injectable({
  providedIn: 'root'
})
export class ReleaserequestService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/user-service/poc/simulate`;

  constructor(private http: JHttpService) { }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ReleaseRequestVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSoRequest`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ReleaseRequestVO>>(baseUrl, searchData).toPromise();
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

export interface ReleaseRequestVO {
  uid: number;

  supplierVO: SupplierVO;
  shipToInfoVO: ShipToInfoVO;
  detailVO: DetailVO[];
  serialVO: SerialVO[];
}

export interface SupplierVO {
  soKey: string;
  phone1: string;
  bsNo: string;
  refName: string;
  name: string;
  address: string;
}

export interface ShipToInfoVO {
  warehouse: string;
  shipSchDate: Date;
  address: string;
  shipToName: string;
  delivSchDate: Date;
  delivAddress: string;
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
