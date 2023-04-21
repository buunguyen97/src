import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sasd040Service {

    // 기본 URL 선언
    httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sasd040`

    // http 객체 Injection
    constructor(private http: JHttpService) { }

    //다건조회함수
    async get(searchData: {}): Promise<ApiResult<Sasd040VO[]>> {
        //조회 Api 설정
        const baseUrl = `${this.httpUrl}/mainList`;
        try {
            const result = await this.http.post<ApiResult<Sasd040VO[]>>(baseUrl, searchData).toPromise();
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
    async mainInsert(data: {}): Promise<ApiResult<Sasd040VO>> {
        const baseUrl = `${this.httpUrl}/mainInsert`;
        try {
            const result = await this.http.post<ApiResult<Sasd040VO>>(baseUrl, data).toPromise();
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
    async mainUpdate(data: {}): Promise<ApiResult<Sasd040VO[]>> {
        const baseUrl = `${this.httpUrl}/mainUpdate`;
        try {
            const result = await this.http.post<ApiResult<Sasd040VO[]>>(baseUrl, data).toPromise();
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
    async mainDelete(data: {}): Promise<ApiResult<Sasd040VO>> {

        const baseUrl = `${this.httpUrl}/mainDelete`;
        try{
            const result = await this.http.post<ApiResult<Sasd040VO>>(baseUrl, data).toPromise();
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

    //개별검색함수
    async mainInfo(data: {}): Promise<ApiResult<Sasd040VO>> {
        const baseUrl = `${this.httpUrl}/mainInfo`;
        try{
            const result = await this.http.post<ApiResult<Sasd040VO>>(baseUrl, data).toPromise();
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

    async itemCount(data: {}): Promise<ApiResult<Sasd040VO>> {
        const baseUrl = `${this.httpUrl}/itemCount`;
        try{
            const result = await this.http.post<ApiResult<Sasd040VO>>(baseUrl, data).toPromise();
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

export interface Sasd040VO {

    tenant: string;

    item_cd: string;
    m_item_cd: string;
    c_qty: number;
    use_yn: string;
  sale_krw_pr: number;
  sale_usd_pr: number;
  createdby: string;
  modifiedby: string;

    sasd040DetailList: Sasd040DetailVO[];

}

export interface Sasd040DetailVO{

    tenant: string;

    item_cd: string;
    m_item_cd: string;
    c_qty: number;
    use_yn: string;
    createdby:string;
    modifiedby:string;

}

export interface Sasd030VO {
    tenant: string;
    item_cd: string;
    item_nm: string;
    barcode: string;
    spec_nm: string;
    type_nm: string;
    item_length:string;
    model_nm:string;
    item_width:string;
    item_hegiht:string;
    base_unit:string;
    cal_unit:string;
    unit_rate:number;
    rent_pr:number;
    sale_pr:number;
    item_gb:string;
    item_wegh:number;
    item_grop:string;
    prod_gb:string;
    use_yn:string;
    set_item_yn:string;
}
