/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : company.service.ts
 * Author : jbh5310
 * Lastupdate : 2021-10-21 11:07:35
 */

import { Injectable } from '@angular/core';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {JHttpService} from '../../../shared/services/jhttp.service';
import {ApiResult} from '../../../shared/vo/api-result';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  // 기본 URL 선언
  httpUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/location`;
  // http 객체 Injection
  constructor(private http: JHttpService) { }

  // 조회함수
  async get(searchData: {}): Promise<ApiResult<LocationVO[]>> {
    // 조회 Api 설정
    const baseUrl = `${this.httpUrl}/findLocation`;
    // return this.http.get<ApiResult<LocationService[]>>(baseUrl);
    try {
      // Post 방식으로 조회
      // Location은 Interface 형식으로 Service 하단에 구현하며, BackEnd의 VO와 형식을 맞춤.
      const result = await this.http.post<ApiResult<LocationVO[]>>(baseUrl, searchData).toPromise();
      console.log(result);
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

  // 팝업조회 함수
  async getPopup(data: {}): Promise<ApiResult<LocationVO>> {
    // Api 설정
    const baseUrl = `${this.httpUrl}/findLocationFull`;

    try {
      // Post 방식으로 조회
      const result = await this.http.post<ApiResult<LocationVO>>(baseUrl, data).toPromise();
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
  async save(data: {}): Promise<ApiResult<LocationVO>> {
    const baseUrl = `${this.httpUrl}/saveLocation`;
    try {
      const result = await this.http.post<ApiResult<LocationVO>>(baseUrl, data).toPromise();
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
  // 변경함수
  async update(data: {}): Promise<ApiResult<LocationVO>> {
    const baseUrl = `${this.httpUrl}/updateLocation`;
    try {
      const result = await this.http.post<ApiResult<LocationVO>>(baseUrl, data).toPromise();
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
  // 삭제함수
  async delete(data: {}): Promise<ApiResult<void>> {
    const baseUrl = `${this.httpUrl}/deleteLocation`;
    try {
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
}
// BackEnd의 VO와 맞춤
export interface LocationVO {
  tenant: string;
  uid: number;
  location: string;
  warehouseId: number;
  locGroup: string;
  name: string;
  actFlg: string;
  virtualFlg: string;
  restrictedAlloc: string;
  locType: string;
  slotType: string;
  pickType: string;
  buil: number;
  floor: number;
  zone: number;
  line: number;
  range: number;
  step: number;
  lane: number;
  width: number;
  height: number;
  length: number;
  weightCapacity: number;
  capacity: number;
  palleteCapacity: number;
  rootInSeq: number;
  rootOutSeq: number;
  oneOwnerOnlyFlg: string;
  companyId: number;
  oneItemOnlyFlg: string;
  itemAdminId: number;
  itemId: number;
  abcTypecd: string;
  emptyFlg: string;
  sameLotFlg: string;
  damageFlg: string;
  fullpalletFlg: string;
  lastInventoryDate: Date;
}
