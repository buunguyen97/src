import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacs060Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs060`;
  constructor(private http: JHttpService) { }

  // 조회
  async list(searchData: {}): Promise<ApiResult<Sacs060VO[]>> {
    const baseUrl = `${this.httpUrl}/list`;
    try {
      const result = await this.http.post<ApiResult<Sacs060VO[]>>(baseUrl, searchData).toPromise();
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

  // 표준중복체크
  async std_dup_check(searchData: {}): Promise<ApiResult<Sacs060VO[]>> {
    const baseUrl = `${this.httpUrl}/std_dup_check`;
    try {
      const result = await this.http.post<ApiResult<Sacs060VO[]>>(baseUrl, searchData).toPromise();
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
  async sales_dup_check(searchData: {}): Promise<ApiResult<Sacs060VO[]>> {
    const baseUrl = `${this.httpUrl}/sales_dup_check`;
    try {
      const result = await this.http.post<ApiResult<Sacs060VO[]>>(baseUrl, searchData).toPromise();
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
  async info(data: {}): Promise<ApiResult<Sacs060VO[]>>{
    const baseUrl = `${this.httpUrl}/info`;
    try{
      const result = await this.http.post<ApiResult<Sacs060VO[]>>(baseUrl, data).toPromise();
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
  async insert(data: {}): Promise<ApiResult<Sacs060VO>> {
    const baseUrl = `${this.httpUrl}/insert`;
    try {
      const result = await this.http.post<ApiResult<Sacs060VO>>(baseUrl, data).toPromise();
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
}

export interface Sacs060VO{
  ptrn_cd: string; // 파트너코드
  sales_wh_cd: string; // 영업창고코드
  sales_wh_nm: string; // 영업창고명
  pwh_cd: string; // 파트너창고코드
  pwh_nm: string; // 파트너창고코드
  dept_id: string; // 부서코드
  std_yn: string; // 기준여부
  sales_wh_gb: string; // 창고구분
  used_yn: string; // 사용여부
  cust_gb: string; // 구분
  createdby: string;
  modifiedby: string;
  createddatetime: string;
  modifieddatetime: string;
}
