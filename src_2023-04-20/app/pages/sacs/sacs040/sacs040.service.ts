import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class Sacs040Service {
	
  httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sacs040`
  constructor(private http: JHttpService) {}
	
	//다건조회함수
	async mainList(searchData : {}) : Promise<ApiResult<Sacs040VO[]>> {
		// 조회 Api 설정
		const baseUrl = `${this.httpUrl}/mainList`;

		try {
			// Post 방식으로 조회
			const result = await this.http.post<ApiResult<Sacs040VO[]>>(baseUrl, searchData).toPromise();
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
	
   detailList(vExptCd: string): Observable<ApiResult<Sacs040VO[]>>{
	  const baseUrl = `${this.httpUrl}/detailList`;
	
	  const data = Object.assign(
		{expt_cd : vExptCd}
	);
	console.log(JSON.stringify(data));
	return this.http.post<ApiResult<Sacs040VO[]>>(baseUrl, data);
	
	}
	
  // 중복 유효성검사
  async mainCount(data: {}): Promise<ApiResult<Sacs040VO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/mainCount`;

    try {
      // Post 방식으로 조회
      const resultCount = await this.http.post<ApiResult<Sacs040VO>>(baseUrl, data).toPromise();
      return resultCount;
    } catch {
      return {
        success: false,
        data: null,
        code: '-999',
        msg: 'Post service api error!'
      };
    }
  }
  
  // 단건 조회(수출자파트너사 등록)
  async mainInfo(data: {}): Promise<ApiResult<Sacs040VO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/mainInfo`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<Sacs040VO>>(baseUrl, data).toPromise();
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
  
  // 저장(수출자파트너사 등록)
  async mainInsert(data: {}): Promise<ApiResult<Sacs040VO>> {
    const baseUrl = `${this.httpUrl}/mainInsert`;
    try {
      const result = await this.http.post<ApiResult<Sacs040VO>>(baseUrl, data).toPromise();
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

  // 삭제(수출자파트너사 등록)
  async mainDelete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/mainDelete`;
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
	
export interface Sacs040VO {
	coll_expt_cd: string;
 	expt_cd: string;
}
