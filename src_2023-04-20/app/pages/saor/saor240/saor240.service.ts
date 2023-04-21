import { Injectable } from '@angular/core';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';
import {Saor200VO} from '../saor200/saor200.service';

@Injectable({
  providedIn: 'root'
})
export class Saor240Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saor240`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 다건조회함수
   async mainList(searchData: {}): Promise<ApiResult<Saor240VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Saor240VO[]>>(baseUrl, searchData).toPromise();
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

  // 반품확정취소
  async returnCancel(data: {}): Promise<ApiResult<Saor200VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/returnCancel`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor200VO>>(baseUrl, data).toPromise();
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

export interface Saor240VO {
  fromOrdDate: string;
  toOrdDate: string;
}
