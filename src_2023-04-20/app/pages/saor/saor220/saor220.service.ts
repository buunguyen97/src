import { Injectable } from '@angular/core';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saor220Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saor220`;

  // http 객체 Injection
  constructor(private http: JHttpService) { }
  
     //메인 조회
   async mainList(searchData : {}) : Promise<ApiResult<Saor220VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Saor220VO[]>>(baseUrl, searchData).toPromise();
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
   
   //제품 목록
   async detailList(data: {}): Promise<ApiResult<Saor220VO>> {
       // 조회 Api
       const baseUrl = `${this.httpUrl}/detailList`;

       try {
         // Post 방식으로 조회
         const result = await this.http.post<ApiResult<Saor220VO>>(baseUrl, data).toPromise();
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
   
  async contNoInfo(data: {}): Promise<ApiResult<Saor220VO>> {
       // 조회 Api
       const baseUrl = `${this.httpUrl}/contNoInfo`;

       try {
         // Post 방식으로 조회
         const result = await this.http.post<ApiResult<Saor220VO>>(baseUrl, data).toPromise();
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
   
   //수정함수
   async mainSave(data: {}): Promise<ApiResult<Saor220VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainSave`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor220VO>>(baseUrl, data).toPromise();
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
  async mainInsert(data: {}): Promise<ApiResult<Saor220VO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInsert`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor220VO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<Saor220VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Saor220VO>>(baseUrl, data).toPromise();
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
  
  // 그리드용 정보조회
  async gridInfo(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/gridInfo`;

    try {
      // Post 방식으로 조회
      const resultCount = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
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
  // 그리드용 정보조회
  async gridInfo2(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/gridInfo2`;

    try {
      // Post 방식으로 조회
      const resultCount = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
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

  // 그리드용 정보조회
  async gridInfo2Search(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/gridInfo2Search`;

    try {
      // Post 방식으로 조회
      const resultCount = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
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

   //I/F함수
   async sendApi(data: {}): Promise<ApiResult<Saor220VO>> {
    // 조회 Api 설정
    
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/interface/sendApi`;  // sendApi
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Saor220VO>>(baseUrl, data).toPromise();
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
export interface Saor220VO {
  tenant: string;

  uid: string;
  
  ord_no: string,      // 주문번호
  ord_seq: string,     // 주문순번
  out_ord_no: string,     // 주문순번
  expt_cd: string,     // 수출사코드
  ord_gb: string,      // 주문구분(1:판매,2:렌탈,3:견본,타계정)
  ord_dt: string,      // 주문일자
  ptrn_cd: string,     // 파트너코드
  out_stat: string,    // 작업상태(주문등록,주문할당)
  dg_country: string,  // 도착국가코드
  cont_no: string,     // 계약번호
  mony_unit: string,   // 화폐단위
  std_rate: number,    // 기준환율
  dg_adr1: string,     // 납품주소1
  dg_adr2: string,     // 납품주소2
  dg_req_dt: string,   // 납품요청일자
  impt_cd: string,     // 수입자코드
  remark: string,      // 비고
  sa_chg_nm: string,   // 영업담당자
  out_no: string;
  bp_dt: string;
  sa_wh_cd:string;
  exptCd2:string;
  
  ordItemList: OrdItemVO[];
}

export interface OrdItemVO {
  tenant: string;

  uid: string;
  
  ord_no           : string;  // 주문번호
  ord_seq          : string;  // 주문순번
  item_cd          : string;  // 제품코드
  ord_qty          : number;  // 주문수량
  ord_pr           : number;  // 주문단가
  ord_amt          : number;  // 주문금액
}