import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PhyinstructService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/phyInstruct`;

  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PhyInstructVO[]>> {
    const baseUrl = `${this.httpUrl}/findPhyInstruct`;
    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<PhyInstructVO[]>>(baseUrl, searchData).toPromise();
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async executePhyInstruct(searchData: {}): Promise<ApiResult<PhyInstructVO>> {
    const baseUrl = `${this.httpUrl}/executePhyInstruct`;
    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<PhyInstructVO>>(baseUrl, searchData).toPromise();
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

export interface PhyInstructVO {
  tenant: string;
  uid: number;
  logicalKey: number;
  phyInstructKey: string;       // 재고조사키
  ownerPhyInstructKey: string;  // 화주재고조사키
  actFlg: string;               // 사용여부
  sts: string;                  // 상태
  phyInstructDate: Date;        // 재고조사 지시일
  warehouseId: number;          // 창고ID
  logisticsId: number;          // 창고회사ID
  ownerId: number;              // 화주ID
  itemAdminId: number;          // 품목관리사ID
  itemId: number;               // 품목ID
  itemList: number[];           // 선택 품목 리스트
  visibleInstQty: string;       // 지시수량표기여부
  inventoryQty1: number;        // 조사수량
  locList: number[];            // 선택 로케이션 리스트

  fromLocation: string;  // 로케이션 범위
  toLocation: string;

  remarks: string;
  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

  fromActualdate: string;
  toActualdate: string;
}


export interface PhyInstructDetailVO {
  tenant: string;
  uid: number;
  actFlg: string;               // 사용여부
  sts: string;                  // 상태
  phyInstructDate: Date;        // 재고조사 지시일
  warehouseId: number;          // 창고ID
  logisticsId: number;          // 창고회사ID
  ownerId: number;              // 화주ID
  itemAdminId: number;          // 품목관리사ID
  itemId: number;               // 품목ID
  visibleInstQty: string;       // 지시수량표기여부
  instructQty1: number;         // 지시수량
  visibleqty1: number;          // 조사수량
  qty1: number;                 // 조사수량
}

export interface PhyInstructSaveVO {
  phyInstructVO: PhyInstructVO;
  phyInstructVOList: PhyInstructDetailVO[];
}
