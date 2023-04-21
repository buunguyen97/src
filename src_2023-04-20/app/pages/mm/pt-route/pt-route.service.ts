import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtRouteService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptroute`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtRouteVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtRoute`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtRouteVO[]>>(baseUrl, searchData).toPromise();
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
  async getFull(searchData: {}): Promise<ApiResult<PtRouteVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtRouteFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtRouteVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<PtRouteVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/savePtRoute`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtRouteVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<PtRouteVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updatePtRoute`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtRouteVO>>(baseUrl, data).toPromise();
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


  async delete(data: PtRouteVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deletePtRoute`;

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


export interface PtRouteVO {
  tenant: string;

  uid: number;
  itemAdminId: number;

  rout: string;
  routNm: string;
  workCt: string;
  empQty: number;
  deptId: string;
  machQty: number;
  routGb: string;
  waitTm: number;
  workTm: number;
  redyTm: number;
  cutYn: string;
  actFlg: string;

  phyFileNm: string;
  logFileNm: string;
}


export interface LookupRoutVO {
  tenant: string;
  uid: number;
  item: string;
  rout: string;
  routNm: string;
  workCt: string;
  empQty: number;
  deptId: string;
  machQty: number;
  routGb: string;
  cutYn: string;
}


export interface LookupRouteByItemVO {
  tenant: string;
  uid: number;
  itemId: number;
  rout: string;
  routNm: string;
  cutYn: string;
}
