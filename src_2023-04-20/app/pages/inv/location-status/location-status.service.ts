import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';


@Injectable({
  providedIn: 'root'
})
export class LocationStatusService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/locationStatus`;

  constructor(private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<LocationStatusVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findLocationStatus`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LocationStatusVO[]>>(baseUrl, searchData).toPromise();
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


export interface LocationStatusVO {
  tenant: string;

  uid: number;
  itemAdmin: string;
  actFlg: string;
  name: string;
  shortName: string;
  locationId: number;
  locType: string;
  itemadminId: string;
  soKey: string;
  soStatus: string;
  soType: string;
  shipDate: number;
  shipSchDate: number;
  companyId: number;
  shipToId: number;
  itemId: number;
  pickBatchKey: string;
  expectQty1: number;
  pickedQty1: number;
  alertFlg: number;
  tolocId: number;
  shippedQty1: number;
  pickuserId: number;


  warehouseId: number;
  location: string;
  locGroup: string;
  buil: number;
  floor: number;
  zone: number;
  line: number;
  range: number;
  step: number;
  lane: number;

  damageFlg: string;
  qty1: number;
  weightCapacity: number;
  useWeightCapacity: number;
  capacity: number;
  useCapacity: number;

  createdBy: string;
  createdDatetime: Date;
  createdIp: string;
  modifiedBy: string;
  modifiedDatetime: Date;
  modifiedIp: string;
}
