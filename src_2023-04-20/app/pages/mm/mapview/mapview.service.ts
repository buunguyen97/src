import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class MapviewService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/mapview`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<MapViewVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findTrace`;

    try {
      // Post 방식으로 조회
      // Warehouse는 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<MapViewVO[]>>(baseUrl, searchData).toPromise();
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
  async getDetail(searchData: {}): Promise<ApiResult<MapViewVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findTraceDetail`;

    try {
      // Post 방식으로 조회
      // Warehouse는 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<MapViewVO[]>>(baseUrl, searchData).toPromise();
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

export interface MapViewVO {
  tenant: string;
  uid: number;

  txType: string;
  key: number;
  lineNo: number;
  serial: string;
  latitude: string;
  longitude: string;

  latLong: string;
}
