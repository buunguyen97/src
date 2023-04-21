import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class ItemadminService {
  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/itemAdmin`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ItemAdminVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findItemAdmin`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ItemAdminVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<ItemAdminVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findItemAdminFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ItemAdminVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<ItemAdminVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveItemAdmin`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ItemAdminVO[]>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<ItemAdminVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateCodeCategory`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ItemAdminVO[]>>(baseUrl, data).toPromise();
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

  async delete(data: ItemAdminVO): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteItemAdmin`;

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

export interface ItemAdminVO {
  tenant: string;

  uid: number;
  itemAdmin: string;
  actFlg: string;
  name: string;
  shortName: string;
}
