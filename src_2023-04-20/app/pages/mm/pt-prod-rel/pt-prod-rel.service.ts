import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtProdRelService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodrel`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdRelVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdRel`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRelVO[]>>(baseUrl, searchData).toPromise();
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
  async getFull(searchData: {}): Promise<ApiResult<PtProdRelVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdRelFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRelVO[]>>(baseUrl, searchData).toPromise();
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

  // 생산차수 조회
  async getMaxProdSeq(searchData: {}): Promise<ApiResult<number>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findMaxProdSeqPtProdRel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<number>>(baseUrl, searchData).toPromise();
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

  async saveCut(data: {}): Promise<ApiResult<PtProdRelVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/savePtProdRelCut`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRelVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<PtProdRelVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/savePtProdRel`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRelVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<PtProdRelVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updatePtProdRel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRelVO>>(baseUrl, data).toPromise();
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


  async delete(data: PtProdRelVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deletePtProdRel`;

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
}


export interface PtProdRelVO {
  childItemId: number;
  lotNo: number;
  tenant: string;

  uid: number;
  prodKey: string;
  workDate: Date;

  warehouseId: number;
  ownerId: number;
  companyId: number;
  logisticsId: number;
  itemAdminId: number;
  prodDate: Date;
  routId: number;

  itemId: number;
  item: string;
  itemName: string;
  spec: string;
  unit: string;
  height3: number;

  ordQty: number;
  prodQty: number;
  nonQty: number;
  ordClose: string;

  fromWorkDate: string;
  toWorkDate: string;

  width3: number;
  length: number;
  remainLength: number;
  inpQty: number;
  lossRate: number;
  actFlg: string;
  remarks: string;

  ptProdRelDetailList: PtProdRelDetailVO[];
  ptProdRelCutForm2: PtProdRelCutForm2;
  stockList: any[];

  qty1: number;
  prodGb: string;
  reQty: number;

  display: string;
  recommendInpQty: number;
}

export interface PtProdRelCutForm2 {
  tenant: string;

  uid: number;

  itemAdminId: number;
  childItemId: number;
  prodDate: Date;
  routId: number;
  lotId: number;

  itemId: number;
  item: string;
  itemName: string;
  spec: string;
  unit: string;

  ordQty: number;
  nonQty: number;
  ordClose: string;

  fromWorkDate: Date;
  toWorkDate: Date;

  width3: number;
  length: number;
  remainLength: number;
  inpQty: number;
  lossRate: number;
  actFlg: string;
  remarks: string;
}


export interface PtProdRelDetailVO {
  tenant: string;

  uid: number;
  prodKey: string;
  workDate: Date;

  itemAdminId: number;
  prodDate: Date;
  workSeq: number;
  routId: number;

  itemId: number;
  item: string;
  itemName: string;
  spec: string;
  unit: string;

  ordQty: number;
  prodQty: number;
  prodSeq: string;
  lotNo: number;

  nonQty: number;
  ordClose: string;

  reQty: number;
  inpQty: number;
  prodGb: string;
  width3: number;
  length: number;
  remainLength: number;
  childItemId: number;

  actFlg: string;
  remarks: string;
  qty1: number;

  display: string;
}


export interface LookupProdKeyVO {
  tenant: string;
  uid: number;
  prodKey: string;
  workDate: Date;
  itemAdminId: number;
  itemId: number;
  routId: number;
  rout: string;

  workCt: string;
  routGb: string;
  ordQty: number;
  ordClose: string;
}


export interface LookupLotVO {
  tenant: string;
  uid: number;
  companyId: number;
  itemId: number;
  lotId: number;

  lot1: string;
  width3: number;
  damageFlg: string;
  qty1Allocated: number;
  whInDate: Date;
}
