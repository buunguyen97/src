import {Injectable} from '@angular/core';
import {ApiResult} from '../../../shared/vo/api-result';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Injectable({
  providedIn: 'root'
})
export class Saca050Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saca050`;

  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<Saca050VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saca050VO[]>>(baseUrl, searchData).toPromise();
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

export interface Saca050VO {
  cls_mon: Date | number | string;
}
