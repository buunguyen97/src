import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sast070Service {

  // URL
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sast070`;

  // HTTP Instance Injection
  constructor(private http: JHttpService) {
  }

  // Search
  async list(searchData: {}): Promise<ApiResult<Sast070VO[]>> {
    // Search Api Setting
    const baseUrl = `${this.httpUrl}/list`;
    try {
      const result = await this.http.post<ApiResult<Sast070VO[]>>(baseUrl, searchData).toPromise();
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

  // Save
  async save(data: {}): Promise<ApiResult<Sast070VO>> {
    // Save Api Setting
    console.log(data);
    const baseUrl = `${this.httpUrl}/save`;
    try {
      const result = await this.http.post<ApiResult<Sast070VO>>(baseUrl, data).toPromise();
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

  // Info
  async info(data: {}): Promise<ApiResult<Sast070VO>> {
    // Info Api Setting
    const baseUrl = `${this.httpUrl}/info`;
    try {
      const result = await this.http.post<ApiResult<Sast070VO>>(baseUrl, data).toPromise();
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

  // Update
  async update(data: {}): Promise<ApiResult<Sast070VO[]>> {
    // Update Api Setting
    const baseUrl = `${this.httpUrl}/update`;
    try {
      const result = await this.http.post<ApiResult<Sast070VO[]>>(baseUrl, data).toPromise();
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

  // Delete
  async delete(data: {}): Promise<ApiResult<Sast070VO>> {
    // Delete Api Setting
    const baseUrl = `${this.httpUrl}/delete`;
    try {
      const result = await this.http.post<ApiResult<Sast070VO>>(baseUrl, data).toPromise();
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

  // Dup_Check
  async dup_check(data: {}): Promise<ApiResult<Sast070VO>> {
    // Dup_Check Api Setting
    const baseUrl = `${this.httpUrl}/dup_check`;
    try {
      const result = await this.http.post<ApiResult<Sast070VO>>(baseUrl, data).toPromise();
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

  // Item
  // tslint:disable-next-line:typedef
  async getItem(vTenant: string, vItemCd: string, vMatDt: string) {
    // getItem Api Setting
    const baseUrl = `${this.httpUrl}/getItem`;
    const data = Object.assign(
      {tenant: vTenant},
      {itemCd: vItemCd},
      {matDt: vMatDt}
    );
    const response = await this.http.post<ApiResult<Sast070VO>>(baseUrl, data).toPromise();
    return response.data;
  }

  // Sales WareHouse
  sales_wh_list(vTenant: string, vUsedYn: string, vPtrnCd: string): Observable<ApiResult<SalesWhVO[]>> {
    const baseUrl = `${this.httpUrl}/sales_wh_list`;
    const data = Object.assign(
      {
        tenant: vTenant
        , used_yn: vUsedYn
        , ptrn_cd: vPtrnCd
      }
    );
    return this.http.post<ApiResult<SalesWhVO[]>>(baseUrl, data);
  }

  // Sales WareHouse
  sales_wh_AllList(vTenant: string, vUsedYn: string): Observable<ApiResult<SalesWhVO[]>> {
    const baseUrl = `${this.httpUrl}/sales_wh_AllList`;
    const data = Object.assign(
      {
        tenant: vTenant
        , used_yn: vUsedYn
      }
    );
    return this.http.post<ApiResult<SalesWhVO[]>>(baseUrl, data);
  }

  // 재고조정확정
  async procAdjust(data: {}): Promise<ApiResult<Sast070VO>> {
    // Save Api Setting
    const baseUrl = `${this.httpUrl}/procAdjust`;
    try {
      const result = await this.http.post<ApiResult<Sast070VO>>(baseUrl, data).toPromise();
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

export interface Sast070VO {
  tenant: string;
  // uid: string;

  sto_dt: string;
  ptrn_cd: string;
  sales_wh_cd: string;
  wh_cd: string;
  targetcompany: string;
  isif: string;
  pwh_cd: string;
  sts: string;
  damageflg: string;
  owner: string;
  itemCd: string;
  stoYm: string;
  fromAdjustDate: string;
  toAdjustDate: string;
  remarks: string;

  itemList: Sast070VOList[];
}

export interface Sast070VOList {
  tenant: string;
  // uid: string;

  ptrn_cd: string;
  item_cd: string;
  item_nm: string;
  spec_nm: string;
  base_unit: string;
  sto_unit: string;
  avg_pr: number;
  aui_pr: number;
  cal_pr: string;
  sto_qty: number;
  aui_qty: number;
  cal_qty: string;
  rfa: string;
  damageflg: string;
  lot: string;
}

export interface SalesWhVO {
  tenant: string;

  used_yn: string;
  ptrn_cd: string;
  cd: string;
  nm: string;
  display: string;
}
