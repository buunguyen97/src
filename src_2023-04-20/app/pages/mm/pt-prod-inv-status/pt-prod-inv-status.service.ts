import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PtProdInvStatusService {
  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodinvstatus`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdInvStatusVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdInvStatus`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PtProdInvStatusVO[]>>(baseUrl, searchData).toPromise();
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


export interface PtProdInvStatusVO {
  tenant: string;

  uid: number;
  itemId: number;
  item: string;
  oldItemId: number;
  itemAdminId: number;
  itemName: string;
  groupItemId: number;
  spec: string;
  unit: string;
  companyId: number;

  groupOrdQty: number;

  childItemId: number;
  childItem: string;

  prodKey: string;
  workDate: Date;
  ordQty: number;
  ordQty2: number;

  routYn: string;
  ordClose: string;
  reQty: number;

  fromWorkDate: Date;
  toWorkDate: Date;
  routId: number;
  routNm: string;
  workCt: string;
  workSeq: number;
  actFlg: string;
  remarks: string;

  itemTypecd: string;

}
