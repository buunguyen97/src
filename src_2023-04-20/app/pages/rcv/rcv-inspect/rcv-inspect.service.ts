import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {RcvVO} from '../rcvaccept/rcvaccept.service';

@Injectable({
  providedIn: 'root'
})
export class RcvInspectService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvInspect`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RcvVO[]>> {
    const baseUrl = `${this.httpUrl}/findRcvInspect`;
    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<RcvVO[]>>(baseUrl, searchData).toPromise();
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
  async getRcvFull(searchData: {}): Promise<ApiResult<any>> {
    const baseUrl = `${this.httpUrl}/findRcvFull`;

    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<any>>(baseUrl, searchData).toPromise();
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
