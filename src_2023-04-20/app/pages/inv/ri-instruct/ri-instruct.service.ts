import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class RiInstructService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/riInstruct`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<RiInstructVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRiInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RiInstructVO[]>>(baseUrl, searchData).toPromise();
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

  // 로케이션 이동지시
  async executeInstruct(searchData: {}): Promise<ApiResult<RiInstructExcuteVO>> {
    // console.log(searchData);
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/createMoveInstruct`;
    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RiInstructExcuteVO>>(baseUrl, searchData).toPromise();
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

export interface RiInstructVO {
  tenant: string;
  uid: number;

  logicalKey: string;
  relocateBatchKey: string;

  locGroup: string;
  location: string;
  locationId: number;
  locId: number;
  itemId: number;
  item: string;

  warehouseId: number;
  warehouse: string;
  totalItemCnt: number;
  totalInstructedQty1: number;
  totalAllocatedQty1: number;
  totalQty1: number;
  totalAbleQty1: number;
  qty1: number;
  ownerId: number;
  owner: string;
  itemAdmin: string;
  itemAdminId: number;
  whInDate: Date;


  CreateBy: string;
  CreateDateTime: Date;
  ModifiedBy: string;
  ModifiedDateTime: Date;
  relocateGroup: string;
  relocateKey: string;

  remarks: string;

}

export interface RiInstructExcuteVO {
  tenant: string;
  relocateGroup: string;
  remarks: string;
  relocateBatchKey: string;

  excuteList: RiInstructVO[];
}
