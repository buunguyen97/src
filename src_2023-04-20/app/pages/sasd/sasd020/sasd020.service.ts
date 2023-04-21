import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sasd020Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sasd020`

  constructor(private http: JHttpService) {
  }

  // 다건조회함수
  async mainList(searchData: {}): Promise<ApiResult<ExchVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ExchVO[]>>(baseUrl, searchData).toPromise();
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

  // 단건조회함수
  async mainInfo(data: {}): Promise<ApiResult<ExchVO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ExchVO>>(baseUrl, data).toPromise();
      console.log(result);
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

  // 단건조회함수
  async mainCount(data: {}): Promise<ApiResult<ExchVO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/mainCount`;

    try {
      // Post 방식으로 조회
      const resultCount = await this.http.post<ApiResult<ExchVO>>(baseUrl, data).toPromise();
      return resultCount;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  // 저장함수
  async mainInsert(data: {}): Promise<ApiResult<ExchVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInsert`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<ExchVO>>(baseUrl, data).toPromise();
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

  //수정함수
  async mainUpdate(data: {}): Promise<ApiResult<ExchVO>> {
    const baseUrl = `${this.httpUrl}/mainUpdate`;
    try {
      const result = await this.http.post<ApiResult<ExchVO>>(baseUrl, data).toPromise();
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

  // 삭제함수
  async mainDelete(data: {}): Promise<ApiResult<ExchVO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<ExchVO>>(baseUrl, data).toPromise();
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

export interface ExchVO {
  instance: any;
  tenant: string;
  uid: number;

  exch_dt: string;	// 환율일자
  mony_unit: string;	// 화폐단위
  buy_rate: number;	// 매입환율
  sel_rate: number;	// 매도환율
  std_rate: number;	// 기준환율
  t_buy_rate: number;	// 전신환매입율
  t_sel_rate: number;	// 전신환매도율
  t_std_rate: number;	// 전신환기준율
  rate_unit: number;	// 환율단위
  createdby: string;

  fromExchDt: string;
  toExchDt: string;
}
