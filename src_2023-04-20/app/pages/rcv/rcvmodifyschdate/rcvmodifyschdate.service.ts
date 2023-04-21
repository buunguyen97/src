import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {RcvTagDetailVO} from '../rcvperformregistration/rcvperformregistration.service';

@Injectable({
  providedIn: 'root'
})
export class RcvmodifyschdateService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvProgress`;

  constructor(private http: JHttpService) { }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RcvTagDetailVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRcvProgress`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvTagDetailVO[]>>(baseUrl, searchData).toPromise();
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

  // 적치
  async modifySchDate(searchData: {}): Promise<ApiResult<RcvTagDetailVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/rcvModifySchDate`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvTagDetailVO[]>>(baseUrl, searchData).toPromise();
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
}
