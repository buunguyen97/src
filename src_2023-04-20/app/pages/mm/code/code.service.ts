import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class CodeService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/code`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<CodeCategoryVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findCodeCategory`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CodeCategoryVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<CodeCategoryVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findCodeCategoryFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CodeCategoryVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<CodeCategoryVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveCodeCategory`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CodeCategoryVO[]>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<CodeCategoryVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateCodeCategory`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CodeCategoryVO[]>>(baseUrl, data).toPromise();
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

  async delete(data: CodeCategoryVO): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteCodeCategory`;

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

export interface CodeCategoryVO {
  tenant: string;

  uid: number;
  codeCategory: string;
  systemType: string;
  name: string;
  remarks: string;
  isUsingSystemFlg: string;
  isEditPossibleFlg: string;

  codeList: CodeVO[];
}

export interface CodeVO {
  tenant: string;

  uid: number;
  codeCategoryId: number;
  code: string;
  name: string;
  etcColumn1: string;
  etcColumn2: string;
  etcColumn3: string;
  etcColumn4: string;
  etcColumn5: string;
  priority: number;
}
