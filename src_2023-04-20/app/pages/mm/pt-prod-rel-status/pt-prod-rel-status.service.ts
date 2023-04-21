import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtProdRelStatusService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodrelstatus`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdRelStatusVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdRelStatus`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdRelStatusVO[]>>(baseUrl, searchData).toPromise();
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


export interface PtProdRelStatusVO {
  tenant: string;
  uid: number;
  itemAdminId: number;
  itemId: number;
  childItemId: number;
  childItemName: string;
  revision: number;
  childRevision: number;
  fromWorkDate: Date;
  toWorkDate: Date;

  level: string;
  path: string;
  display: string;

}
