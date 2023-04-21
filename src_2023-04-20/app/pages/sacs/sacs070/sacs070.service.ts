import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacs070Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs070`
  constructor(private http: JHttpService) { }

  // 조회
  async list(searchData: {}): Promise<ApiResult<Sacs070VO[]>> {
    const baseUrl = `${this.httpUrl}/list`;
    try {
      const result = await this.http.post<ApiResult<Sacs070VO[]>>(baseUrl, searchData).toPromise();
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

  // 중복체크
  async dup_check(searchData: {}): Promise<ApiResult<Sacs070VO[]>> {
    const baseUrl = `${this.httpUrl}/dup_check`;
    try {
      const result = await this.http.post<ApiResult<Sacs070VO[]>>(baseUrl, searchData).toPromise();
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

  // 상세조회
  async subList(data: {}): Promise<ApiResult<Sacs070VO[]>>{
    const baseUrl = `${this.httpUrl}/subList`;
    try{
      const result = await this.http.post<ApiResult<Sacs070VO[]>>(baseUrl, data).toPromise();
      return result;
    }catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

  // 등록
  async insert(data: {}): Promise<ApiResult<Sacs070VO[]>> {
    const baseUrl = `${this.httpUrl}/insert`;
    try {
      const result = await this.http.post<ApiResult<Sacs070VO[]>>(baseUrl, data).toPromise();
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

  // 업데이트
  async update(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/update`;
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

  // 삭제
  async delete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/delete`;
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
  
  deptSearch(vPtrnCd: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${this.httpUrl}/deptSearch`;
    const data = Object.assign(
      {ptrn_cd: vPtrnCd},
    );

    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }
  getUser(vPtrnCd: string,
          vDept: string): Observable<ApiResult<any[]>> {
    const baseUrl = `${this.httpUrl}/getUser`;
    const data = Object.assign(
      {ptrn_cd: vPtrnCd,
       dept : vDept},
    );

    return this.http.post<ApiResult<any[]>>(baseUrl, data);
  }

}

export interface Sacs070VO{
  tenant: string;

  uid   : number;

  dept_yn: string;
  dept_id: string;
  user_nm: string;
  authority: string;
  sa_wh_cd: string;
  ptrn_cd: string;
  pwh_cd: string;
  
  gridList: gridVo[];
}

export interface gridVo{
  tenant: string;
  
  uid   : string;

  dept_yn: string;
  dept_id: string;
  user_nm: string;
  authority: string;
  sa_wh_cd: string;
  ptrn_cd: string;
  pwh_cd: string;

}

