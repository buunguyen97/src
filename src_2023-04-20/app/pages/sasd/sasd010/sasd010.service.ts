import { Injectable } from '@angular/core';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { CommonUtilService } from 'src/app/shared/services/common-util.service';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sasd010Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sasd010`

   constructor(private http: JHttpService,
   				private utilService: CommonUtilService) { }

   //다건조회함수
   async mainList(searchData : {}) : Promise<ApiResult<DeptVO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<DeptVO[]>>(baseUrl, searchData).toPromise();
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

   //단건조회함수
   async mainInfo(data: {}): Promise<ApiResult<DeptVO>> {
	   // 조회 Api
	   const baseUrl = `${this.httpUrl}/mainInfo`;

       try {
         // Post 방식으로 조회
         const result = await this.http.post<ApiResult<DeptVO>>(baseUrl, data).toPromise();
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

   //저장함수
   async mainInsert(data: {}): Promise<ApiResult<DeptVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInsert`;
	      debugger;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<DeptVO>>(baseUrl, data).toPromise();
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
  async mainUpdate(data: {}): Promise<ApiResult<DeptVO>> {
    const baseUrl = `${this.httpUrl}/mainUpdate`;
    try {
      const result = await this.http.post<ApiResult<DeptVO>>(baseUrl, data).toPromise();
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

  //삭제함수
  async mainDelete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
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

export interface DeptVO {
	tenant : string;
	uid: number;

	ptrn_id: string;    // 파트너사코드
	ptrn_nm: string;    // 파트너사
	dept_id: string;	  // 부서Id
	dept_nm: string;	  // 부서명
	use_yn: string;		  // 사용여부
  createdby: string;
  modifiedby: string;
}

