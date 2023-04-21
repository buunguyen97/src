import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {SoVO} from '../so/so.service';
import {RcvSerialVO} from '../../rcv/rcvcomplete/rcvcomplete.service';

@Injectable({
  providedIn: 'root'
})
export class SoReportService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/soreport`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<SoVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSoReport`;

    try {
      // Post 방식으로 조회
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

  async getDetail(data: {}): Promise<ApiResult<SoVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSoReportFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<SoVO>>(baseUrl, data).toPromise();
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

  async getSerial(data: {}): Promise<ApiResult<RcvSerialVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findSoSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvSerialVO[]>>(baseUrl, data).toPromise();
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

  async saveSerial(data: any[]): Promise<ApiResult<SoSerialVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveSoSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<SoSerialVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async deleteSerial(data): Promise<ApiResult<SoSerialVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteSoSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<SoSerialVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }
}

export interface SoSerialTempVO {
  tenant: string;
  uid: number;
  soId: number;
  soDetailId: number;
  seq: number;
  itemAdminId: number;
  itemId: number;
  pickedQty1: number;
  serial: string;
  latitude: string;
  longitude: string;
}


export interface SoSerialVO {
  tenant: string;
  uid: number;
  soId: number;
  soDetailId: number;
  seq: number;
  itemAdminId: number;
  itemId: number;
  serial: string;
  latitude: string;
  longitude: string;
}
