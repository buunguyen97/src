import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class InOutTranHistoryService {
// 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/inOutTranHistory`;

// http 객체 Injection
  constructor(private http: JHttpService) {
  }

// 조회함수
  async get(searchData: {}): Promise<ApiResult<InOutTranHistoryVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findInOutTranHistory`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<InOutTranHistoryVO[]>>(baseUrl, searchData).toPromise();
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

  async getPopup(data: {}): Promise<ApiResult<any[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findInOutTranHistoryFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any[]>>(baseUrl, data).toPromise();
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
}


export interface InOutTranHistoryVO {
  tenant: string;
  uid: number;
  relocateId: number;

  logicalKey: string;

  itemId: number;
  item: string;
  spec: string;

  warehouseId: number;
  warehouse: string;

  fromActualDate: string;
  toActualDate: string;

  qty1: number;
  qty1Allocated: number;
  qty1Instructed: number;
  qty1Expect: number;

  ownerId: number;
  owner: string;
  itemAdmin: string;
  itemAdminId: number;
  damageFlg: string;
  relocateBatchKey: string;

  warehouseName: string;
  ownerName: string;
  itemName: string;
  itemAdminName: string;

  lot1: string;
  lot2: string;
  lot3: string;
  lot4: string;
  lot5: string;
  lot6: string;
  lot7: string;
  lot8: string;
  lot9: string;
  lot10: string;

  noShippingFlg: boolean;
  foreignCargoFlg: boolean;
  customsReleaseFlg: boolean;
  taxFlg: boolean;
  whInDate: Date;
  mngDate: Date;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

  InOutHistoryDetailList: InOutTranHistoryDetailVO[];

}


export interface InOutTranHistoryDetailVO {
  tenant: string;
  uid: number;

  lotKey: string;
  actualDate: Date;
  key: string;
  lineNo: number;
  shipSupId: string;
  shipSupName: string;
  companyId: number;
  qty1: number;
  inOutType: string;
  inventoryType: string;

  lot1: string;
  lot2: string;
  lot3: string;
  lot4: string;
  lot5: string;
  lot6: string;
  lot7: string;
  lot8: string;
  lot9: string;
  lot10: string;
  damageFlg: string;
  noShippingFlg: boolean;
  foreignCargoFlg: boolean;
  customsReleaseFlg: boolean;
  taxFlg: boolean;
  whInDate: Date;
  mngDate: Date;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;

}

