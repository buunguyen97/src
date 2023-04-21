import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class BomAdminService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/bomadmin`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<BomAdminDetailVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findBomAdmin`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<BomAdminDetailVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수(디테일포함)
  async getFull(searchData: {}): Promise<ApiResult<BomAdminVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findBomAdminFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<BomAdminVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<BomAdminVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/saveBomAdmin`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<BomAdminVO>>(baseUrl, data).toPromise();
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

  async uploadFile(data: {}): Promise<ApiResult<BomAdminVO>> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/azureStorage/uploadFile`;
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

  async update(data: {}): Promise<ApiResult<BomAdminVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/updateBomAdmin`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<BomAdminVO>>(baseUrl, data).toPromise();
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

  async updateFile(data: {}): Promise<ApiResult<BomAdminVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/updateFile`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<BomAdminVO>>(baseUrl, data).toPromise();
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

  async deleteFileDb(data: BomAdminVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deleteFile`;

    try {
      // Post 방식으로 조회
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

  async deleteFile(data: BomAdminVO): Promise<ApiResult<void>> {
    // 조회 Api 설정

    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/azureStorage/deleteFile?fileName=${data.logFileNm}`;
    console.log(baseUrl);
    try {
      // Post 방식으로 조회
      const result = await this.http.get<ApiResult<void>>(baseUrl).toPromise();
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

  async delete(data: BomAdminVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deleteBomAdmin`;

    try {
      // Post 방식으로 조회
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

  async findRevision(searchData: {}): Promise<ApiResult<LookupRevisionVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findRevision`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LookupRevisionVO>>(baseUrl, searchData).toPromise();
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

  async findFileNm(searchData: {}): Promise<ApiResult<BomAdminDetailVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findFileNm`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<BomAdminDetailVO>>(baseUrl, searchData).toPromise();
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


export interface BomAdminVO {
  tenant: string;

  uid: number;
  itemAdminId: number;
  itemId: number;
  lossRate: number;
  revision: number;
  childRevision: number;
  path: string;
  operType: string;

  logFileNm: string;
  phyFileNm: string;
  origFileNm: string;
  file_id: number;
  file: object;
  actFlg: string;

  display: string;

  bomAdminDetailList: BomAdminDetailVO[];
}

export interface BomAdminDetailVO {
  tenant: string;

  uid: number;
  itemId: number;
  childItemId: number;
  childItem: string;
  childItemName: string;
  revision: number;
  childRevision: number;

  lossRate: number;
  spec: string;
  unit: string;
  reQty: number;
  tailYn: string;
  actFlg: string;
  remarks: string;
  level: string;
  path: string;
  lengthYn: string;

  logFileNm: string;
  phyFileNm: string;

  childPhyFileNm: string;
  childLogFileNm: string;

  operType: string;

  display: string;

}


export interface LookupRevisionVO {
  tenant: string;

  uid: number;
  itemId: number;
  childItemId: number;
  childItem: string;
  childItemName: string;
  revision: number;
  childRevision: number;
}

