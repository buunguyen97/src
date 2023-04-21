import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class PickStatusService {
  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/pickStatus`;

  constructor(private http: JHttpService) { }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<PickStatusVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findPickStatus`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<PickStatusVO[]>>(baseUrl, searchData).toPromise();
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



export interface PickStatusVO {
tenant: string;



uid: number;
soKey: string;
ownerSoNo: string;
preOwnerSoNo: string;
soTypecd: string;
partFlg: number;
actFlg: number;
sts: string;

companyId: number;
ownerId: number;
shipSchDate: Date;
shipDate: Date;
delivSchDate: Date;
delivDate: Date;
carrySchDate: Date;
transportPriority: number;
logisticsId: number;
warehouseId: number;
customerId: number;
shipToId: number;
shipToSub: string;
delivName: string;

countrycd: string;
zip: string;
address1: string;
address2: string;
portcd: string;
phone: string;
email: string;
fax: string;
refName: string;
allocGroupCd: string;

carrierId: number;
carrierName: string;
carrierWbNo: string;

carrierNo: string;
carrierSname: string;
otherRefNo1: string;
otherRefNo2: string;
otherRefNo3: string;

pickBatchId: number;

orderId: number;
ownerOrderNo: string;
orderTypecd: string;
custOrderNo: string;
originalPoNo: string;
rmaNo: string;
orderDate: Date;
moveId: number;
assyId: number;

remarks: string;

soDetailList: PickStatusDetailVO[];

  itemAdmin: string;
  name: string;
  shortName: string;
  locationId: number;
  locType: number;
  itemadminId: string;
  soStatus: string;
  soType: string;
  itemId: number;
  pickBatchKey: string;
  expectQty1: number;
  pickedQty1: number;
  alertFlg: number;
  tolocId: number;
  shippedQty1: number;
  pickuserId: number;

}

export interface PickStatusDetailVO {
  tenant: string;

  uid: number;
  soId: number;
  itemAdminId: number;
  itemId: number;

}

