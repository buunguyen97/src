import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {SoVO} from '../so/so.service';

@Injectable({
  providedIn: 'root'
})
export class SoallocreportService {
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/allocreport`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<SoVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findAllocReport`;

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
    const baseUrl = `${this.httpUrl}/findAllocReportFull`;

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
}

export interface AllocateReportVO {
  tenant: string;
  pickType: string;
  pickGroup: string;
  pickAllocGroup: string;
  delivSchDate: Date;
  remarks: string;
  list: number[];
}
