import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sast110Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sast110`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 다건조회함수
  async mainList(searchData: {}): Promise<ApiResult<Sast110VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sast110VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Sast110VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {
        tenant: vTenant,
        ptrn_cd: vPtrnCd
      }
    );

    return this.http.post<ApiResult<Sast110VO[]>>(baseUrl, data);
  }
}

export interface Sast110VO {
  // fromDate: string;
  // toDate: string;
  inOutYm: string;
}
