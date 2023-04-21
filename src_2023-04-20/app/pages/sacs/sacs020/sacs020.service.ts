import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacs020Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs020`;

  constructor(private http: JHttpService) {
  }

  // 다건 조회(수출사파트너사 등록)
  async mainList(searchData: {}): Promise<ApiResult<Sacs020VO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacs020VO[]>>(baseUrl, searchData).toPromise();
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

  // 단건 조회(수출사파트너사 등록)
  async mainInfo(data: {}): Promise<ApiResult<Sacs020VO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacs020VO>>(baseUrl, data).toPromise();
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

  // 저장(수출사파트너사 등록)
  async mainInsert(data: {}): Promise<ApiResult<Sacs020VO>> {
    const baseUrl = `${this.httpUrl}/mainInsert`;
    try {
      const result = await this.http.post<ApiResult<Sacs020VO>>(baseUrl, data).toPromise();
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

  // 삭제(수출사파트너사 등록)
  async mainDelete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
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

  // 파트너정보조회
  getPtrnInfo(vPtrnCd: string): Observable<ApiResult<Sacs020VO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/getPtrnInfo`;
    const data = Object.assign({ptrnCd: vPtrnCd});
    return this.http.post<ApiResult<Sacs020VO>>(baseUrl, data);
  }

  // 수출사정보조회
  getExptInfo(vExptCd: string): Observable<ApiResult<Sacs020VO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/getExptInfo`;
    const data = Object.assign({exptCd: vExptCd});
    return this.http.post<ApiResult<Sacs020VO>>(baseUrl, data);
  }

  // 그리드용 정보조회
  async gridInfo(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/gridInfo`;

    try {
      // Post 방식으로 조회
      const resultCount = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
      return resultCount;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  //중복 유효성검사
  async mainCount(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/mainCount`;

    try {
      // Post 방식으로 조회
      const resultCount = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
      return resultCount;
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

// BackEnd의 VO와 맞춤
export interface Sacs020VO {
  expt_cd: string;
  expt_nm: string;
  ptrn_cd: string;
  ptrn_nm: string;
  country: string;
  zip_no: string;
  address: string;
  eng_address: string;
  biz_gb: string;
  biz_type: string;
  biz_cond: string;
  chg_nm: string;
  chg_tel_no: string;
  chg_email: string;
  ptrn_country: string;
  createdby: number;
  createddatetime: string;
  createdip: string;
  modifiedby: string;
  modifieddatetime: string;
  modifiedip: string;

  wh_address: string;
  wh_eng_address: string;
  eng_ptrn_nm: string;

  sacs020DetailList: Sacs020DetailVO[];
}

export interface Sacs020DetailVO {

}
