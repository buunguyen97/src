import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtProdRqService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodrq`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdRqVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdRq`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRqVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수(디테일포함)
  async getFull(searchData: {}): Promise<ApiResult<PtProdRqVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdRqFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRqVO[]>>(baseUrl, searchData).toPromise();
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

  async locMoveCheck(data: {}): Promise<ApiResult<PtProdRqVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/locMoveCheck`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRqVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<PtProdRqVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/savePtProdRq`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRqVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<PtProdRqVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updatePtProdRq`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRqVO>>(baseUrl, data).toPromise();
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


  async delete(data: PtProdRqVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deletePtProdRq`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

  async getItemIdInfo(searchData: {}): Promise<ApiResult<LookupProdKeyVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/getItemIdInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LookupProdKeyVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수
  async getItemInfo(searchData: {}): Promise<ApiResult<any>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/getItemInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, searchData).toPromise();
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


export interface PtProdRqVO {
  tenant: string;

  uid: number;
  itemId: number;
  item: string;
  oldItemId: number;
  warehouseId: number;
  logisticsId: number;
  ownerId: number;
  companyId: number;
  itemAdminId: number;
  itemName: string;
  groupItemId: number;
  spec: string;
  unit: string;

  groupOrdQty: number;

  childItemId: number;
  childItem: string;

  revision: number;

  prodKey: string;
  workDate: Date;
  ordQty: number;
  ordQty2: number;

  routYn: string;
  ordClose: string;
  reQty: number;
  cutYn: string;

  fromWorkDate: string;
  toWorkDate: string;
  routId: number;
  routNm: string;
  workCt: string;
  workSeq: number;
  actFlg: string;
  remarks: string;

  ptProdRqDetailList: PtProdRqDetailVO[];
  ptProdRqInvDetailList: PtProdRqInvDetailVO[];
  moveList: RelocateDetailVO[];
}


export interface PtProdRqDetailVO {
  tenant: string;

  uid: number;
  itemId: number;
  item: string;
  oldItemId: number;
  itemAdminId: number;
  itemName: string;
  spec: string;
  unit: string;
  groupOrdQty: number;

  childItemId: number;
  childItem: string;

  workSeq: number;
  routId: number;
  routNm: string;
  routGb: string;
  prodKey: string;
  reQty: number;

  ordQty: number;
  routYn: string;
  ordClose: string;
  workCt: string;
  actFlg: string;
  remarks: string;
  sumQty: string;
}


export interface PtProdRqInvDetailVO {
  tenant: string;

  uid: number;
  itemId: number;
  item: string;
  oldItemId: number;
  itemAdminId: number;
  itemName: string;
  spec: string;
  unit: string;
  groupOrdQty: number;

  childItemId: number;
  childItem: string;

  workSeq: number;
  routId: number;
  routNm: string;
  routGb: string;
  prodKey: string;
  reQty: number;

  ordQty: number;
  routYn: string;
  ordClose: string;
  workCt: string;
  actFlg: string;
  remarks: string;
  totalReQty: number;
}

export interface LookupItemInfoVO {
  tenant: string;

  uid: number;
  prodKey: string;
  itemId: number;
  workDate: string;
  itemAdminId: number;
  itemName: string;
  spec: string;
  unit: string;

  workSeq: number;
  routId: number;
  routNm: string;
  routGb: string;

  ordQty: number;
  ordClose: string;
  workCt: string;
  actFlg: string;
  remarks: string;
}


export interface LookupProdKeyVO {
  tenant: string;

  uid: number;
  iprodKeytemId: number;
  workDate: string;
  itemAdminId: number;
  itemName: string;
  spec: string;
  unit: string;

  workSeq: number;
  routId: number;
  routNm: string;
  routGb: string;
  prodKey: string;

  ordQty: number;
  ordClose: string;
  workCt: string;
  actFlg: string;
  remarks: string;
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
