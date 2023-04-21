import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class InfMonitoringService {

  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/infmonitoring`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<InfMonitoringVO[]>> {
    const baseUrl = `${this.httpUrl}/findInfMonitoring`;
    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<InfMonitoringVO[]>>(baseUrl, searchData).toPromise();
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  // 조회함수(디테일포함)
  async getFull(searchData: {}): Promise<ApiResult<any>> {
    const baseUrl = `${this.httpUrl}/findInfMonitoringFull`;

    try {
      // Post 방식으로 조회
      return await this.http.post<ApiResult<any>>(baseUrl, searchData).toPromise();
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async onReTransmission(data: {}): Promise<ApiResult<InfMonitoringVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/onReTransmission`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InfMonitoringVO[]>>(baseUrl, data).toPromise();
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


export interface InfMonitoringVO {
  uid: string;

  logDateTime: Date;
  apiType: string;
  requestData: string;
  responseData: string;
  resDateTime: Date;
  systemType: string;
  successYN: string;

  apiTypeName: string;
  systemTypeName: string;

  fromLogDateTime: string;
  toLogDateTime: string;
  fromResDateTime: string;
  toResDateTime: string;

  totalNo: number;
  noOfSuccesses: number;
  noOfFailures: number;
  logKey: string;

  // createdBy: string;
  // createdDatetime: Date;
  // modifiedBy: string;
  // modifiedDatetime: Date;

  // infMonitoringDetailList: InfMonitoringDetailVO[];
}


export interface InfMonitoringDetailVO {
  tenant: string;
  uid: string;

  logDateTime: Date;
  apiType: string;
  requestData: string;
  responseData: string;
  resDateTime: Date;
  systemType: string;
  successYN: string;
}
