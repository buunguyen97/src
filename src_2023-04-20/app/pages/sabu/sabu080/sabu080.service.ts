import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sabu080Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sabu080`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  //다건조회함수
  async mainList(searchData: {}): Promise<ApiResult<Sabu080VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList_alporter`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu080VO[]>>(baseUrl, searchData).toPromise();
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

  // 구매발주확정취소
  async purCancel(data: {}): Promise<ApiResult<Sabu080VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/purCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sabu080VO>>(baseUrl, data).toPromise();
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

export interface Sabu080VO {

  fromChkDate: string;
  toChkDate: string;

}
