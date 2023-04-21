import {Injectable} from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';
import {MatAdjustVO, MatBomVO} from '../matinstruct/matinstruct.service';

@Injectable({
  providedIn: 'root'
})
export class MatconfirmedService {
  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/inventory-service/matConfirmed`;

  // http 객체 Injection
  constructor(private http: JHttpService) {
  }

  // 조회함수
  async getBom(searchData: {}): Promise<ApiResult<MatBomVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findBomDetail`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatBomVO[]>>(baseUrl, searchData).toPromise();
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

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<MatAdjustVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMatInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatAdjustVO[]>>(baseUrl, searchData).toPromise();
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

  async getDetail(data: {}): Promise<ApiResult<MatAdjustVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMatInstructFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatAdjustVO>>(baseUrl, data).toPromise();
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

  async save(data: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveMatInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

  async update(data: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/updateMatInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

  async delete(data: {}): Promise<ApiResult<void>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/deleteMatInstruct`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<void>>(baseUrl, data).toPromise();
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

  async proc(data: {}): Promise<ApiResult<number[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/procMatConfirmed`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<number[]>>(baseUrl, data).toPromise();
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

  async reProc(data: {}): Promise<ApiResult<number[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/procReMatConfirmed`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<number[]>>(baseUrl, data).toPromise();
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

  async getDetailConfirmed(data: {}): Promise<ApiResult<MatAdjustVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findMatConfirmedFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<MatAdjustVO>>(baseUrl, data).toPromise();
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

  async findItemDetail(data: {}): Promise<ApiResult<any>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findItemDetail`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<any>>(baseUrl, data).toPromise();
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

  async getDamageReason(data: {}): Promise<ApiResult<DamageReasonVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findDamageReason`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<DamageReasonVO[]>>(baseUrl, data).toPromise();
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

  async saveDamageReason(data: {}): Promise<ApiResult<DamageReasonVO[]>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/saveDamageReason`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<DamageReasonVO[]>>(baseUrl, data).toPromise();
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

export interface MatConfirmedVO {
  uid: number;
  tenant: string;
  reFlg: string;

  matConfirmedDetailList: any;
}

export interface MatConfirmedDetailVO {
  uid: number;
  invId: number;
  isProduct: string;
  expectQty1: number;
  expectQty2: number;
  adjustQty1: number;
  bomQty: number;
  otherRefNo1: string;
}

export interface DamageReasonVO {
  uid: number;
  adjustDetailId: number;
  reason: string;
  qty: number;
  remarks: string;
}
