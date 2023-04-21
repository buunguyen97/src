import { Injectable } from '@angular/core';
import { APPCONSTANTS } from 'src/app/shared/constants/appconstants';
import { JHttpService } from 'src/app/shared/services/jhttp.service';
import { ApiResult } from 'src/app/shared/vo/api-result';

@Injectable({
    providedIn: 'root'
})

export class Sast060Service {

httpUrl = `${APPCONSTANTS.BASE_URL_SL}/sales-service/sast060`
constructor(private http: JHttpService) { }

    //조회함수
    async mainList(searchData: {}): Promise<ApiResult<Sast060VO[]>> {
        //조회 Api 설정
        const baseUrl = `${this.httpUrl}/mainList`;
        try {
            const result = await this.http.post<ApiResult<Sast060VO[]>>(baseUrl, searchData).toPromise();
            return result;
        } catch (e) {
            return {
            success: false,
            data: null,
            code: e.code,
            msg: e.msg
            }
        }
    }
}



export interface Sast060VO {
  matYm: string;
  fromMatDt: string;
  toMatDt: string;

	}
