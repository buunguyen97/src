import {ApiResult} from '../../shared/vo/api-result';
import {RcvSerialVO} from './rcvcomplete/rcvcomplete.service';
import {APPCONSTANTS} from '../../shared/constants/appconstants';
import {JHttpService} from '../../shared/services/jhttp.service';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RcvCommonUtils {

  constructor(private http: JHttpService) {
  }

  public static STS_REJECTED = '100';  // 불합격
  public static STS_IDLE = '200';  // 예정
  public static STS_ACCEPTED = '300';  // 접수확정
  public static STS_INSPECTING = '320';  // 검품중
  public static STS_INSPECTED = '340';  // 검품완료
  public static STS_INSTRUCTING = '350';  // 지시중
  public static STS_INSTRUCTED = '400';  // 지시완료
  public static STS_RECEIVING = '500';  // 입고중
  public static STS_RECEIVED = '600';  // 입고완료
  public static STS_COMPLETED = '900';  // 입고전표완료

  public static FLAG_TRUE = 'Y';
  public static FLAG_FALSE = 'N';

  public static TYPE_STD = 'STD';


  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/receive-service/rcv/rcv`;

  /**
   *  태그시리얼
   */
  async getTag(data: {}): Promise<ApiResult<RcvSerialVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findRcvSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvSerialVO[]>>(baseUrl, data).toPromise();
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

  async saveTag(data: any[]): Promise<ApiResult<RcvSerialVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveRcvSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvSerialVO>>(baseUrl, data).toPromise();
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

  async deleteTag(data): Promise<ApiResult<RcvSerialVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteRcvSerial`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<RcvSerialVO>>(baseUrl, data).toPromise();
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

  // return today yyyy-MM-dd
  getToday(): string {
    const today = new Date();
    const seperator = '-';
    const yyyy = today.getFullYear();
    const MM = (today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
    const dd = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();

    return yyyy + seperator + MM + seperator + dd;
  }

}

