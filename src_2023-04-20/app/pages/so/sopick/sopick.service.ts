import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {SoDetailVO, SoVO} from '../so/so.service';
import {PickDetailVO, PickVO} from '../sopickcancel/sopickcancel.service';

@Injectable({
  providedIn: 'root'
})
export class SopickService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/pick`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<PickDetailVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findPicklJoin`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PickDetailVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/savePick`;

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

export interface PickSaveVO {
  tenant: string;
  list: number[];
}
