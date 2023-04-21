import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';
import {Sarc010VO} from "../sarc010/sarc010.service";

@Injectable({
  providedIn: 'root'
})
export class Sarc070Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sarc070`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 다건조회함수
   async mainList(searchData : {}) : Promise<ApiResult<Sarc070VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Sarc070VO[]>>(baseUrl, searchData).toPromise();
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

  getExptPtrn(vTenant: string, vPtrnCd: string): Observable<ApiResult<Sarc010VO[]>> {
    const baseUrl = `${this.httpUrl}/getExpt`;
    const data = Object.assign(
      {
        tenant: vTenant,
        ptrn_cd: vPtrnCd
      }
    );

    return this.http.post<ApiResult<Sarc010VO[]>>(baseUrl, data);
  }
}

export interface Sarc070VO {
  fromScheEndDate: string;
  toScheEndDate: string;
}
