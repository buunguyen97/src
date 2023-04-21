import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {PickVO} from '../sopickcancel/sopickcancel.service';

@Injectable({
  providedIn: 'root'
})
export class SoconfirmedcancelService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/confirmedCancel`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<PickVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findConfirmedCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PickVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: any[]): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveConfirmedCancel`;

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
