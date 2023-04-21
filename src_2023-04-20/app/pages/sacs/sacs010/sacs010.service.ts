import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacs010Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs010`

  constructor(private http: JHttpService) {
  }

  /*************** 파트너정보 ***************/

  //다건조회함수
  async mainList(searchData: {}): Promise<ApiResult<any>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, searchData).toPromise();

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
  async mainInfo(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();

      result.data.ptrn_yn = result.data.ptrn_yn === 1 ? true : false;
      result.data.expt_yn = result.data.expt_yn === 1 ? true : false;
      result.data.impt_yn = result.data.impt_yn === 1 ? true : false;
      result.data.pur_yn = result.data.pur_yn === 1 ? true : false;

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

  //사업자번호 중복체크
  async bizNoCount(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/bizNoCount`;

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

  //사업자번호 중복체크
  async dunsNoCount(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/dunsNoCount`;

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

  //사업자번호 중복체크
  async mBizNoCount(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/mBizNoCount`;

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

  //저장함수
  async mainInsert(data: {}): Promise<ApiResult<CustMstVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/mainInsert`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustMstVO>>(baseUrl, data).toPromise();
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
  async mainUpdate(data: {}): Promise<ApiResult<CustMstVO>> {
    const baseUrl = `${this.httpUrl}/mainUpdate`;
    try {
      const result = await this.http.post<ApiResult<CustMstVO>>(baseUrl, data).toPromise();
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
  async mainDelete(data: {}): Promise<ApiResult<CustMstVO>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
    try {
      const result = await this.http.post<ApiResult<CustMstVO>>(baseUrl, data).toPromise();
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
  async subDelete(data: {}): Promise<ApiResult<any>> {
    const baseUrl = `${this.httpUrl}/subDelete`;
    try {
      const resultDelete = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
      return resultDelete;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }


  /*************** 수출사계약 ***************/

  //다건조회함수
  async detailList(searchData: {}): Promise<ApiResult<CustContVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/detailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustContVO[]>>(baseUrl, searchData).toPromise();

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
  async prodList(data: {}): Promise<ApiResult<CustContVO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/prodList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustContVO>>(baseUrl, data).toPromise();
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

  //거래처코드 중복 유효성검사
  async detailCount(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/detailCount`;

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

  //거래처코드 중복 유효성검사
  async imptCdCheck(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/imptCdCheck`;

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

  //저장함수
  async prodInsert(data: {}): Promise<ApiResult<CustContVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/prodInsert`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustContVO>>(baseUrl, data).toPromise();
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
  /*async detailUpdate(data: {}): Promise<ApiResult<CustContVO>> {
    const baseUrl = `${this.httpUrl}/detailUpdate`;
    try {
      const result = await this.http.post<ApiResult<CustContVO>>(baseUrl, data).toPromise();
      return result;
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }*/

  //삭제함수
  async detailDelete(data: {}): Promise<ApiResult<CustContVO>> {
    const baseUrl = `${this.httpUrl}/detailDelete`;
    try {
      const result = await this.http.post<ApiResult<CustContVO>>(baseUrl, data).toPromise();
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

  /*************** 수출사계약 ***************/

  //다건조회함수
  async purList(searchData: {}): Promise<ApiResult<PurContVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/purList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PurContVO[]>>(baseUrl, searchData).toPromise();

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
  async purDetailList(data: {}): Promise<ApiResult<PurContVO>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/purDetailList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PurContVO>>(baseUrl, data).toPromise();
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

  //거래처코드 중복 유효성검사
  async purCount(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/purCount`;

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

  //저장함수
  async purDetailInsert(data: {}): Promise<ApiResult<PurContVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/purDetailInsert`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PurContVO>>(baseUrl, data).toPromise();
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
  async purDelete(data: {}): Promise<ApiResult<CustContVO>> {
    const baseUrl = `${this.httpUrl}/purDelete`;
    try {
      const result = await this.http.post<ApiResult<CustContVO>>(baseUrl, data).toPromise();
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


  /*************** 파트너정보 ***************/

  //다건조회함수
  async ptrnList(searchData: {}): Promise<ApiResult<any>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/ptrnList`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, searchData).toPromise();

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
  async ptrnInfo(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/ptrnInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();

      // result.data.ptrn_yn = result.data.ptrn_yn === 1 ? true : false;
      // result.data.expt_yn = result.data.expt_yn === 1 ? true : false;
      // result.data.impt_yn = result.data.impt_yn === 1 ? true : false;
      // result.data.pur_yn = result.data.pur_yn === 1 ? true : false;

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

  //파트너사 계약 중복체크
  async ptrnCount(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/ptrnCount`;

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

  //저장함수
  async ptrnInsert(data: {}): Promise<ApiResult<PtrnContVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/ptrnInsert`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtrnContVO>>(baseUrl, data).toPromise();
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
  async ptrnUpdate(data: {}): Promise<ApiResult<PtrnContVO>> {
    const baseUrl = `${this.httpUrl}/ptrnUpdate`;
    try {
      const result = await this.http.post<ApiResult<PtrnContVO>>(baseUrl, data).toPromise();
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
  async ptrnDelete(data: {}): Promise<ApiResult<PtrnContVO>> {
    const baseUrl = `${this.httpUrl}/ptrnDelete`;
    try {
      const result = await this.http.post<ApiResult<PtrnContVO>>(baseUrl, data).toPromise();
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

  /*************** 거래처 엑셀 업로드 ***************/
  async sendPost(data: {}, command: string): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sasd040/` + command;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
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


  /*************** 거래처 엑셀 업로드 ***************/

  // 거래처 업로드 저장
  async saveCustUp(data: {}): Promise<ApiResult<CustMstVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveCustUp`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustMstVO>>(baseUrl, data).toPromise();
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
  // 거래처 업로드 저장
  async updateCustUp(data: {}): Promise<ApiResult<CustMstVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateCustUp`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustMstVO>>(baseUrl, data).toPromise();
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

  //거래처 업로드 유효성 체크
  async custUpCheck(data: {}): Promise<ApiResult<CustMstVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/custUpCheck`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustMstVO[]>>(baseUrl, data).toPromise();
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

  //거래처 업로드 유효성 체크
  /* async saUser(data: {}): Promise<ApiResult<saUserVO[]>> {
       // 조회 Api 설정
       const baseUrl = `${this.httpUrl}/saUserSelect`;
       try {
           // Post 방식으로 조회
           const result = await this.http.post<ApiResult<saUserVO[]>>(baseUrl, data).toPromise();
           return result;
       } catch (e) {
           return {
               success: false,
               data: null,
               code: e.code,
               msg: e.msg
           };
       }
   }*/

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
}

export interface saUserVO {
  tenant: string;
  uid: number;
  warehouse: string;
  logisticsId: number;
  name: string;
  display: string;
}

export interface CustMstVO {

  tenant: string;

  cust_cd: string;		//거래처코드
  cust_nm: string;		//거래처명
  boss_nm: string;		//대표자명
  biz_no: string;		//사업자번호
  zip_no: string; 		//우편번호
  biz_adr1: string;		//사업장주소1
  biz_adr2: string;		//사업장주소2
  eng_biz_adr1: string;	//영문사업장주소1
  eng_biz_adr2: string;	//영문사업장주소2
  biz_type: string;		//업종
  biz_cond: string;		//업태
  country: string;		//국가코드
  tel_no: string;		//전화번호
  fax_no: string;		//팩스번호
  chg_nm: string;		//담당자명
  chg_tel_no: string;	//담당자연락처
  chg_email: string;		//담당자이메일
  /*cal_yn : string;		//정산여부
  loan_amt : number;		//여신금액*/
  ptrn_yn: boolean;		//파트너사여부
  expt_yn: boolean;		//수출사여부
  impt_yn: boolean;		//수입사여부
  use_yn: string;		//사용여부
  createdby: string;
  createddatetime: string;
  createdip: string;
  modifiedby: string;
  modifieddatetime: string;
  modifiedip: string;
  eng_cust_nm: string;
  lat: number;
  long: number;
  pur_yn: boolean;
  etc_yn: string;
  biz_gb: string;
  eng_cust_short_nm: string;
  corp_no: string;
  duns_no: string;
  est_dt: string;
  biz_unit_tax_yn: string;
  m_biz_no: string;
  eng_boss_nm: string;
  boss_country: string;
  boss_sex: string;
  boss_email: string;
  homepage: string;
  chg_hp_no: string;
  wh_biz_adr1: string;
  wh_biz_adr2: string;
  wh_eng_biz_adr1: string;
  wh_eng_biz_adr2: string;
  wh_zip_no: string;
  wh_lat: number;
  wh_long: number;
  wh_tel_no: string;
  wh_fax_no: string;
  wh_chg_nm: string;
  wh_chg_email: string;
  wh_chg_tel_no: string;
  wh_chg_hp_no: string;
  bill_chg_nm: string;
  bill_chg_email: string;
  bill_chg_tel_no: string;
  bill_chg_hp_no: string;
  remark: string;
  cont_chg_comp_cd: string;
  cont_chg_id: string;
  wh_ptrn_cd: string;
  account_comp_cd: string;
  account_sys: string;
  account_cd: string;
  check: any;
  check2: any;
  log_file_nm1: any;
  phy_file_nm1: any;
  sa_chg_id: string;
  wh_country: string;

  uid: number;
  name: string;
  companyid: number;
  p_cust_cd: string;

  file: object;
  address2AutoComplete: string;
  address1AutoComplete: string;

  log_file_nm2: string;
  phy_file_nm2: string;
  log_file_nm3: string;
  phy_file_nm3: string;
  log_file_nm4: string;
  phy_file_nm4: string;
  log_file_nm5: string;
  phy_file_nm5: string;
}

export interface CustContVO {
  formModified: string;
  modifiedby: string;
  createdby: string;

  tenant: string;

  uid: string;

  cust_cd: string,
  cust_nm: string,
  cont_no: string,
  cont_dt: string,
  cont_conts: string,
  cont_st_dt: string,
  cont_end_dt: string,
  cont_rental_period: string,
  cont_end_yn: string,
  dely_rate: number,
  mony_unit: string,
  std_rate: number,
  cont_gb: string,
  sign_stat: string,
  reportid: number;

  custDetailList: CustContItemVO[],
  custDetailList2: CustContItemVO[];
}

export interface CustContItemVO {

  uid: string;

  cont_no: string;
  item_cd: string;
  cont_pr: number;
  rent_day_pr: number;
}

export interface PurContVO {
  createdby: string;
  formModified: string;
  modifiedby: string;

  tenant: string;
  uid: string;

  pur_cd: string;
  cont_no: string;
  cont_conts: string;
  mony_unit: string;
  std_rate: number;
  cust_nm: string;


  purDetailList: PurContItemVO[];
}

export interface PurContItemVO {

  uid: string;

  cont_no: string;
  min_ord_qty: number;
  ord_unit: string;
  ord_pr: number;
  lead_time: number;
  inp_limit_rate: number;
  pur_item_no: string;
  chk_tar_yn: string;
  std_pur_vat_rate: number;
  tax_yn: string;
  vat_rate: number;
}

export interface PtrnContVO {
  cont_end_yn: string;
  ptrn_vat: number;

  tenant: string;
  uid: string;

  ptrn_cd: string;
  cust_nm: string;
  cont_no: string;
  out_cost: number;
  rtn_cost: number;
  keep_fee: number;
  maint_cost: number;
  oper_fee: number;
  resale_cost: number;
  out_rate: number;
  rtn_rate: number;
  keep_rate: number;
  maint_rate: number;
  oper_fee_rate: number;
  resale_cost_rate: number;
}

export interface CustUpVO {
  tenant: string;

  uid: string;

  createdby: string,
  modifiedby: string,

  prog_id: string,
  itemList: custVo[];
}

export interface custVo {
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
