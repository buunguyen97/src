import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class MfmessageService {

  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/mfmessage`;

  // http 객체 Injection
  constructor(
    private http: JHttpService) {
  }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<MessageVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findMessage`;
    try {
      // Post 방식으로 조회
      // Company는 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<MessageVO[]>>(baseUrl, searchData).toPromise();
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

  // 저장함수
  async save(data: {}): Promise<ApiResult<MessageVO>> {
    const baseUrl = `${this.httpUrl}/saveMessage`;
    try {
      const result = await this.http.post<ApiResult<MessageVO>>(baseUrl, data).toPromise();
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

  // 변경함수
  async update(data: {}): Promise<ApiResult<MessageVO>> {
    const baseUrl = `${this.httpUrl}/updateMessage`;
    try {
      const result = await this.http.post<ApiResult<MessageVO>>(baseUrl, data).toPromise();
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

  // 삭제함수
  async delete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/deleteMessage`;
    try {
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

export interface MessageVO {
  tenant: string;
  uid: number;

  messageKey: string;           // 메세지코드
  ko: string;      // 한국어
  en: string;      // 영어
  cn: string;      // 중국어
  jp: string;      // 일본어
  etc1: string;
  etc2: string;
  remarks: string; // 비고
}
