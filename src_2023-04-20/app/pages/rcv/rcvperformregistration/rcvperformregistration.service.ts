import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RcvperformregistrationService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvPerformRegistration`;


  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RcvTagDetailVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRcvPerformRegistration`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvTagDetailVO[]>>(baseUrl, searchData).toPromise();
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

  // 적치
  async executeConfirmReceive(searchData: {}): Promise<ApiResult<RcvTagDetailVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/executeConfirmReceive`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvTagDetailVO[]>>(baseUrl, searchData).toPromise();
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


export interface RcvTagDetailVO {
  tenant: string;

  uid: number;
  rcvKey: string;  // 입고번호
  sts: number;  // 상태
  stsList: string[];
  rcvAcceptId: string;  // 입고접수번호
  acceptKey: string;    // 입고접수키
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

  fromRcvSchDate: string;   // from입고예정일
  toRcvSchDate: string;     // to입고예정일
  fromReceiveDate: Date;  // from입고실적일
  toReceiveDate: Date;    // to입고실적일

  itemId: number;         // 품목코드
  itemAdminId: number;    // 품목관리사
  expectQty1: number;     // 예정수량
  adjustQty1: number;     // 예정수량
  itemName: string;       // 품목명

  qty1: number;
  toLocId: number;
  ownerId: number;
}

