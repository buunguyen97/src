import {ApiResult} from '../../shared/vo/api-result';
import {APPCONSTANTS} from '../../shared/constants/appconstants';
import {JHttpService} from '../../shared/services/jhttp.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoCommonUtils {

  constructor(private http: JHttpService) {
  }

  public static STS_IDLE = '100';  // 예정
  public static STS_ACCEPTED = '200';  // 출고접수
  public static STS_ALLOCATING = '250';  // 할당중
  public static STS_ALLOCATED = '300';  // 할당완료
  public static STS_SHORT = '400';  // 재고부족
  public static STS_PICKING = '550';  // 피킹중
  public static STS_PICKED = '600';  // 피킹완료
  public static STS_SORTING = '800';  // 분류중
  public static STS_SORTED = '850';  // 분류완료
  public static STS_INSPECTING = '860';  // 출고검품중
  public static STS_INSPECTED = '870';  // 출고검품완료
  public static STS_SHIPPING = '880';  // 출고중
  public static STS_SHIPPED = '900';  // 출고완료
  public static STS_DELIVERED = '950';  // 납품완료

  public static FLAG_TRUE = 'Y';
  public static FLAG_FALSE = 'N';

  public static TYPE_STD = 'STD';
}



