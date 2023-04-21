import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Saca040Service {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/saca040`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

   // 메인 조회
   async mainList(searchData: {}): Promise<ApiResult<Saca040VO[]>> {
     // 조회 Api 설정
     const baseUrl = `${this.httpUrl}/mainList`;

     try {
       // Post 방식으로 조회
       const result = await this.http.post<ApiResult<Saca040VO[]>>(baseUrl, searchData).toPromise();
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

  async saveInvoiceUp(data: {}): Promise<ApiResult<InvoiceUpVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveInvoiceUp`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InvoiceUpVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      console.log(e);
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }

}

export interface Saca040VO {
  tenant: string;

  uid: string;

  clsYM: string;

  createdby: string;
  modifiedby: string;

  gridList: gridVo[];
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

export interface InvoiceUpVO {
  tenant: string;

  uid: string;

  createdby: string;
  modifiedby: string;

  invoiceList: InvoiceVO[];
}

export interface InvoiceVO {
  wrk_dt: string;
  invoice_appr_no: string;
  supplier_biz_no: string;
  supplier_biz_nm: string;
  invoice_tot_amt: number;
}
