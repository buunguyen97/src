import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {RcvExpectedVO} from '../rcvexpected/rcvexpected.service';

@Injectable({
  providedIn: 'root'
})
export class RcvapprovalcancelService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvApprovalCancel`;

  constructor(private http: JHttpService) { }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RcvExpectedVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRcvApprovalCancel`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvExpectedVO[]>>(baseUrl, searchData).toPromise();
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
  async executeConfirmReceiveCancel(searchData: {}): Promise<ApiResult<RcvExpectedVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/executeConfirmReceiveCancel`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvExpectedVO[]>>(baseUrl, searchData).toPromise();
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
