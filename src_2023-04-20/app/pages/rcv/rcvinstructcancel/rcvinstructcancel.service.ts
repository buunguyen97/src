import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {RcvAcceptVO} from '../rcvinstruct/rcvinstruct.service';

@Injectable({
  providedIn: 'root'
})
export class RcvinstructcancelService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcvInstructCancel`;

  constructor(private http: JHttpService) { }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RcvAcceptVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRcvInstructCancel`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvAcceptVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수
  async executeCancelInstruct(searchData: {}): Promise<ApiResult<RcvAcceptVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/executeCancelInstruct`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvAcceptVO[]>>(baseUrl, searchData).toPromise();
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
