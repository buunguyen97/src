import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class ItemCategoryService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/itemCategory`;

  // http 객체 Injection
  constructor(
    private http: JHttpService) {
  }

  async getCategory1(searchData: {}): Promise<ApiResult<ItemCategoryVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findItemCategory1`;
    try {
      const result = await this.http.post<ApiResult<ItemCategoryVO[]>>(baseUrl, searchData).toPromise();
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

  async getCategory2(searchData: {}): Promise<ApiResult<ItemCategoryVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findItemCategory2`;
    try {
      const result = await this.http.post<ApiResult<ItemCategoryVO[]>>(baseUrl, searchData).toPromise();
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

  async getCategory3(searchData: {}): Promise<ApiResult<ItemCategoryVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findItemCategory3`;
    try {
      // Post 방식으로 조회
      // Company는 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<ItemCategoryVO[]>>(baseUrl, searchData).toPromise();
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

  async saveCategory(searchData: {}): Promise<ApiResult<any>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/saveItemCategory`;
    try {
      // Post 방식으로 조회
      // Company는 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<any>>(baseUrl, searchData).toPromise();
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

  async getCategoryAll(searchData: {}): Promise<ApiResult<ItemCategoryVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findItemCategoryAll`;
    try {
      const result = await this.http.post<ApiResult<ItemCategoryVO[]>>(baseUrl, searchData).toPromise();
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


export interface ItemCategoryVO {
  tenant: string;
  uid: number;

  name: string;
  priorities: number;
  display: string;

  itemCategory1Id: number;
  itemCategory2Id: number;

  category2List: ItemCategoryVO[];
  category3List: ItemCategoryVO[];

}
