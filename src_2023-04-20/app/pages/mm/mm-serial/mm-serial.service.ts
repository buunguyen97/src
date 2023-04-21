import {Injectable} from '@angular/core';
import {ApiResult} from '../../../shared/vo/api-result';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';

@Injectable({
  providedIn: 'root'
})
export class MmSerialService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/mmSerial`;

  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<MmSerialVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findMmSerial`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MmSerialVO[]>>(baseUrl, searchData).toPromise();
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

  async generateSerial(searchData: {}): Promise<ApiResult<MmSerialVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/generateSerial`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MmSerialVO[]>>(baseUrl, searchData).toPromise();
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

export interface MmSerialVO {
  tenant: string;
  uid: number;
  serialKey: number;
  serialType: string;
  sts: string;
  serial: string;
  latitude: string;
  longitude: string;
  fromSerial: string;
  toSeiral: string;
  manufacturer: string;
  remarks: string;
}
