import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacl020Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacl020`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 메인 조회
   async mainList(searchData: {}): Promise<ApiResult<Sacl020VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Sacl020VO[]>>(baseUrl, searchData).toPromise();
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

  // 메인 조회
  async mainList2(searchData: {}): Promise<ApiResult<Sacl020VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList2`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl020VO[]>>(baseUrl, searchData).toPromise();
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

   // 저장함수
   async mainSave(data: {}): Promise<ApiResult<Sacl020VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl020VO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<Sacl020VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacl020VO>>(baseUrl, data).toPromise();
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

export interface Sacl020VO {
  tenant: string;

  uid: string;

  clsMon: string;
  fromDepoDate: string;
  toDepoDate: string;

  createdby: string;
  modifiedby: string;

  gridList1: gridVo[];
  gridList2: gridVo[];
}

export interface gridVo {
  tenant: string;

  uid: string;

  cls_mon: string;
  expt_cd: string;
  coll_expt_cd: string;
  ord_gb: string;
  claim_no: string;
  bond_cls_yn: string;

  sale_amt: number;
  sale_vat_amt: number;
  tot_sale_amt: number;
}
