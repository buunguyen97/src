import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtItemRouteService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptitemroute`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtItemRouteVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtItemRoute`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtItemRouteVO[]>>(baseUrl, searchData).toPromise();
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
  async getFull(searchData: {}): Promise<ApiResult<PtItemRouteVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtItemRouteFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtItemRouteVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<PtItemRouteVO>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/savePtItemRoute`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtItemRouteVO>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<PtItemRouteVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updatePtItemRoute`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtItemRouteVO>>(baseUrl, data).toPromise();
      return result;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }


  async delete(data: PtItemRouteVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deletePtItemRoute`;

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

  async uploadFile(data: {}): Promise<ApiResult<PtItemRouteVO>> {
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
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async uploadDetailFile(data: {}): Promise<ApiResult<PtItemRouteVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/uploadDetailFile`;
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
    } catch (e) {
      return {
        success: false,
        data: null,
        code: e.code,
        msg: e.msg
      };
    }
  }

  async deleteFileDb(data: PtItemRouteVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deleteFileDb`;

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

  async deleteFile(data: PtItemRouteVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/azureStorage/deleteFile?fileName=${data.logFileNm}`;

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

  async deleteFileDb2(data: PtItemRouteVO): Promise<ApiResult<void>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/deleteFileDb2`;

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
}

export interface PtItemRouteVO {
  tenant: string;

  uid: number;
  itemId: number;
  item: string;
  rout: string;
  routId: number;
  revision: number;
  childRevision: number;
  itemAdminId: number;
  itemName: string;
  spec: string;
  unit: string;

  phyFileNm: string;
  logFileNm: string;
  file: object;

  // routId: number;
  // routNm: string;
  // workCt: string;
  // workSeq: number;
  lossRate: number;
  // actFlg: string;

  ptItemRouteDetailList: PtItemRouteDetailVO[];

}


export interface PtItemRouteDetailVO {
  tenant: string;

  uid: number;
  itemId: number;
  item: string;
  itemAdminId: number;

  itemName: string;
  spec: string;
  unit: string;
  revision: number;

  itemRouteId: number;
  routId: number;
  routNm: string;
  workCt: string;
  workSeq: number;
  lossRate: number;
  actFlg: string;

  phyFileNm: string;
  logFileNm: string;
}

export interface LookupItemByRouteVO {
  tenant: string;

  uid: number;
  itemId: number;
  item: string;
  itemAdminId: number;

  itemName: string;
  spec: string;
  unit: string;
}
