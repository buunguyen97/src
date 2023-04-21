import {Injectable} from '@angular/core';
import {ApiResult} from '../../../shared/vo/api-result';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';

@Injectable({
  providedIn: 'root'
})
export class ReportMngService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/reportmng`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ReportMngVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findReport`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ReportMngVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수(디테일포함)
  async getFull(searchData: {}): Promise<ApiResult<ReportMngVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findReportFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ReportMngVO>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<ReportMngVO>> {
    const baseUrl = `${this.httpUrl}/saveReport`;
    try {
      const result = await this.http.post<ApiResult<ReportMngVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<ReportMngVO>> {
    const baseUrl = `${this.httpUrl}/updateReport`;
    try {
      const result = await this.http.post<ApiResult<ReportMngVO>>(baseUrl, data).toPromise();
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

  async delete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/deleteReport`;
    try {
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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


export interface ReportMngVO {
  tenant: string;

  uid: number;
  category: string;
  reportKey: string;
  reportName: string;
  url: string;
  refNo1: string;
  refNo2: string;
  refNo3: string;

  actFlg: string;
  remarks: string;

  createdBy: string;
  createdDatetime: Date;
  modifiedBy: string;
  modifiedDatetime: Date;

  reportDetailList: ReportDetailVO[];
}


export interface ReportDetailVO {
  tenant: string;

  uid: number;
  reportId: string;
  dataSet: string;
  node: string;
  path: string;

  apiParam: string;
}
