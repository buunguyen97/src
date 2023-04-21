import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RcvacceptcancelService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvAcceptCancel`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RcvAcceptVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findCancelRcvAccept`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvAcceptVO[]>>(baseUrl, searchData).toPromise();
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

  async getRcv(searchData: {}): Promise<ApiResult<RcvVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRcvByVOFromRcvAccept`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvVO[]>>(baseUrl, searchData).toPromise();
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

  // 입고접수 취소
  async cancelRcvAccept(data: RcvAcceptVO[]): Promise<ApiResult<RcvAcceptVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/cancelRcvAccept`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvAcceptVO[]>>(baseUrl, data).toPromise();
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

export interface RcvAcceptVO {
  uid: number;
  tenant: string;
  acceptKey: string;
  acceptTypecd: string;
  acceptGroupcd: string;
  actFlg: string;
  warehouseId: number;
  logisticsId: number;
  locId: number;
  inspectedUserId: number;
  carrierId: number;
  carrier: string;
  carrierName: string;
  carrierNo: string;
  carrierWbNo: string;
  carrierRefName: string;
  actualTime: Date;
  completeTime: Date;
  acceptlinetotal: number;
  tagLabelPrintFlg: string;
  rcvId: number;
  acceptUserId: number;
  ownerId: number;
  sts: string;

  fromRcvSchDate: string;  // from입고예정일
  toRcvSchDate: string;  // to입고예정일

}

export interface RcvVO {
  tenant: string;

  uid: number;
  rcvKey: string;  // 입고번호
  sts: number;  // 상태
  rcvAcceptId: string;  // 입고접수번호
  rcvTypecd: string;  // 입고타입
  rcvSchDate: Date;  // 입고예정일
  receiveDate: Date;  // 입고실적일
  supplierId: number;  // 거래처코드
  supplierName: string; // 거래처
  rcvSumItemCount: number;  // 총품목수
  rcvSumQty1: number;  // 총품목수량
  rcvSumBoxCount: number;  // 총BOX수
  rcvSumEaCount: number;  // 총EA수
  actFlg: string;  // 사용여부
  remarks: string;  // 전표비고

  refName: string;  // 담당자
  warehouseId: number;  // 센터코드
  supplierPhone: string;  // 연락처
  supplierCountrycd: string;  // 국가
  supplierPortcd: string; // 항구
  supplierZip: string;  // 우편번호
  supplierAddress1: string; // 주소1
  supplierAddress2: string; // 주소2
  companyId: number;  // companyId
  logisticsId: number;

  fromRcvSchDate: Date;  // from입고예정일
  toRcvSchDate: Date;  // to입고예정일
  fromReceiveDate: Date;  // from입고실적일
  toReceiveDate: Date;  // to입고실적일

  acceptUserId: number;
  receivedUserId: number;
}
