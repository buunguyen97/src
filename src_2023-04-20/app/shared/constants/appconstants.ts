/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : appconstants.ts
 * Author : jbh5310
 * Lastupdate : 2021-10-03 12:46:57
 */

import {environment} from '../../../environments/environment';

export class APPCONSTANTS {
  public static HEADER_TOKEN = 'Authorization';
  // public static TOKEN_KEY = 'jflab_wm_token';
  public static TOKEN_USER_TENANT_KEY = 'jflab_wm_user_tenant';
  public static TOKEN_USER_USERID_KEY = 'jflab_wm_user_user';
  public static TOKEN_USER_USERID_UID = 'jflab_wm_user_uid';
  // public static TOKEN_USER_REMEMBERME = 'jflab_wm_remember';
  public static TOKEN_USER_COMPANYID = 'jflab_wm_companyid';

  // public static TOKEN_ACCEPT_TOKEN = 'jflab_wm_accept_token';

  public static LANG_KO = 'ko'/*'ko-KR'*/;
  public static LANG_US = 'en'/*'en-US'*/;
  public static LANG_DEFAULT = APPCONSTANTS.LANG_KO;

  public static TEXT_LOCALE = 'locale';
  public static TEXT_TIMEZONE = 'timeZone';

  public static TEXT_PATH_SEPARATOR = ' > ';  // 페이지 경로 구분
  public static TEXT_PAGE_PATH = 'page_path';
  public static TEXT_WAREHOUSE_ID = 'warehouseId';
  public static TEXT_WAREHOUSE_VO = 'warehouseVO';
  public static TEXT_OWNER_ID = 'ownerId';
  public static TEXT_ITEMADMIN_ID = 'itemAdminId';

  // public static BASE_URL_WM = 'http://www.jflab.co.kr:9999';
  // public static BASE_URL_WM = 'http://localhost:10001';             // wms Local
  // public static BASE_URL_WM = 'http://52.141.4.64:9999';        // poc
  // public static BASE_URL_WM = 'http://www.concplay.co.kr:9999'; // wms PROD
  // public static BASE_URL_WM = 'http://192.168.0.10:50.100';
  public static BASE_URL_WM = environment.URL.WM;

  // public static BASE_URL_SL = 'http://www.concplay.co.kr:9999';        // sales PROD
  // public static BASE_URL_SL = 'http://localhost:10011';  // sales LOCAL
  public static BASE_URL_SL = environment.URL.SL;

  // public static BASE_URL_RP = 'http://www.concplay.co.kr:9080';
  public static BASE_URL_RP = environment.URL.RP;

  public static ISLOGIN = 'isLogin';
  public static SELECTED_COMPANY_ID = 'SELECTED_COMPANY_ID';
  public static SELECTED_COMPANY = 'SELECTED_COMPANY';

  public static TEXT_SYSTEM_TYPE = 'system_type';
  public static DEFAULT_SYSTEMT_TYPE = 'MM';


  public static APPLIED = 'applied_';
  public static APPLIED_UTSETTING = 'applied_utSetting';

  public static APPLIED_THEME = 'applied_theme';
  public static DEFAULT_THEME = 'light.darkblue';

  public static APPLIED_FONTSIZE = 'applied_fontsize';
  public static DEFAULT_FONTSIZE = '13';

  public static APPLIED_FONT = 'applied_font';
  public static DEFAULT_FONT = 'nanumgothic';

  public static CHANGE_PASSWORD_REQUIRED = 'changePasswordRequired';

  public static ADMIN_USER = 'ACC1000';

  // Alporter Key로 변경 2022-06-21
  // public static GOOGLE_MAP_API_KEY = 'AIzaSyDI3ChJAmSoajg3HmNQNvIoViojmg7HOTo';
  // public static NAVER_MAP_API_KEY = '0oaj1imazi';
  public static GOOGLE_MAP_API_KEY = environment.KEY.GOOGLE_MAP_API_KEY;
  public static NAVER_MAP_API_KEY = environment.KEY.NAVER_MAP_API_KEY;
}
