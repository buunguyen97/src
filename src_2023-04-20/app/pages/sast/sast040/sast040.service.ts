import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sast040Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sast040`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   //다건조회함수
   async mainList(searchData : {}) : Promise<ApiResult<Sast040VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Sast040VO[]>>(baseUrl, searchData).toPromise();
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
   
  //다건조회함수
  async subList(searchData : {}) : Promise<ApiResult<Sast040VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/subList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sast040VO[]>>(baseUrl, searchData).toPromise();
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

export interface Sast040VO {
	caY: any;
	caM: any;
}