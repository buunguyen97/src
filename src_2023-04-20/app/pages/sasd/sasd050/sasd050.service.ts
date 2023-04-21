import {Injectable} from '@angular/core';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {JHttpService} from 'src/app/shared/services/jhttp.service';
import {ApiResult} from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sasd050Service {

  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sasd050`

  constructor(private http: JHttpService,
              private utilService: CommonUtilService) {
  }

  // 다건조회함수
  async main_list(searchData: {}): Promise<ApiResult<CustVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/main_list`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<CustVO[]>>(baseUrl, searchData).toPromise();
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

  // 단건조회함수
  async mainInfo(data: {}): Promise<ApiResult<any>> {
    // 조회 Api
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {

      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();

      result.data.expt_yn = result.data.expt_yn === 1 ? true : false;
      result.data.impt_yn = result.data.impt_yn === 1 ? true : false;
      // Post 방식으로 조회

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
  async mainCfm(data: {}): Promise<ApiResult<CustMstVO>> {
    const baseUrl = `${this.httpUrl}/mainCfm`;
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

  // 수정함수
  async mainSsp(data: {}): Promise<ApiResult<CustMstVO>> {
    const baseUrl = `${this.httpUrl}/mainSsp`;
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

}


export interface CustVO {
  tenant: string;
  uid: number;

  cust_nm: string;    // 거래처명
}

export interface CustMstVO {

  tenant: string;

  cust_cd: string;      // 거래처코드
  cust_nm: string;      // 거래처명
  boss_nm: string;      // 대표자명
  biz_no: string;       // 사업자번호
  zip_no: string;       // 우편번호
  biz_adr1: string;     // 사업장주소1
  biz_adr2: string;     // 사업장주소2
  eng_biz_adr1: string; // 영문사업장주소1
  eng_biz_adr2: string; // 영문사업장주소2
  biz_type: string;     // 업종
  biz_cond: string;     // 업태
  country: string;      // 국가코드
  tel_no: string;       // 전화번호
  fax_no: string;       // 팩스번호
  chg_nm: string;       // 담당자명
  chg_tel_no: string;   // 담당자연락처
  chg_email: string;        // 담당자이메일
  /*cal_yn : string;        // 정산여부
  loan_amt : number;        //여신금액*/
  ptrn_yn: boolean;     // 파트너사여부
  expt_yn: boolean;     // 수출사여부
  impt_yn: boolean;     // 수입사여부
  use_yn: string;       // 사용여부
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
  logical_file_nm1: any;
  logical_file_nm2: any;
  logical_file_nm3: any;
  logical_file_nm4: any;
  logical_file_nm5: any;

  phy_file_nm1: any;
  phy_file_nm2: any;
  phy_file_nm3: any;
  phy_file_nm4: any;
  phy_file_nm5: any;

  sa_chg_id: string;
  wh_countrycd: string;

  uid: number;
  name: string;
  companyid: number;
  p_cust_cd: string;

  file: object;

  review_comments: string;
  approval: string;

  fromEstDt: string;
  toEstDt: string;
}
