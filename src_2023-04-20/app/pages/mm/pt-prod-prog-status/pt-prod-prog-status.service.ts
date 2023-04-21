import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {PtProdInvStatusVO} from '../pt-prod-inv-status/pt-prod-inv-status.service';

@Injectable({
  providedIn: 'root'
})
export class PtProdProgStatusService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptProdProgStatus`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  async get(searchData: {}): Promise<ApiResult<PtProdInvStatusVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findPtProdProgStatusList`;
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

export interface PtProdProgStatusVO {
  tenant: string;

  uid: number;
  itemId: number;        // 품목
  item: string;
  childItemId: number;   // 자품목
  prodKey: string;       // 지시번호
  routId: number;        // 공정코드
  workSeq: number;       // 작업순서
  workDate: Date;        // 지시일자
  ordQty: number;        // 지시수량
  prodQty: number;       // 실적수량
  nonQty: number;        // 불량수량
  routYn: string;        // 생산지시
  ordClose: string;      // 지시마감
  actFlg: string;        // 사용여부
  remAmt: number;        // 잔량

  // 발생일자 from to
  fromWorkDate: string;
  toWorkDate: string;

  prodDate: Date;
}
