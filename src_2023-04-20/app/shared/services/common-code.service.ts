/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : common-code.service.ts
 * Author : jbh5310
 * Lastupdate : 2021-03-17 11:03:04
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {JHttpService} from './jhttp.service';
import {APPCONSTANTS} from '../constants/appconstants';
import {ApiResult} from '../vo/api-result';
import {LookupCompanyVO} from '../../pages/mm/company/company.service';
import {LookupWarehouseVO} from '../../pages/mm/warehouse/warehouse.service';
import {LookupItemVO} from '../../pages/mm/item/item.service';
import {ArrangeTruckLookupVO} from '../../pages/so/arrange-truck/arrange-truck.service';
import {LookupRouteByItemVO, LookupRoutVO} from '../../pages/mm/pt-route/pt-route.service';
import {LookupLotVO, LookupProdKeyVO} from '../../pages/mm/pt-prod-rel/pt-prod-rel.service';
import {LookupItemByRouteVO} from '../../pages/mm/pt-item-route/pt-item-route.service';
import {LookupRevisionVO} from '../../pages/mm/bom-admin/bom-admin.service';
import {LookupSalesWarehouseVO} from '../../pages/inv/logical-wh-move/logical-wh-move.service';

export interface CodeProjection {
  codeCategoryId: number;
  codeCategory: string;
  name: string;

  codeId: number;
  code: string;
  codeName: string;

  etcColumn1: string;
}

// 현재 품목관리사가 없으므로 이곳에 생성

export interface LookupItemAdminVO {
  tenant: string;
  uid: number;
  itemAdmin: string;
  name: string;
  display: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommonCodeService {

  constructor(private http: JHttpService) {
  }

  getCode(tenant: string, codeCategory: string): Observable<ApiResult<CodeProjection[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/code/findCode?tenant=${tenant}&codeCategory=${codeCategory}`;
    return this.http.get<ApiResult<CodeProjection[]>>(baseUrl);
  }

  getCodeOrderByCode(tenant: string, codeCategory: string): Observable<ApiResult<CodeProjection[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/code/findCodeOrderByCode?tenant=${tenant}&codeCategory=${codeCategory}`;
    return this.http.get<ApiResult<CodeProjection[]>>(baseUrl);
  }

  // 거래처 관련
  getCompany(vTenant: string,
             vIsOwner: boolean,
             vIsCustomer: boolean,
             vIsShipTo: boolean,
             vIsSupplier: boolean,
             vIsWarehouse: boolean,
             vIsCarrier: boolean,
             vIsEtc: boolean): Observable<ApiResult<LookupCompanyVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/company/lookup`;
    const data = Object.assign(
      {tenant: vTenant},
      {isOwner: this.convertBooleanDigit(vIsOwner, 1, 0, true)},
      {isCustomer: this.convertBooleanDigit(vIsCustomer, 1, 0, true)},
      {isShipTo: this.convertBooleanDigit(vIsShipTo, 1, 0, true)},
      {isSupplier: this.convertBooleanDigit(vIsSupplier, 1, 0, true)},
      {isWarehouse: this.convertBooleanDigit(vIsWarehouse, 1, 0, true)},
      {isCarrier: this.convertBooleanDigit(vIsCarrier, 1, 0, true)},
      {isEtc: this.convertBooleanDigit(vIsEtc, 1, 0, true)}
    );
    return this.http.post<ApiResult<LookupCompanyVO[]>>(baseUrl, data);
  }

  // 거래처 관련
  getRelatedCompany(vTenant: string, uid: number): Observable<ApiResult<LookupCompanyVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/company/findRelatedCompany`;
    const data = Object.assign(
      {tenant: vTenant, uid},
    );
    return this.http.post<ApiResult<LookupCompanyVO[]>>(baseUrl, data);
  }


  // 창고관련
  getWarehouse_logistics(vTenant: string,
                         vWarehouse: string,
                         vName: string,
                         vLogisticsId: string): Observable<ApiResult<LookupWarehouseVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/warehouse/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
      {warehouse: vWarehouse},
      {name: vName},
      {logisticsId: vLogisticsId}
    );

    return this.http.post<ApiResult<LookupWarehouseVO[]>>(baseUrl, data);
  }

  getWarehouse(vTenant: string, vWarehouse: string, vName: string): Observable<ApiResult<LookupWarehouseVO[]>> {
    // const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/user-service/mm/warehouse/lookup`;
    //
    // const data = Object.assign(
    //   {tenant: vTenant},
    //   {warehouse: vWarehouse},
    //   {name: vName}
    // );
    //
    // return this.http.post<ApiResult<LookupWarehouseVO[]>>(baseUrl, data);
    return this.getWarehouse_logistics(vTenant, vWarehouse, vName, null);
  }

  /**
   *  공통 창고 Lookup 조회
   * @param vUserUid  사용자 Uid
   */
  getCommonWarehouse(vUserId: number): Observable<ApiResult<LookupWarehouseVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/warehouse/commonLookup`;

    const data = Object.assign(
      {userId: vUserId}
    );

    return this.http.post<ApiResult<LookupWarehouseVO[]>>(baseUrl, data);
  }

  /**
   *  공통 영업창고 Lookup 조회
   * @param vUserUid  사용자 Uid
   */
  getSalesWarehouse(vPtrncd ?: string): Observable<ApiResult<LookupSalesWarehouseVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/warehouse/salesWhLookup`;

    const data = Object.assign(
      {ptrn_cd: vPtrncd}
    );

    return this.http.post<ApiResult<LookupSalesWarehouseVO[]>>(baseUrl, data);
  }

  /**
   * 공통 화주 Lookup 조회
   */
  getCommonOwner(vUserId: number): Observable<ApiResult<LookupCompanyVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/company/commonLookup`;

    const data = Object.assign(
      {userId: vUserId}
    );
    return this.http.post<ApiResult<LookupCompanyVO[]>>(baseUrl, data);
  }

  /**
   * 공통 품목관리사 Lookup 조회
   */
  getCommonItemAdmin(vUserId: number): Observable<ApiResult<LookupItemAdminVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/itemAdmin/commonLookup`;

    const data = Object.assign(
      {userId: vUserId},
    );

    return this.http.post<ApiResult<LookupItemAdminVO[]>>(baseUrl, data);
  }

  // 품목관리사 - 물류회사코드
  getItemAdmin(vTenant: string, vCompanyId ?: number): Observable<ApiResult<LookupItemAdminVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/itemAdmin/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
      {companyId: vCompanyId},
    );

    return this.http.post<ApiResult<LookupItemAdminVO[]>>(baseUrl, data);
  }

  getItem(vTenant: string): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/item/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }

  getSpec(vTenant: string): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/item/lookupSpec`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }

  getRevision(vTenant: string): Observable<ApiResult<LookupRevisionVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/bomadmin/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<LookupRevisionVO[]>>(baseUrl, data);
  }

  getItemRouteRevision(vTenant: string, vItemId: number): Observable<ApiResult<LookupItemRevisionVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptitemroute/lookupItemRevision`;

    const data = Object.assign(
      {tenant: vTenant},
      {itemId: vItemId},
    );

    return this.http.post<ApiResult<LookupItemRevisionVO[]>>(baseUrl, data);
  }

  /**
   * 품목에 해당하는 revision 목록 조회
   */
  getItemRevision(vTenant: string, vItemId: number): Observable<ApiResult<LookupItemRevisionVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/bomadmin/lookupItemRevision`;

    const data = Object.assign(
      {tenant: vTenant},
      {itemId: vItemId},
    );

    return this.http.post<ApiResult<LookupItemRevisionVO[]>>(baseUrl, data);
  }

  /**
   * 품목에 해당하는 route 목록 조회
   */
  getRouteByItem(vTenant: string, vItemId: number): Observable<ApiResult<LookupRouteByItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptroute/lookupRouteByItem`;

    const data = Object.assign(
      {tenant: vTenant},
      {uid: vItemId},
    );

    return this.http.post<ApiResult<LookupRouteByItemVO[]>>(baseUrl, data);
  }

  getItemByRoute(vTenant: string): Observable<ApiResult<LookupItemByRouteVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptitemroute/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<LookupItemByRouteVO[]>>(baseUrl, data);
  }

  getCutItemByRoute(vTenant: string): Observable<ApiResult<LookupItemByRouteVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptitemroute/lookupCut`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<LookupItemByRouteVO[]>>(baseUrl, data);
  }

  getRoute(vTenant: string): Observable<ApiResult<LookupRoutVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptroute/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<LookupRoutVO[]>>(baseUrl, data);
  }

  getLotId(vTenant: string, vItemAdminId: number, vCompanyId ?: number): Observable<ApiResult<LookupLotVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodrel/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
      {itemAdminId: vItemAdminId},
      {companyId: vCompanyId}
    );

    return this.http.post<ApiResult<LookupLotVO[]>>(baseUrl, data);
  }

  getProdKey(vTenant: string): Observable<ApiResult<LookupProdKeyVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/ptprodrq/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
    );

    return this.http.post<ApiResult<LookupProdKeyVO[]>>(baseUrl, data);
  }

  getItemWithItemAdminId(vTenant: string, vItemAdminId: number): Observable<ApiResult<LookupItemVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/item/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
      {itemAdminId: vItemAdminId}
    );

    return this.http.post<ApiResult<LookupItemVO[]>>(baseUrl, data);
  }

  getItemCategory1(vTenant: string): Observable<ApiResult<LookupItemCategoryVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/itemCategory/findItemCategory1`;

    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupItemCategoryVO[]>>(baseUrl, data);
  }

  getItemCategory2(vTenant: string): Observable<ApiResult<LookupItemCategoryVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/itemCategory/findItemCategory2`;

    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupItemCategoryVO[]>>(baseUrl, data);
  }


  getItemCategory3(vTenant: string): Observable<ApiResult<LookupItemCategoryVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/itemCategory/findItemCategory3`;

    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupItemCategoryVO[]>>(baseUrl, data);
  }


  getLocationWithWarehouseId(vTenant: string, vWarehouseId: string): Observable<ApiResult<LookupLocationVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/location/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
      {warehouseId: vWarehouseId}
    );

    return this.http.post<ApiResult<LookupLocationVO[]>>(baseUrl, data);
  }

  getLocation(vTenant: any, vWarehouseUid: number): Observable<ApiResult<LookupLocationVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/location/lookup`;

    const data = Object.assign(
      {tenant: vTenant},
      {warehouseId: vWarehouseUid}
    );

    return this.http.post<ApiResult<LookupLocationVO[]>>(baseUrl, data);
  }

  // 사용자
  getUser(vTenant: string): Observable<ApiResult<LookupUserVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/user/lookup`;

    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<LookupUserVO[]>>(baseUrl, data);
  }

  // 소속회사의 사용자
  getUserByCompany(vTenant: string, vCompanyId: number): Observable<ApiResult<LookupUserVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/user/getUserByCompany`;

    const data = Object.assign(
      {tenant: vTenant},
      {companyId: vCompanyId}
    );

    return this.http.post<ApiResult<LookupUserVO[]>>(baseUrl, data);
  }

  // 사용자
  getMenuTabList(tenant: string, userId: number): Observable<ApiResult<CodeProjection[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/code/findTabList?tenant=${tenant}&userId=${userId}`;
    return this.http.get<ApiResult<CodeProjection[]>>(baseUrl);
  }

  // 권한에 따른 메뉴 탭 목록 조회
  getVehicle(vTenant: string): Observable<ApiResult<ArrangeTruckLookupVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/release-service/arrangetruck/lookup`;

    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<ArrangeTruckLookupVO[]>>(baseUrl, data);
  }

  // 부서 조회
  getDept(vTenant: string): Observable<ApiResult<DeptVO[]>> {
    const baseUrl = `${APPCONSTANTS.BASE_URL_WM}/master-service/user/lookupDept`;

    const data = Object.assign(
      {tenant: vTenant}
    );

    return this.http.post<ApiResult<DeptVO[]>>(baseUrl, data);
  }


  /**
   * Boolean TO Digit
   */
  convertBooleanDigit(value: any, trueValue: any, falseValue: any, useNullValue: boolean): any {
    if ((useNullValue === true) && ((value === undefined) || (value === null))) {
      return null;
    }

    return value === true ? trueValue : falseValue;
  }
}

export interface LookupLocationVO {
  tenant: string;
  uid: number;

  location: string;
  name: string;

  locGroup: number;
  locType: number;
  slotType: number;
  pickType: number;

  warehouseId: number;
  itemAdminId: number;
  itemId: number;
  ownerId: number;

  display: string;
}

export interface LookupUserVO {
  tenant: string;
  uid: number;
  usr: string;
  name: string;
  shortName: string;
  companyId: number;
}

export interface LookupItemCategoryVO {
  tenant: string;
  uid: number;

  name: string;
  priorities: number;

  itemCategory1Id: number;
  itemCategory2Id: number;
}


/**
 * 품목에 해당하는 revision 목록 조회
 */
export interface LookupItemRevisionVO {
  tenant: string;
  uid: number;
  itemId: number;
  childItemId: number;
  revision: number;
  childRevision: number;
}

export interface DeptVO {
  tenant: string;
  uid: number;
  dept_id: string;
  actFlg: string;
  dept_nm: string;
  use_yn: string;
  ptrn_cd: string;

}
