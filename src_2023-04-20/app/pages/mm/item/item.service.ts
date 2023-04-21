import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/item`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<ItemVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findItem`;

    try {
      // Post 방식으로 조회
      // Warehouse는 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<ItemVO[]>>(baseUrl, searchData).toPromise();
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

  async save(data: {}): Promise<ApiResult<ItemVO>> {
    const baseUrl = `${this.httpUrl}/saveItem`;
    try {
      console.log(data);
      const result = await this.http.post<ApiResult<ItemVO>>(baseUrl, data).toPromise();

      console.log(result);
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

  async update(data: {}): Promise<ApiResult<ItemVO>> {
    const baseUrl = `${this.httpUrl}/updateItem`;
    try {
      const result = await this.http.post<ApiResult<ItemVO>>(baseUrl, data).toPromise();
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

  async delete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/deleteItem`;
    try {
      console.log(baseUrl);
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

export interface ItemVO {
  tenant: string;

  uid: number;
  itemAdminId: number;
  actFlg: string;
  item: string;
  shortName: string;
  barcode: string;
  name: string;
  itemTypecd: string;
  manuItem: string;

  invType: string;
  itemSetFlg: string;
  qtyLvcd: string;

  unit1: number;
  unit1Stylecd: string;
  length1: number;
  width1: number;
  height1: number;
  grossWeight1: number;
  netWeight1: number;
  cube1: number;
  liter1: number;

  unit2: number;
  unit2Stylecd: string;
  length2: number;
  width2: number;
  height2: number;
  grossWeight2: number;
  netWeight2: number;
  cube2: number;
  liter2: number;

  unit3: number;
  unit3Stylecd: string;
  length3: number;
  width3: number;
  height3: number;
  grossWeight3: number;
  netWeight3: number;
  cube3: number;
  liter3: number;

  p_Qty: number;
  p_Height: number;
  p_Odd: number;

  itemCategory1Id: number;
  itemCategory2Id: number;
  itemCategory3Id: number;

  type: string;
  standard: string;
  model: string;

  stringer: number;
  deck: number;
  height: number;

  remarks: string;
}

export interface LookupItemVO {
  tenant: string;
  uid: number;
  item: string;
  shortName: string;
  name: string;
  stringer: number;
  deck: number;
  display: string;
  isSerial: string;
  itemSetFlg: string;
  unit1Stylecd: string;
  unit2Stylecd: string;
  unit3Stylecd: string;
}
