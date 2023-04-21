import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class TruckService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/truck`;

  // http 객체 Injection
  constructor(
    private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<TruckVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findTruck`;
    try {
      // post 방식으로 조회
      const result = await this.http.post<ApiResult<TruckVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<TruckVO>> {
    const baseUrl = `${this.httpUrl}/saveTruck`;
    try {
      const result = await this.http.post<ApiResult<TruckVO>>(baseUrl, data).toPromise();
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

export interface TruckVO {
  uid: string;
  tenant: string;
  vehicleKey: string; // 차량번호
  country: string; // 국가번호
  carOwner: string; // 차주
  actFlg: string; // 사용여부

  vehicleType: string; // 차량유형
  ownerName: string; // 차주
  cbm: number; // CBM
  cbmAble: number; // 가용CBM
  remarks: string; // 비고

  CreateBy: string; // 작성자
  CreateDateTime: Date; // 작성일시
  CreateIp: string; // 장성자IP
  ModifiedBy: string; // 수정자
  ModifiedDateTime: Date; // 수정일시
  ModifiedIp: string; // 수정자IP

}
