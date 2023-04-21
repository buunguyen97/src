import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RcvacceptService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvAccept`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RcvVO[]>> {
    const baseUrl = `${this.httpUrl}/findRcvAccept`;
    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<RcvVO[]>>(baseUrl, searchData).toPromise();
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  // 조회함수(디테일포함)
  async getRcvFull(searchData: {}): Promise<ApiResult<RcvVO>> {
    const baseUrl = `${this.httpUrl}/findRcvFull`;

    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<RcvVO>>(baseUrl, searchData).toPromise();
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async procRcvAccept(data: RcvAcceptSaveVO): Promise<ApiResult<RcvAcceptSaveVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/procRcvAccept`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvAcceptSaveVO>>(baseUrl, data).toPromise();
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

  fromRcvSchDate: string;  // from입고예정일
  toRcvSchDate: string;  // to입고예정일
  fromReceiveDate: Date;  // from입고실적일
  toReceiveDate: Date;  // to입고실적일

  rcvDetailList: RcvDetailVO[];

  acceptUserId: number;
  acceptTypecd: string;
  acceptGroupcd: string;
  receivedUserId: number;
  ownerId: number;
}

export interface RcvDetailVO {
  tenant: string;

  uid: number;
  rcvId: number;
  supplierRcvLineNo: number;
  xDockFlg: number;
  poId: number;
  poDetailId: number;
  poTypecd: string;
  ownerPoNo: string;
  ownerPoLineNo: number;
  originalPoNo: string;
  originalPoLineNo: number;
  poDate: Date;

  ownerId: number;
  itemAdminId: number;
  itemId: number;
  ifItem: string;

  lot1: string;
  lot2: string;
  lot3: string;
  lot4: string;
  lot5: string;
  lot6: string;
  lot7: string;
  lot8: string;
  lot9: string;
  lot10: string;
  damageFlg: boolean;
  noShippingFlg: boolean;
  foreignCargoFlg: boolean;
  customsReleaseFlg: boolean;
  taxFlg: boolean;
  whInDate: Date;
  mngDate: Date;

  expectQty1: number;
  expectQty2: number;
  expectQty3: number;

  receivedQty1: number;
  receivedQty2: number;
  receivedQty3: number;

  adjustQty1: number;
  adjustQty2: number;
  adjustQty3: number;

  rcvTagQty1: number;

  xDockFreeQty1: number;

  inspectedQty1: number;
  inspectedQty2: number;
  inspectedQty3: number;

  priceBuy: number;
  priceWholeSale: number;
  priceSale: number;

  icDate: Date;

  orderNo: string;

  orderLineNo: number;

  ownerOrderNo: string;

  ownerOrderLineNo: number;

  custOrderNo: string;

  custOrderLineNo: number;

  orderTypecd: string;

  rcvQtyErrorFlg: number;

  logicFlg1: number;
  logicFlg2: number;
  logicFlg3: number;

  checkLastLotFlg: number;

  moveDetailId: number;
  assyDetailId: number;
  produceDetailId: number;

  tagQty: number;
}


export interface RcvSerial {
  uid: number;
  tenant: string;

  rcvId: number;
  rcvDetailId: number;
  serial: string;
}

/*접수실행을 위한 VO*/
export interface RcvAcceptSaveVO {
  tenant: string;
  warehouseId: number;
  logisticsId: number;

  rcvList: RcvVO[];
}
