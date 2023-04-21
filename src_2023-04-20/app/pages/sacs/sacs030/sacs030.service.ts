import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

//test
@Injectable({
  providedIn: 'root'
})
export class Sacs030Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs030`

  constructor(private http: JHttpService) {
  }

  //조회함수
  async mainList(searchData: {}): Promise<ApiResult<Sacs030VO[]>> {

    //조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;
    try {
      const result = await this.http.post<ApiResult<Sacs030VO[]>>(baseUrl, searchData).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //저장함수
  async mainInsert(data: {}): Promise<ApiResult<Sacs030VO>> {

    const baseUrl = `${this.httpUrl}/mainInsert`;
    try {
      const result = await this.http.post<ApiResult<Sacs030VO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //삭제함수
  async mainDelete(data: {}): Promise<ApiResult<Sacs030VO>> {

    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Sacs030VO>>(baseUrl, data).toPromise();
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

  //개별검색함수
  async mainInfo(data: {}): Promise<ApiResult<Sacs030VO>> {
    const baseUrl = `${this.httpUrl}/mainInfo`;
    try {
      const result = await this.http.post<ApiResult<Sacs030VO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
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

export interface Sacs030VO {
  cust_cd: string;
  cust_nm: string;
  wh_cd: string;
  wh_nm: string;
  ptrn_cd: string;
  cust_country: string;
  wh_country: string;
}
