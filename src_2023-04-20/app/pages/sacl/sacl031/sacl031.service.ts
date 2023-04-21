import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacl031Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacl030`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 메인 조회
  async mainList(searchData: {}): Promise<ApiResult<Sacl031VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl031VO[]>>(baseUrl, searchData).toPromise();
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

  // 상세 목록
  async detailList(data: {}): Promise<ApiResult<Sacl031VO[]>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl031VO[]>>(baseUrl, data).toPromise();
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

  // 저장함수
  async mainSave(data: {}): Promise<ApiResult<Sacl031VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl031VO>>(baseUrl, data).toPromise();
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

  // 매입전표 부대비용 저장
  async purAddSave(data: {}): Promise<ApiResult<Sacl031VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/purAddSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl031VO>>(baseUrl, data).toPromise();
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

  // 저장함수
  async clsPur(data: {}): Promise<ApiResult<Sacl031VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/clsPur`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl031VO>>(baseUrl, data).toPromise();
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

  // 저장함수
  async clsInvoceSave(data: {}): Promise<ApiResult<Sacl031VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/clsInvoceSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl031VO>>(baseUrl, data).toPromise();
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

export interface Sacl031VO {
  tenant: string;

  uid: string;

  clsMon: string;

  createdby: string;
  modifiedby: string;

  gridList: gridVo[];
}

export interface gridVo {
  tenant: string;

  uid: string;

  cls_mon: string;
  expt_cd: string;
  coll_expt_cd: string;
  ord_gb: string;
  claim_no: string;
  bond_cls_yn: string;

  sale_amt: number;
  sale_vat_amt: number;
  tot_sale_amt: number;
}
