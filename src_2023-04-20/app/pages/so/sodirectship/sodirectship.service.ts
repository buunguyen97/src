import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {SoVO} from '../so/so.service';

@Injectable({
  providedIn: 'root'
})
export class SodirectshipService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/directShip`;

  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<SoVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSo`;

    try {
      const result = await this.http.post<ApiResult<SoVO[]>>(baseUrl, searchData).toPromise();
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

  async findSoFull(searchData: {}): Promise<ApiResult<SoVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSoFull`;

    try {
      const result = await this.http.post<ApiResult<SoVO>>(baseUrl, searchData).toPromise();
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

  async findInvTagWhLocation(searchData: {}): Promise<ApiResult<any[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findInvTagWhLocation`;

    try {
      const result = await this.http.post<ApiResult<any[]>>(baseUrl, searchData).toPromise();
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

  async findPickDetail(searchData: {}): Promise<ApiResult<SoVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findPickDetail`;

    try {
      const result = await this.http.post<ApiResult<SoVO[]>>(baseUrl, searchData).toPromise();
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

  async procDirectShip(searchData: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/procDirectShip`;

    try {
      const result = await this.http.post<ApiResult<void>>(baseUrl, searchData).toPromise();
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
