import {Injectable} from '@angular/core';
import {ApiResult} from '../../../shared/vo/api-result';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';

@Injectable({
  providedIn: 'root'
})
export class SopickcancelService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/pickCancel`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<PickVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findPickCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PickVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: any[]): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/savePickCancel`;

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

export interface PickVO {
  tenant: string;

  uid: number;
  pickBatchKey: string;
  pickBatchGroup: string;
  pickBatchType: string;
  actFlg: string;
  pickDate: Date;
  ownerId: number;
  shipDate: Date;
  delivSchDate: Date;
  allocGroup: string;
  soId: number;
  pickLineTotal: number;
  pickingWay: number;

  pickDetailList: PickDetailVO[];
}

export interface PickDetailVO {
  tenant: string;

  uid: number;
  pickBatchUid: number;
  pickBatchKey: string;
  pickBatchGroup: string;
  pickBatchType: string;
  actFlg: string;
  pickDate: Date;
  ownerId: number;
  shipDate: Date;
  delivSchDate: Date;
  allocGroup: string;
  soId: number;
  pickLineTotal: number;
  pickingWay: number;

  pickedQty1: number;
}

