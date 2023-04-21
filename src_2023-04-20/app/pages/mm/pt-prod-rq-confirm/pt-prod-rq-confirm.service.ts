import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {RiInstructResultVO} from '../../inv/ri-instruct-result/ri-instruct-result.service';

@Injectable({
  providedIn: 'root'
})
export class PtProdRqConfirmService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodrqconfirm`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RiInstructResultVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRiInstructResult`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RiInstructResultVO[]>>(baseUrl, searchData).toPromise();
      console.log(result);
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

  // 승인
  async riInstructPerform(data: any[]): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/savePtProdRqConfirm`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

  // 지시 취소
  async reject(data: any[]): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/reject`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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
