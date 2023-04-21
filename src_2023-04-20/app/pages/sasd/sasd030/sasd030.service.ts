import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';
import {CustMstVO} from "../../sacs/sacs010/sacs010.service";

@Injectable({
  providedIn: 'root'
})
export class Sasd030Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sasd030`

  constructor(private http: JHttpService) {
  }

  //조회함수
  async mainList(searchData: {}): Promise<ApiResult<Sasd030VO[]>> {
    //조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;
    try {
      const result = await this.http.post<ApiResult<Sasd030VO[]>>(baseUrl, searchData).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //저장함수
  async mainInsert(data: {}): Promise<ApiResult<Sasd030VO>> {
    const baseUrl = `${this.httpUrl}/mainInsert`;
    try {
      const result = await this.http.post<ApiResult<Sasd030VO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //수정함수
  async mainUpdate(data: {}): Promise<ApiResult<Sasd030VO>> {
    const baseUrl = `${this.httpUrl}/mainUpdate`;
    try {
      const result = await this.http.post<ApiResult<Sasd030VO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //삭제함수
  async mainDelete(data: {}): Promise<ApiResult<Sasd030VO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<Sasd030VO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //개별검색함수
  async mainInfo(data: {}): Promise<ApiResult<Sasd030VO>> {
    const baseUrl = `${this.httpUrl}/mainInfo`;
    try {
      const result = await this.http.post<ApiResult<Sasd030VO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //중복조회
  async mainValidation(data: {}): Promise<ApiResult<Sasd030VO>> {
    const baseUrl = `${this.httpUrl}/mainValidation`;
    try {
      const result = await this.http.post<ApiResult<Sasd030VO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      }
    }
  }

  //품목 업로드 유효성 체크
  async itemUpCheck(data: {}): Promise<ApiResult<Sasd030VO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/itemUpCheck`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sasd030VO[]>>(baseUrl, data).toPromise();
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

  async saveItemUp(data: {}): Promise<ApiResult<Sasd030VO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveItemUp`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sasd030VO>>(baseUrl, data).toPromise();
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

  // 시리얼템플릿다운로드
  async download(): Promise<void> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/download`;

    try {

      const a = window.document.createElement('a');
      // a.href = window.URL.createObjectURL(baseUrl);
      a.href = baseUrl;
      // a.download = `${excelHandler.excelFileName}.XLSX`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);

      // const result = await this.http.get<any>(baseUrl).toPromise();
      //  return result;
    } catch (e) {
      //console.log(e);
      // return {
      //   success: false,
      //   data: null,
      //   code: '-999',
      //   msg: 'Post service api error!'
      // };
    }
  }


  // 파일 애저 업로드
  async uploadFile(data: {}): Promise<ApiResult<CustMstVO>> {
    // 조회 Api 설정

    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/azureStorage/uploadFile`;
    try {

      // mulitpart 데이터 전송을 위한 객체
      const xhr = new XMLHttpRequest();
      xhr.open('post', baseUrl, true);
      xhr.responseType = 'json';
      // @ts-ignore
      xhr.send(data);
      xhr.onload = (event) => {
        if (xhr.status === 200) {
          const result = xhr.response;
          // console.log(result);
          return {
            success: true,
            data: null,
            code: '0',
            msg: ''
          };
        } else {
          return {
            success: false,
            data: null,
            code: '-999',
            msg: ''
          };
        }
      };

      // const result = await this.httpClient.post<ApiResult<BomAdminVO>>(baseUrl, data).
      // toPromise();
      // return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  // 파일 애저 업로드
  async deleteFile(fileName: string): Promise<ApiResult<Sasd030VO>> {
    // 조회 Api 설정

    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/azureStorage/deleteFile?fileName=${fileName}`;
    try {
      // Post 방식으로 조회
      const result = await this.http.get<ApiResult<Sasd030VO>>(baseUrl).toPromise();
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

export interface Sasd030VO {

  item_cd: string;
  item_nm: string;
  barcode: string;
  spec_nm: string;
  item_length: string;
  item_width: string;
  item_height: string;
  cal_unit: string;
  item_gb: string;
  item_wegh: number;
  item_grop: string;
  prod_gb: string;
  itemSetFlg: string;
  item_tp: string;
  eng_item_nm: string;
  load_wegh: number;
  createdby: string;
  createddatetime: string;
  createdip: string;
  modifiedby: string;
  modifieddatetime: string;
  modifiedip: string;
  serial_yn: string;
  itemCategory1Id: number;
  itemCategory2Id: number;
  itemCategory3Id: number;
  wh_barcorde: string;
  item_cbm: number;
  load_wegh1: number;
  load_wegh2: number;
  sto_unit: string;
  sale_krw_pr: number;
  sale_usd_pr: number;
  account_sys: string;
  account_cd: string;
  std_cra: string;
  exp_cra: string;
  remark: string;
  make_loss_unit: string;
  make_loss_rank: number;
  use_yn: string;
  log_file_nm1: string;
  phy_file_nm1: string;
  file: object;
}

export interface ItemUpVO {
  tenant: string;

  uid: string;

  createdby: string,
  modifiedby: string,

  prog_id: string,
  itemList: itemVo[];
}

export interface itemVo {
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
