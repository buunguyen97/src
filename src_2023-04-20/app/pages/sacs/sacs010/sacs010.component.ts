import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxFileUploaderComponent,
  DxFormComponent,
  DxPopupComponent,
  DxTabPanelComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {CustContVO, CustMstVO, CustUpVO, PtrnContVO, PurContVO, Sacs010Service} from './sacs010.service';
import * as XLSX from 'xlsx';
import {v4 as uuidv4} from 'uuid';
import {ReportMngService, ReportMngVO} from '../../mm/report-mng/report-mng.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-sacs010',
  templateUrl: './sacs010.component.html',
  styleUrls: ['./sacs010.component.scss']
})
export class Sacs010Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sacs010Service,
              private reportService: ReportMngService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              public bizService: BizCodeService) {
    this.G_TENANT = this.utilService.getTenant();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);

    this.purSaveClick = this.purSaveClick.bind(this);
    this.purCancelClick = this.purCancelClick.bind(this);
    this.purDeleteClick = this.purDeleteClick.bind(this);

    this.ptrnSaveClick = this.ptrnSaveClick.bind(this);
    this.ptrnCancelClick = this.ptrnCancelClick.bind(this);
    this.ptrnDeleteClick = this.ptrnDeleteClick.bind(this);

    this.bomPopupSaveClick = this.bomPopupSaveClick.bind(this);
    this.bomPopupCancelClick = this.bomPopupCancelClick.bind(this);

    this.allowEditing = this.allowEditing.bind(this);
    this.onChangedCountry = this.onChangedCountry.bind(this);
    this.onChangedWhCountry = this.onChangedWhCountry.bind(this);
    this.onLwhChanged = this.onLwhChanged.bind(this);
    this.onLwhChanged2 = this.onLwhChanged2.bind(this);

    this.onCustUpCancelClick = this.onCustUpCancelClick.bind(this);
    this.onCustUpSaveClick = this.onCustUpSaveClick.bind(this);

    this.onGbChanged = this.onGbChanged.bind(this);
    this.onCopy = this.onCopy.bind(this);
    this.onUploaded = this.onUploaded.bind(this);

    this.deleteClickBom = this.deleteClickBom.bind(this);
    this.onPtrnAddRow = this.onPtrnAddRow.bind(this);
    this.onPtrnDeleteRow = this.onPtrnDeleteRow.bind(this);
    this.onPopupAfterOpenPtrn = this.onPopupAfterOpenPtrn.bind(this);
  }

  // 메인 화면
  @ViewChild('searchForm', {static: false}) searchForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('exptGrid', {static: false}) exptGrid: DxDataGridComponent;
  @ViewChild('purGrid', {static: false}) purGrid: DxDataGridComponent;
  @ViewChild('ptrnGrid', {static: false}) ptrnGrid: DxDataGridComponent;
  @ViewChild('exptAddBtn', {static: false}) exptAddBtn: DxButtonComponent;
  @ViewChild('elecContBtn', {static: false}) elecContBtn: DxButtonComponent;
  @ViewChild('purAddBtn', {static: false}) purAddBtn: DxButtonComponent;
  @ViewChild('ptrnAddBtn', {static: false}) ptrnAddBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // 거래처 팝업
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('bizCheckBtn', {static: false}) bizCheckBtn: DxButtonComponent;
  @ViewChild('address', {static: false}) address: DxButtonComponent;
  @ViewChild('whAddress', {static: false}) whAddress: DxButtonComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('fileDownBtn', {static: false}) fileDownBtn: DxButtonComponent;
  @ViewChild('fileDtlBtn', {static: false}) fileDtlBtn: DxButtonComponent;
  @ViewChild('fileUploader2', {static: false}) fileUploader2: DxFileUploaderComponent;
  @ViewChild('fileUploader3', {static: false}) fileUploader3: DxFileUploaderComponent;
  @ViewChild('fileUploader4', {static: false}) fileUploader4: DxFileUploaderComponent;
  @ViewChild('fileUploader5', {static: false}) fileUploader5: DxFileUploaderComponent;

  // 수출사 팝업
  @ViewChild('popupExpt', {static: false}) popupExpt: DxPopupComponent;
  @ViewChild('popupFormExpt', {static: false}) popupFormExpt: DxFormComponent;
  @ViewChild('impt_cd', {static: false}) impt_cd: DxFormComponent;
  @ViewChild('deleteBtnExpt', {static: false}) deleteBtnExpt: DxButtonComponent;
  @ViewChild('saveBtnExpt', {static: false}) saveBtnExpt: DxButtonComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  // 매입처 팝업
  @ViewChild('popupPur', {static: false}) popupPur: DxPopupComponent;
  @ViewChild('popupFormPur', {static: false}) popupFormPur: DxFormComponent;
  @ViewChild('deleteBtnPur', {static: false}) deleteBtnPur: DxButtonComponent;
  @ViewChild('saveBtnPur', {static: false}) saveBtnPur: DxButtonComponent;
  @ViewChild('popupPurGrid', {static: false}) popupPurGrid: DxDataGridComponent;

  // 파트너사 팝업
  @ViewChild('popupPtrn', {static: false}) popupPtrn: DxPopupComponent;
  @ViewChild('popupFormPtrn', {static: false}) popupFormPtrn: DxFormComponent;
  @ViewChild('deleteBtnPtrn', {static: false}) deleteBtnPtrn: DxButtonComponent;
  @ViewChild('saveBtnPtrn', {static: false}) saveBtnPtrn: DxButtonComponent;
  @ViewChild('popupPtrnGrid', {static: false}) popupPtrnGrid: DxDataGridComponent;

  // 거래처정보 팝업
  @ViewChild('popupCustInfo', {static: false}) popupCustInfo: DxFormComponent;

  @ViewChild('bomPopup', {static: false}) bomPopup: DxPopupComponent;
  @ViewChild('bomPopupForm', {static: false}) bomPopupForm: DxFormComponent;
  @ViewChild('bomPopupGrid', {static: false}) bomPopupGrid: DxDataGridComponent;

  @ViewChild('copyBtn', {static: false}) copyBtn: DxButtonComponent;
  @ViewChild('tab', {static: false}) tab: DxTabPanelComponent;


  // Global
  G_TENANT: any;
  vTENANT: any;
  rowData: any;
  sessionUid: any;
  contGb: any;

  bossPattern: any = /^[a-zA-Z\s]+$/;

  // Form
  searchFormData = {};

  // Grid
  dataSource: DataSource;
  dataSourceExpt: DataSource;
  dataSourcePur: DataSource;
  dataSourcePtrn: DataSource;

  entityStore: ArrayStore;
  entityStoreExpt: ArrayStore;
  entityStorePur: ArrayStore;
  entityStorePtrn: ArrayStore;

  custUpDataSource: DataSource;
  custUpEntityStore: ArrayStore;

  selectedRows: number[];
  key = 'cust_cd';
  data: CustMstVO;
  addFlg = false;
  mainCount: any;
  detailCount: any;
  detailCount2: any;
  purCount: any;
  ptrnCount: any;
  CustUpFormData: any;

  // Popup
  popupVisibleExpt = false;
  popupVisiblePur = false;
  popupVisiblePtrn = false;
  custUploadPopupVisible = false;

  // Column Visible
  rent_visible = true;

  popupMode = 'Add';
  popupModeExpt = 'Add';
  popupModePur = 'Add';
  popupModePtrn = 'Add';

  popupFormData: CustMstVO;
  popupFormDataExpt: CustContVO;
  popupFormDataPur: PurContVO;
  popupFormDataPtrn: PtrnContVO;
  custUpSaveData: CustUpVO;

  firstPopupData = '';

  bizNoCnt: any;
  dunsNoCnt: any;
  mBizNoCnt: any;
  sign_stat: any;

  chkChanges = [];

  // PopupFileUpload
  phyFileNm: any;
  logFileNm: any;

  fileIdchk: any;
  fileId: any;

  // PopupMap
  autocomplete: any;
  autocomplete2: any;
  autpCompleteAddressFlg = false;
  autpCompleteAddressFlg2 = false;
  whInfoFlg = true;
  sLInfoFlg = false;

  isCheckedFlg = true;

  selectedAddress1 = '';
  selectedAddress2 = '';
  options = {
    componentRestrictions: {country: ''},
    fields: ['address_components', 'geometry', 'name'],
    strictBounds: false,
    types: ['geocode', 'establishment']
  };

  // PopupGrid
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  popupDataSourcePur: DataSource;
  popupEntityStorePur: ArrayStore;

  saChgdataSource: DataSource;
  saChgEntityStore: ArrayStore;


  popupDataSourcePtrn: DataSource;
  popupEntityStorePtrn: ArrayStore;

  // PopupChanges
  changes = [];

  // dataSet
  dsCountry = [];      // 국가
  dsBizGb = [];      // 사업자구분
  dsSex = [];      // 성별
  dsCont = [];      // 계약담당사
  dsPtrn = [];      // 물류파트너사
  dsAccount = [];      // 회계처리사
  dsAccountSys = [];      // 회계처리시스템
  dsPCustCd = [];     // 관리회사
  dsActFlg = [];      // 사용여부
  dsMonyUnit = [];      // 화폐단위
  dsExptItem = [];      // 품목코드-수출사
  dsPurItem = [];      // 품목코드-매입처
  dsSignStat = [];      // 서명단계
  dsUser = [];      // 사용자
  dsUserGroup = [];      // 사용자그룹
  dsContGb = [];      // 거래처구분
  dsImptPtrn = [];      // 수입사
  dsReportId = [];     // 리포트

  dsItemcode = []; // 아이템코드
  dsItemcode2 = []; // 아이템코드2
  dsCalcType = [];  // 정산타입[AMT정액/RATE정률/ETC기타]
  dsPtrnItem = [];      // 품목코드-파트너

  checkFlg = false;
  checkFlg2 = false;
  impt_visible = true;

  visibleColumn = false;

  checkList = ['cust_nm', 'biz_gb', 'eng_cust_nm', 'eng_cust_short_nm',
    'biz_unit_tax_yn', 'biz_no', 'est_dt', 'eng_boss_nm', 'country', 'biz_adr1',
    'wh_country', 'wh_biz_adr1'];

  // 리포트 관리
  reportData: ReportMngVO = {} as ReportMngVO;
  tabs: any[] = [];

  target: any;
  bomKey = 'sub_item_cd';

  GRID_STATE_KEY = 'sacs_sacs010';
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  saveStatePopupPtrn = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_PopupPtrn');
  loadStatePopupPtrn = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_PopupPtrn');

  isOpenedPopupPtrn = false; // 파트너사 팝업 호출 여부
  searchAddress = {
    getPacComp: () => {
      return document.getElementsByClassName('pac-container pac-logo');
      // return document.getElementsByName('corpAddress1');
    },
    initPacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      for (let i = 0; i < pacComp.length; i++) {
        if (pacComp.item(i)) {
          pacComp.item(i).remove();
        }
      }
    },
    showPacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: 9999;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    hidePacComp: () => {
      const pacComp = this.searchAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: -1;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    resetInput: () => {
      this.searchAddress.getInputComp().value = '';
    },
    getInputComp: () => {
      return document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
    },
    getInputValue: () => {
      return this.searchAddress.getInputComp().value;
    },
    setInputValue: (value: string) => {
      this.searchAddress.getInputComp().value = value;
    }
  };
  searchWhAddress = {
    getPacComp: () => {
      return document.getElementsByClassName('pac-container pac-logo');
      // return document.getElementsByName('address1');
    },
    initPacComp: () => {
      const pacComp = this.searchWhAddress.getPacComp();
      for (let i = 0; i < pacComp.length; i++) {
        if (pacComp.item(i)) {
          pacComp.item(i).remove();
        }
      }
    },
    showPacComp: () => {
      const pacComp = this.searchWhAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: 9999;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    hidePacComp: () => {
      const pacComp = this.searchWhAddress.getPacComp();
      if (pacComp.length > 0) {
        const s = pacComp.item(0).getAttribute('style');
        const zIndexStr = ' z-index: -1;';
        pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
        pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
      }
    },
    resetInput: () => {
      this.searchWhAddress.getInputComp().value = '';
    },
    getInputComp: () => {
      return document.getElementsByName('address2AutoComplete').item(0) as HTMLInputElement;
    },
    getInputValue: () => {
      return this.searchWhAddress.getInputComp().value;
    },
    setInputValue: (value: string) => {
      this.searchWhAddress.getInputComp().value = value;
    }
  };

  phoneChangeFlg = false;

  uploadUrl = APPCONSTANTS.BASE_URL_SL + '/sales-service/azureStorage/uploadFile';

  // 계약구분에 따른 변화
  gbChanged = false;

  isExptPopupShown = false;

  ngOnInit(): void {

    this.sessionUid = this.utilService.getUserUid();

    this.entityStore = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSource = new DataSource({
      store: this.entityStore
    });

    this.entityStoreExpt = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSourceExpt = new DataSource({
      store: this.entityStoreExpt
    });

    this.entityStorePur = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSourcePur = new DataSource({
      store: this.entityStorePur
    });

    this.initCode();

  }

  initCode(): void {
    // 서명 단계
    this.dsSignStat = [{cd: '2', nm: this.utilService.convert1('sales.sign_1', '1차 서명완료', '1st Sign')}
      , {cd: '9', nm: this.utilService.convert1('sales.sign_2', '2차 서명완료', '2nd Sign')}
      , {cd: '1', nm: this.utilService.convert1('sales.sign_reg', '서명대기', 'Waiting for sign')}
    ];

    // 계약 구분
    this.dsContGb = [{cd: '1', nm: this.utilService.convert('sales.sale')}
      , {cd: '2', nm: this.utilService.convert('sales.rent')}
    ];

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 사업자구분
    this.codeService.getCode(this.G_TENANT, 'BIZGB').subscribe(result => {
      this.dsBizGb = result.data;
    });

    // 성별
    this.codeService.getCode(this.G_TENANT, 'SEX').subscribe(result => {
      this.dsSex = result.data;
    });

    // 계약담당사
    this.bizService.getCust(this.vTENANT, '', '', '', '', '', '').subscribe(result => {
      this.dsCont = result.data;
    });

    // 물류파트너사
    this.bizService.getCust(this.vTENANT, '', '', '', '', '', '').subscribe(result => {
      this.dsPtrn = result.data;
    });

    // 회계처리사
    this.bizService.getCust(this.vTENANT, '', '', '', '', '', '').subscribe(result => {
      this.dsAccount = result.data;
    });

    // 회계처리시스템
    this.codeService.getCode(this.G_TENANT, 'ACCOUNTSYS').subscribe(result => {
      this.dsAccountSys = result.data;
    });

    // 회계처리사
    this.bizService.getCust(this.vTENANT, '', '', '', '', '', '').subscribe(result => {
      this.dsAccount = result.data;

      this.dsPCustCd = result.data;
      // this.dsPCustCd.unshift({cd: '*', cust_cd: '*', display: 'NONE'});
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 기준화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 품목코드-수출사
    this.bizService.getItem(this.vTENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsExptItem = result.data;
      this.dsItemcode = _.cloneDeep(result.data);
    });

    // 품목코드-매입처
    this.bizService.getItem(this.vTENANT, '', 'Y', '3', '', '').subscribe(result => {
      this.dsPurItem = result.data;
    });

    // 품목코드-파트너
    this.bizService.getItem(this.vTENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsPtrnItem = result.data;
    });

    // 영업담당자
    this.bizService.getSaChg_SACS010(1).subscribe(result => {
      this.dsUserGroup = result.data;
    });

    // 수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
      this.dsImptPtrn = result.data;
    });

    // 리포트 조회
    this.bizService.getReportId(this.G_TENANT).subscribe(result => {
      this.dsReportId = result.data;
    });

    this.bizService.getItem(this.G_TENANT, 'N', 'Y', '', '', '').subscribe(result => {
      this.dsItemcode2 = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'CALCTYPE').subscribe(result => {
      this.dsCalcType = result.data;  // 정산타입
    });
  }

  ngAfterViewInit(): void {

    this.searchAddress.initPacComp();
    this.searchWhAddress.initPacComp();
    this.searchForm.instance.getEditor('use_yn').option('value', 'Y');

    const pacComp = document.getElementsByClassName('pac-container pac-logo');
    for (let i = 0; i < pacComp.length; i++) {
      if (pacComp.item(i)) {
        pacComp.item(i).remove();
      }
    }

    this.searchForm.instance.getEditor('custId').focus();
    this.utilService.getFoldable(this.searchForm, this.foldableBtn);
    this.utilService.getTabHeight(this.tab);
    this.adjustTabGridHeight(this.tab, [this.exptGrid, this.purGrid, this.ptrnGrid]);
  }

  /**
   * tab grid 높이 조정
   */
  adjustTabGridHeight(tab, gridList): void {
    for (const grid of gridList) {
      this.setTabGridHeight(tab, grid);
    }
  }

  // 수출사 그리드 포커스
  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(this.mainGrid, e.rowIndex);
  }

  onFocusedCellChangedPopupGrid(e): boolean {
    return (this.popupFormDataExpt.cont_gb === '1') ? false : true;
  }

  onFocusedCellChangedPurGrid(e): void {
    this.setFocusRow(this.popupPurGrid, e.rowIndex);
  }

  onFocusedRowChanging(e): void {
    this.initGrid();
    if (e.rowIndex < 0 || !e.row) {
      return;
    } else {
      this.rowData = e.row.data;
      this.onSubSearch(this.rowData);
      this.onPurSearch(this.rowData);
      this.onPtrnSearch(this.rowData).then(() => {
        this.adjustTabGridHeight(this.tab, [this.exptGrid, this.purGrid, this.ptrnGrid]);
      });
    }
  }

  initGrid(): void {

    this.entityStoreExpt = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSourceExpt = new DataSource({
      store: this.entityStoreExpt
    });

    this.entityStorePur = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSourcePur = new DataSource({
      store: this.entityStorePur
    });
  }


  // grid edit 제어
  allowEditing(e: any): boolean {
    return (this.popupFormDataExpt.sign_stat > '1' || this.popupFormDataExpt.cont_end_yn === 'Y') ? false : true;
  }

  allowPurEditing(e): boolean {
    return true;
  }

  // 기본 주소지 정보 복사
  onLwhChanged(): void {
    this.isCheckedFlg = true;

    if (!this.whInfoFlg) {
      this.whInfoFlg = true;
      return;
    }
    this.checkFlg = true;

    const country = this.popupForm.instance.getEditor('country').option('value');
    const biz_adr2 = this.popupForm.instance.getEditor('biz_adr2').option('value');
    const eng_biz_adr1 = this.popupForm.instance.getEditor('eng_biz_adr1').option('value');
    const eng_biz_adr2 = this.popupForm.instance.getEditor('eng_biz_adr2').option('value');
    const zip_no = this.popupForm.instance.getEditor('zip_no').option('value');
    const lat = this.popupForm.instance.getEditor('lat').option('value');
    const long = this.popupForm.instance.getEditor('long').option('value');
    const tel_no = this.popupForm.instance.getEditor('tel_no').option('value');
    const fax_no = this.popupForm.instance.getEditor('fax_no').option('value');
    const chg_nm = this.popupForm.instance.getEditor('chg_nm').option('value');
    const chg_email = this.popupForm.instance.getEditor('chg_email').option('value');
    const chg_tel_no = this.popupForm.instance.getEditor('chg_tel_no').option('value');
    const chg_hp_no = this.popupForm.instance.getEditor('chg_hp_no').option('value');
    const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;

    if (this.popupForm && this.popupForm.instance.getEditor('check').option('value') === true) {

      const input2 = document.getElementsByName('address2AutoComplete').item(0) as HTMLInputElement;
      input2.value = input.value;
      // this.popupFormData.address2AutoComplete = this.popupForm.instance.getEditor('address1AutoComplete').option('value');
      // this.popupForm.instance.getEditor('address2AutoComplete').option('value', input.value);
      this.popupForm.instance.getEditor('wh_country').option('value', country);
      this.popupForm.instance.getEditor('wh_biz_adr2').option('value', biz_adr2);
      this.popupForm.instance.getEditor('wh_eng_biz_adr1').option('value', eng_biz_adr1);
      this.popupForm.instance.getEditor('wh_eng_biz_adr2').option('value', eng_biz_adr2);
      this.popupForm.instance.getEditor('wh_zip_no').option('value', zip_no);
      this.popupForm.instance.getEditor('wh_lat').option('value', lat);
      this.popupForm.instance.getEditor('wh_long').option('value', long);
      this.popupForm.instance.getEditor('wh_tel_no').option('value', tel_no);
      this.popupForm.instance.getEditor('wh_fax_no').option('value', fax_no);
      this.popupForm.instance.getEditor('wh_chg_nm').option('value', chg_nm);
      this.popupForm.instance.getEditor('wh_chg_email').option('value', chg_email);
      this.popupForm.instance.getEditor('wh_chg_tel_no').option('value', chg_tel_no);
      this.popupForm.instance.getEditor('wh_chg_hp_no').option('value', chg_hp_no);

    } else {

      // 체크 해제하면 물류정보 초기화
      if (this.checkFlg === true && this.popupForm.instance.getEditor('check').option('value') !== 0) {

        const input2 = document.getElementsByName('address2AutoComplete').item(0) as HTMLInputElement;
        input2.value = '';

        this.popupForm.instance.getEditor('wh_biz_adr2').option('value', '');
        this.popupForm.instance.getEditor('wh_eng_biz_adr1').option('value', '');
        this.popupForm.instance.getEditor('wh_eng_biz_adr2').option('value', '');
        this.popupForm.instance.getEditor('wh_zip_no').option('value', '');
        this.popupForm.instance.getEditor('wh_lat').option('value', '');
        this.popupForm.instance.getEditor('wh_long').option('value', '');
        this.popupForm.instance.getEditor('wh_tel_no').option('value', '');
        this.popupForm.instance.getEditor('wh_fax_no').option('value', '');
        this.popupForm.instance.getEditor('wh_chg_nm').option('value', '');
        this.popupForm.instance.getEditor('wh_chg_email').option('value', '');
        this.popupForm.instance.getEditor('wh_chg_tel_no').option('value', '');
        this.popupForm.instance.getEditor('wh_chg_hp_no').option('value', '');
        this.popupForm.instance.getEditor('wh_country').option('value', null);

        this.checkFlg = false;
      }
    }
  }

  // 기본 주소지 정보 복사
  onLwhChanged2(): void {

    this.checkFlg2 = true;
    const check2 = Boolean(this.popupForm.instance.getEditor('check2').option('value'));

    if (this.popupForm) {
      const chg_nm = this.popupForm.instance.getEditor('chg_nm').option('value');
      const chg_email = this.popupForm.instance.getEditor('chg_email').option('value');
      const chg_tel_no = this.popupForm.instance.getEditor('chg_tel_no').option('value');
      const chg_hp_no = this.popupForm.instance.getEditor('chg_hp_no').option('value');

      if (this.popupForm && this.popupForm.instance.getEditor('check2').option('value') === true) {
        this.popupForm.instance.getEditor('bill_chg_nm').option('value', chg_nm);
        this.popupForm.instance.getEditor('bill_chg_email').option('value', chg_email);
        this.popupForm.instance.getEditor('bill_chg_tel_no').option('value', chg_tel_no);
        this.popupForm.instance.getEditor('bill_chg_hp_no').option('value', chg_hp_no);
      } else {

        if (this.checkFlg2 === true && this.popupForm.instance.getEditor('check2').option('value') !== undefined) {
          this.popupForm.instance.getEditor('bill_chg_nm').option('value', '');
          this.popupForm.instance.getEditor('bill_chg_email').option('value', '');
          this.popupForm.instance.getEditor('bill_chg_tel_no').option('value', '');
          this.popupForm.instance.getEditor('bill_chg_hp_no').option('value', '');

          this.checkFlg2 = false;
        }

      }
    }
  }

  async onBizNoCheck(): Promise<void> {

    const resultCount = await this.service.bizNoCount(this.popupFormData);
    this.bizNoCnt = 0;

    if (this.popupForm.instance.getEditor('biz_no').option('value') === '') {
      this.utilService.notify_error(this.utilService.convert('사업자번호를 입력해주세요.'));
      this.bizNoCnt = 0;
      return;
    }

    if (resultCount.data.count > 0) {
      this.utilService.notify_error(this.utilService.convert('이미 존재하는 사업자번호입니다.'));
      this.bizNoCnt = 0;
      return;
    } else {
      this.utilService.notify_success(this.utilService.convert('사용 가능한 사업자번호입니다.'));
      this.bizNoCnt = 1;
    }
  }

  /*	async onDunsNoCheck(): Promise<void> {

      const resultCount = await this.service.dunsNoCount(this.popupFormData);
      this.dunsNoCnt = 0;
      if (this.popupForm.instance.getEditor('duns_no').option('value') == '') {
        const msg = "DUNS NO를 입력해주세요.";
        this.utilService.notify_error(msg);
        this.dunsNoCnt = 0;
        return;
      }

      if (resultCount.data.count > 0) {
        const msg = "이미 존재하는 DUNS NO입니다.";
        this.utilService.notify_error(msg);
        this.dunsNoCnt = 0;
        return;
      } else {
        const msg = "사용 가능한 DUNS NO입니다.";
        this.utilService.notify_success(msg);
        this.dunsNoCnt = 1;
      }
    }

    async onMBizCheck(): Promise<void> {

      const resultCount = await this.service.mBizNoCount(this.popupFormData);
      this.mBizNoCnt = 0;

      if (this.popupForm.instance.getEditor('m_biz_no').option('value') == '') {
        const msg = "종사업장번호를 입력해주세요.";
        this.utilService.notify_error(msg);
        this.mBizNoCnt = 0;
        return;
      }

      if (resultCount.data.count > 0) {
        const msg = "이미 존재하는 종사업장번호입니다.";
        this.utilService.notify_error(msg);
        this.mBizNoCnt = 0;
        return;
      } else {
        const msg = "사용 가능한 종사업장번호입니다.";
        this.utilService.notify_success(msg);
        this.mBizNoCnt = 1;
      }
    }*/

  // ***** Main ***** //
  // 조회 버튼 클릭 시 조회
  async onSearch(): Promise<void> {

    this.entityStore = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSource = new DataSource({
      store: this.entityStore
    });

    this.initGrid();

    const data = this.searchForm.instance.validate();

    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {

      const result = await this.service.mainList(this.searchFormData);

      if (!result.success) {
        return;

      } else {

        this.mainGrid.instance.cancelEditData();

        this.entityStore = new ArrayStore({
          data: result.data,
          key: this.key
        });

        this.dataSource = new DataSource({
          store: this.entityStore
        });

        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }

    this.rowData = {
      cust_cd: '',
      pur_cd: '',
      ptrn_cd: '',
    };
    this.exptAddBtn.visible = false;
    this.elecContBtn.visible = false;
    this.purAddBtn.visible = false;
    this.ptrnAddBtn.visible = false;
  }

  // 거래처정보 셀 클릭 시 계약정보 조회
  async onSubSearch(sacsVO): Promise<void> {

    // 선택된 거래처 수출사 여부에 따른 수출사계약 버튼 처리
    if (this.rowData.expt_yn === 1) {
      this.exptAddBtn.visible = true;
      this.elecContBtn.visible = true;
    } else if (this.rowData.expt_yn === 0) {
      this.exptAddBtn.visible = false;
      this.elecContBtn.visible = false;
    }

    if (this.addFlg || !sacsVO.cust_cd) {
      this.addFlg = false;
      return;
    }

    const result = await this.service.detailList(sacsVO);

    if (!result.success) {
      return;

    } else {

      this.exptGrid.instance.cancelEditData();

      this.entityStoreExpt = new ArrayStore({
        data: result.data,
        key: 'cont_no'
      });

      this.dataSourceExpt = new DataSource({
        store: this.entityStoreExpt
      });

      this.exptGrid.focusedRowKey = null;
      this.exptGrid.paging.pageIndex = 0;

      const keys = this.exptGrid.instance.getSelectedRowKeys();
      this.exptGrid.instance.deselectRows(keys);
    }
  }

  // 거래처정보 셀 클릭 시 매입처계약 조회
  async onPurSearch(sacsVO): Promise<void> {

    // 선택된 거래처 수출사 여부에 따른 수출사계약 버튼 처리
    if (this.rowData.pur_yn === 1) {
      this.purAddBtn.visible = true;
    } else if (this.rowData.pur_yn === 0) {
      this.purAddBtn.visible = false;
    }

    if (this.addFlg || !sacsVO.cust_cd) {
      this.addFlg = false;
      return;
    }

    sacsVO.pur_cd = sacsVO.cust_cd;

    const result = await this.service.purList(sacsVO);

    if (!result.success) {
      return;
    } else {

      this.purGrid.instance.cancelEditData();

      this.entityStorePur = new ArrayStore({
        data: result.data,
        key: 'cont_no'
      });

      this.dataSourcePur = new DataSource({
        store: this.entityStorePur
      });

      this.purGrid.focusedRowKey = null;
      this.purGrid.paging.pageIndex = 0;

      const keys = this.purGrid.instance.getSelectedRowKeys();
      this.purGrid.instance.deselectRows(keys);
    }
  }

  // 거래처정보 셀 클릭 시 매입처계약 조회
  async onPtrnSearch(sacsVO): Promise<void> {

    // 선택된 거래처 수출사 여부에 따른 수출사계약 버튼 처리
    if (this.rowData.ptrn_yn === 1) {
      this.ptrnAddBtn.visible = true;
    } else if (this.rowData.ptrn_yn === 0) {
      this.ptrnAddBtn.visible = false;
    }

    if (this.addFlg || !sacsVO.cust_cd) {
      this.addFlg = false;
      return;
    }

    sacsVO.ptrn_cd = sacsVO.cust_cd;

    const result = await this.service.ptrnList(sacsVO);

    if (!result.success) {
      return;
    } else {

      this.ptrnGrid.instance.cancelEditData();

      this.entityStorePtrn = new ArrayStore({
        data: result.data,
        key: 'cont_no'
      });

      this.dataSourcePtrn = new DataSource({
        store: this.entityStorePtrn
      });

      this.ptrnGrid.focusedRowKey = null;
      this.ptrnGrid.paging.pageIndex = 0;

      const keys = this.ptrnGrid.instance.getSelectedRowKeys();
      this.ptrnGrid.instance.deselectRows(keys);
    }
  }

  // 초기화 버튼 클릭 시 검색영역 초기화
  async onReset(): Promise<void> {
    await this.searchForm.instance.resetValues();
    await this.initForm();
  }

  // 초기화 후 기본 값 셋팅
  initForm(): void {
    this.searchForm.instance.getEditor('custId').focus();
  }


  // ***** Popup Comm *****//

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
    this.popupFormDataExpt = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});

  }

  // 메세지 호출 함수
  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  // 국가 변경 시 함수 호출
  onChangedCountry(e): void {
    // 위 국가 변경시 물류 정보 살려줌
    this.whInfoFlg = false;
    this.changedCountry(e.value);
    this.whInfoFlg = true;
    // this.changedCountry2(e.value);

    /*if (this.phoneChangeFlg) {
      const findCode = this.dsCountry.find(el => el.code === this.popupFormData.country);
      if (findCode) {
        this.popupForm.instance.getEditor('tel_no').option('value', '+' + findCode.etcColumn1 + ')');
        this.popupForm.instance.getEditor('fax_no').option('value', '+' + findCode.etcColumn1 + ')');
        this.popupForm.instance.getEditor('chg_tel_no').option('value', '+' + findCode.etcColumn1 + ')');
        this.popupForm.instance.getEditor('chg_hp_no').option('value', '+' + findCode.etcColumn1 + ')');
      }
    }

    this.phoneChangeFlg = true;*/
  }

  // 국가 변경 시 함수 처리
  async changedCountry(country: string): Promise<void> {
    this.autpCompleteAddressFlg = false;

    const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;

    input.value = '';
    this.popupForm.instance.getEditor('zip_no').option('value', '');
    this.popupForm.instance.getEditor('biz_adr2').option('value', '');
    this.popupForm.instance.getEditor('eng_biz_adr1').option('value', '');
    this.popupForm.instance.getEditor('eng_biz_adr2').option('value', '');
    this.popupForm.instance.getEditor('lat').option('value', '');
    this.popupForm.instance.getEditor('long').option('value', '');
    this.popupForm.instance.getEditor('homepage').option('value', '');
    this.popupForm.instance.getEditor('tel_no').option('value', '');
    this.popupForm.instance.getEditor('fax_no').option('value', '');
    this.popupForm.instance.getEditor('chg_nm').option('value', '');
    this.popupForm.instance.getEditor('chg_email').option('value', '');
    this.popupForm.instance.getEditor('chg_tel_no').option('value', '');
    this.popupForm.instance.getEditor('chg_hp_no').option('value', '');

    this.popupForm.instance.getEditor('check').option('value', false);

    if (this.autocomplete) {
      if (country) {
        this.autocomplete.setComponentRestrictions({country});
      } else {
        this.autocomplete.setOptions(this.options);
      }
    }

    const pacComp = document.getElementsByClassName('pac-container pac-logo');

    if (pacComp.length > 0) {
      const s = pacComp.item(0).getAttribute('style');
      const zIndexStr = ' z-index: 9999;';
      pacComp.item(0).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
      pacComp.item(0).setAttribute('style', pacComp.item(0).getAttribute('style') + zIndexStr);
    }
  }

  // 국가 변경 시 함수 호출
  onChangedWhCountry(e): void {
    if (this.isCheckedFlg) {
      this.isCheckedFlg = false;
      return;
    }

    this.changedCountry2(e.value);

    if (e.value && this.popupForm.instance.getEditor('check').option('value') !== true) {
      // 국가가 선택이 되고 체크가 해제면 초기화
      this.whInfoFlg = false;
      this.popupForm.instance.getEditor('check').option('value', false);
      return;
    }

    if (!e.value && this.popupForm.instance.getEditor('check').option('value') === true) {
      // 선택된 국가가 없고  체크가 되있으면
      this.whInfoFlg = true;  // 이벤트 실행 안할꺼야

      if (e.value === null) {
        this.popupForm.instance.getEditor('check').option('value', false);
      }
      return;
    }

    if (e.value && this.popupForm.instance.getEditor('check').option('value') === true) {
      // 국가 변경 후 체크 해제
      this.whInfoFlg = false;
      this.popupForm.instance.getEditor('check').option('value', false);

      return;
    }

  }


  // 국가 변경 시 함수 처리
  async changedCountry2(country: string): Promise<void> {
    this.autpCompleteAddressFlg2 = false;
    const input2 = document.getElementsByName('address2AutoComplete').item(0) as HTMLInputElement;

    input2.value = '';
    // this.popupForm.instance.getEditor('address2AutoComplete').option('value', '');

    this.popupForm.instance.getEditor('wh_biz_adr2').option('value', '');
    this.popupForm.instance.getEditor('wh_eng_biz_adr1').option('value', '');
    this.popupForm.instance.getEditor('wh_eng_biz_adr2').option('value', '');
    this.popupForm.instance.getEditor('wh_zip_no').option('value', '');
    this.popupForm.instance.getEditor('wh_lat').option('value', '');
    this.popupForm.instance.getEditor('wh_long').option('value', '');
    this.popupForm.instance.getEditor('wh_tel_no').option('value', '');
    this.popupForm.instance.getEditor('wh_fax_no').option('value', '');
    this.popupForm.instance.getEditor('wh_chg_nm').option('value', '');
    this.popupForm.instance.getEditor('wh_chg_email').option('value', '');
    this.popupForm.instance.getEditor('wh_chg_tel_no').option('value', '');
    this.popupForm.instance.getEditor('wh_chg_hp_no').option('value', '');

    if (this.autocomplete2) {
      if (country) {
        this.autocomplete2.setComponentRestrictions({country});
      } else {
        this.autocomplete2.setOptions(this.options);
      }
    }

    const pacComp = document.getElementsByClassName('pac-container pac-logo');

    if (pacComp.length > 0) {
      const s = pacComp.item(1).getAttribute('style');
      const zIndexStr = ' z-index: 9999;';
      pacComp.item(1).setAttribute('style', s.replace(new RegExp(zIndexStr, 'g'), ''));
      pacComp.item(1).setAttribute('style', pacComp.item(1).getAttribute('style') + zIndexStr);
    }
  }

  // ***** CustMst Popup ***** //

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;
    this.phoneChangeFlg = false;
    this.checkFlg = false;
    this.checkFlg2 = false;
    if (e.element.id === 'open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      // this.initMap();
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then(
        () => this.popupForm.instance.getEditor('cust_nm').focus()
      );
    }
  }

  // 팝업 단건조회
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
      this.popupFormData.check = 0;
      this.popupFormData.check2 = 0;
      this.firstPopupData = JSON.stringify(this.popupFormData);

      this.dsPCustCd = this.dsAccount.filter(el => el.cust_cd !== this.popupFormData.cust_cd);
      this.dsPCustCd.unshift({cust_cd: '*', display: 'NONE'});

    } else {
      return;
    }
  }

  // 팝업 오픈 후 처리
  onPopupAfterOpen(): void {
    // 기본설정
    this.saveBtn.visible = true;
    this.fileUploader.instance.reset();
    this.fileUploader2.instance.reset();
    this.fileUploader3.instance.reset();
    this.fileUploader4.instance.reset();
    this.fileUploader5.instance.reset();

    // this.popupForm.instance.repaint();
    // this.fileUploader.instance.repaint();
    // this.fileDownBtn.instance.repaint();
    // this.fileDtlBtn.instance.repaint();
    this.bizCheckBtn.instance.repaint();
    this.address.instance.repaint();
    this.whAddress.instance.repaint();
    this.popupForm.instance.getEditor('cust_cd').option('disabled', true);

    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('ptrn_yn').option('value', 0);
      this.popupForm.instance.getEditor('expt_yn').option('value', 0);
      this.popupForm.instance.getEditor('impt_yn').option('value', 0);
      this.popupForm.instance.getEditor('pur_yn').option('value', 0);
      this.popupForm.instance.getEditor('check').option('value', 0);
      this.popupForm.instance.getEditor('check2').option('value', 0);
      this.popupForm.instance.getEditor('bill_chg_tel_no').option('value', '');
      this.popupForm.instance.getEditor('bill_chg_hp_no').option('value', '');
      this.popupForm.instance.getEditor('wh_tel_no').option('value', '');
      this.popupForm.instance.getEditor('wh_fax_no').option('value', '');
      this.popupForm.instance.getEditor('wh_chg_tel_no').option('value', '');
      this.popupForm.instance.getEditor('wh_chg_hp_no').option('value', '');
      this.popupForm.instance.getEditor('wh_chg_hp_no').option('value', '');
      this.popupForm.instance.getEditor('p_cust_cd').option('value', '*');

      this.bizNoCnt = 0;
      this.dunsNoCnt = 0;
      this.mBizNoCnt = 0;
      // this.initMap();

      this.popupForm.instance.getEditor('phy_file_nm1').option('visible', false);
      this.fileDownBtn.visible = false;
      this.fileDtlBtn.visible = false;

    } else if (this.popupMode === 'Edit') {

      this.isCheckedFlg = true;
      this.checkFlg2 = true;
      this.onLwhChanged();
      this.onLwhChanged2();

      this.bizNoCnt = 1;
      this.dunsNoCnt = 1;
      this.mBizNoCnt = 1;

      if (this.popupFormData.use_yn === 'N') {
        this.saveBtn.visible = false;
        this.deleteBtn.visible = false;
      }

      // this.searchAddress.setInputValue(apiResult.data.roadAddress);  // 전체 주소
      // this.searchWhAddress.setInputValue(apiResult.data.roadAddress);  // 전체 주소

      // const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
      // input.value = this.popupFormData.biz_adr1;
      this.popupFormData.address1AutoComplete = this.popupFormData.biz_adr1;
      this.autpCompleteAddressFlg = true;

      const input2 = document.getElementsByName('address2AutoComplete').item(0) as HTMLInputElement;
      input2.value = this.popupFormData.wh_biz_adr1;
      this.autpCompleteAddressFlg2 = true;

      this.popupForm.instance.getEditor('phy_file_nm1').option('visible', true);
      this.fileDownBtn.visible = true;
      this.fileDtlBtn.visible = true;

      if (this.popupForm.instance.getEditor('phy_file_nm1').option('value') === '' ||
        this.popupForm.instance.getEditor('phy_file_nm1').option('value') === undefined) {
        this.fileDownBtn.visible = true;
        this.fileDtlBtn.visible = true;
        this.popupForm.instance.getEditor('phy_file_nm1').option('visible', true);
      }

      if (this.popupFormData.country === this.popupFormData.wh_country
        && this.popupFormData.zip_no === this.popupFormData.wh_zip_no
        && this.popupFormData.address1AutoComplete === this.popupFormData.address2AutoComplete
        && this.popupFormData.biz_adr2 === this.popupFormData.wh_biz_adr2
        && this.popupFormData.eng_biz_adr1 === this.popupFormData.wh_eng_biz_adr1
        && this.popupFormData.eng_biz_adr2 === this.popupFormData.wh_eng_biz_adr2
        && this.popupFormData.lat === this.popupFormData.wh_lat
        && this.popupFormData.long === this.popupFormData.wh_long
        && this.popupFormData.tel_no === this.popupFormData.wh_tel_no
        && this.popupFormData.fax_no === this.popupFormData.wh_fax_no
        && this.popupFormData.chg_nm === this.popupFormData.wh_chg_nm
        && this.popupFormData.chg_email === this.popupFormData.wh_chg_email
        && this.popupFormData.chg_tel_no === this.popupFormData.wh_chg_tel_no
        && this.popupFormData.chg_hp_no === this.popupFormData.wh_chg_hp_no
      ) {
        this.popupForm.instance.getEditor('check').option('value', true);
      }
    }
  }

  // 팝업 입력 데이터 저장
  async onPopupSave(): Promise<void> {

    const input2 = document.getElementsByName('address2AutoComplete').item(0) as HTMLInputElement;
    this.popupForm.instance.getEditor('address2AutoComplete').option('value', input2.value);

    const popData = this.popupForm.instance.validate();

    // 거래처코드 중복 유효성검사
    if (popData.isValid) {
      if (await this.execSave()) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  async execSave(): Promise<boolean> {
    try {
      let result;
      const lastPopupData: string = JSON.stringify(this.popupFormData);

      const input = document.getElementsByName('address1AutoComplete').item(0) as HTMLInputElement;
      this.popupFormData.biz_adr1 = input.value;

      const input2 = document.getElementsByName('address2AutoComplete').item(0) as HTMLInputElement;
      this.popupFormData.wh_biz_adr1 = input2.value;

      if (this.firstPopupData === lastPopupData && this.phyFileNm === undefined) {
        this.utilService.notify_error(this.utilService.convert('변경항목이 없습니다.'));
        return;
      }

      if (this.bizNoCnt === 0) {
        this.utilService.notify_error(this.utilService.convert('사업자번호 중복체크를 확인해주세요.'));
        return;
      }

      /*if (this.dunsNoCnt == 0) {
        const msg = "DUNS NO 중복체크를 확인해주세요.";
        this.utilService.notify_error(msg);
        return;
      }

      if (this.mBizNoCnt == 0) {
        const msg = "종사업장번호 중복체크를 확인해주세요.";
        this.utilService.notify_error(msg);
        return;
      }*/

      const saveContent: any = this.popupFormData;
      saveContent.createdby = this.utilService.getUserUid();
      saveContent.modifiedby = this.utilService.getUserUid();

      if (saveContent.ptrn_yn === false && saveContent.expt_yn === false && saveContent.impt_yn === false && saveContent.pur_yn === false) {
        this.utilService.notify_error(this.utilService.convert('하나 이상의 유형을 선택해주세요.'));
        return;
      }
      let errorCode = '';
      const codePath = 'sales.';
      for (const item of this.checkList) {
        if (Boolean(saveContent[item]) === false) {
          errorCode = codePath + item;
          break;
        }
      }
      if (Boolean(errorCode)) {
        this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(errorCode)));
        return;
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      } else {

        // console.log(this.popupFormData.phy_file_nm1);
        // console.log(this.popupFormData.log_file_nm1);
        // this.popupFormData['phy_file_nm1'] = this.phyFileNm;
        // this.popupFormData['log_file_nm1'] = this.logFileNm;
        // this.popupFormData.phy_file_nm1 = this.popupFormData.phy_file_nm1;
        // this.popupFormData.log_file_nm1 = this.popupFormData.log_file_nm1;
        this.phyFileNm = undefined;
        this.logFileNm = undefined;

      }

      // if (this.fileUploader.value[0]) {
      //   saveContent.file = this.fileUploader.value[0];
      //
      //   const myuuid = uuidv4();
      //   const file = this.fileUploader.value[0];
      //
      //   const fileExt = file.name.split('.').pop();
      //   this.phyFileNm = file.name;
      //   this.logFileNm = myuuid;
      //
      //   this.popupFormData.phy_file_nm1 = this.phyFileNm;
      //   this.popupFormData.log_file_nm1 = this.logFileNm + '.' + fileExt;
      //
      //   this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'logFileNm', this.logFileNm);
      // }

      const fileInputs = [this.fileUploader, this.fileUploader2, this.fileUploader3, this.fileUploader4, this.fileUploader5];
      const fileData = [];
      const logFileNms = [];

      for (let i = 0; i < fileInputs.length; i++) {
        const fileInput = fileInputs[i];

        if (fileInput.value[0]) {
          const file = fileInput.value[0];

          const myuuid = uuidv4();
          const fileExt = file.name.split('.').pop();
          const phyFileNm = file.name;
          const logFileNm = `${myuuid}.${fileExt}`;
          logFileNms[i] = myuuid;

          this.popupFormData[`phy_file_nm${i + 1}`] = phyFileNm;
          this.popupFormData[`log_file_nm${i + 1}`] = `${logFileNm}`;
          // this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'logFileNm', logFileNm);

          fileData.push({
            file,
            logFileNm,
          });
        }
      }

      if (fileData.length > 0) {
        saveContent.file = fileData;
      }

      console.log(saveContent);
      if (this.popupMode === 'Add') {
        result = await this.service.mainInsert(saveContent);
      } else {
        result = await this.service.mainUpdate(saveContent);
      }

      if (this.resultMsgCallback(result, 'Save')) {

        // if (this.fileUploader.value[0]) {
        //   console.log(logFileNms[0]);
        //   const formData = new FormData(document.forms.namedItem('uploadForm'));
        //   formData.append('newFileName', logFileNms[0]);
        //
        //   console.log(formData);
        //   const fileResult = this.service.uploadFile(formData);
        // }

        // 파일 업로드
        // tslint:disable-next-line:no-shadowed-variable
        const fileInputs = [
          {inputFile: this.fileUploader, formName: 'uploadForm', logFileNm: logFileNms[0]},
          {inputFile: this.fileUploader2, formName: 'uploadForm2', logFileNm: logFileNms[1]},
          {inputFile: this.fileUploader3, formName: 'uploadForm3', logFileNm: logFileNms[2]},
          {inputFile: this.fileUploader4, formName: 'uploadForm4', logFileNm: logFileNms[3]},
          {inputFile: this.fileUploader5, formName: 'uploadForm5', logFileNm: logFileNms[4]},
        ];

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < fileInputs.length; i++) {
          const {inputFile, formName, logFileNm} = fileInputs[i];

          console.log(inputFile, '?', logFileNm, '?', formName);
          if (inputFile.value[0]) {
            console.log(document.forms.namedItem(formName));
            console.log(this.uploadUrl);
            const formData = new FormData(document.forms.namedItem(formName));
            formData.append('newFileName', logFileNm);

            console.log(formData);
            this.service.uploadFile(formData);
          }
        }

        // 물류 거래처 송신 I/F
        const vo = {
          sendType: 'cust'
        };
        const apiResult = await this.bizService.sendApi(vo);

        if (!apiResult.success) {
          this.utilService.notify_error(JSON.stringify(apiResult));
          // return;
        } else {
          console.log('I/F Success');
        }

        this.popupFormData = result.data;
        return true;
      } else {
        return false;
      }
    } catch {
      this.utilService.notify_error('There was an error!');
      return false;
    }
    return false;
  }

  // 팝업 호출 데이터 삭제
  async onPopupDelete(): Promise<void> {
    this.popupFormData.cust_cd = this.rowData.cust_cd;
    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }
    try {
      const result = await this.service.mainDelete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        const resultDelete = await this.service.subDelete(this.popupFormData);

        if (this.resultMsgCallback(resultDelete, 'Delete')) {

          // 물류 거래처 송신 I/F
          const vo = {
            sendType: 'custDelete'
          };
          const apiResult = await this.bizService.sendApi(vo);

          if (!apiResult.success) {
            this.utilService.notify_error(JSON.stringify(apiResult));
            // return;
          } else {
            console.log('I/F Success');
          }

          this.onPopupClose();
          this.onSearch();
          this.onSubSearch(this.rowData);
        }
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
    this.popupForm.instance.resetValues();
  }

  // ***** CustCont Popup ***** //

  // 계약정보버튼 이벤트
  async onNew(e): Promise<void> {

    /*if (this.rowData.cust_cd == "" || this.rowData.cust_cd == null) {
      const msg = "거래처 정보를 선택해주세요.";
      this.utilService.notify_error(msg);
      return;
    }

    if(this.rowData.expt_yn == 0) {
      const msg = "수출사 계약은 수출사 거래처만 가능합니다."
      this.utilService.notify_error(msg);
      return;
    }*/

    this.deleteBtnExpt.visible = false;
    this.showPopup('Add', {...e.data});
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtnExpt.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    // console.log(e.data);
    this.showPopup('Edit', {...e.data});
  }

  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화

    this.popupEntityStore = new ArrayStore({
      data: [],
      key: 'cont_no'
    });

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.popupFormDataExpt = data;
    this.popupFormDataExpt = {tenant: this.G_TENANT, ...this.popupFormDataExpt};

    this.firstPopupData = JSON.stringify(this.popupFormDataExpt);
    this.popupModeExpt = popupMode;
    this.popupVisibleExpt = true;

    /* New Expt Popup Open */
    if (this.popupModeExpt === 'Add') {
      this.copyBtn.visible = false;
    }
    this.onSearchPopup();
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupFormDataExpt.cont_no) {

      // Service의 get 함수 생성
      const result = await this.service.prodList(this.popupFormDataExpt);

      console.log(result);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.popupEntityStore = new ArrayStore({
          data: result.data.custDetailList,
          key: 'item_cd'
        });

        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });

        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  // 팝업 오픈 후 처리
  onPopupAfterOpen2(): void {
    this.sign_stat = this.exptGrid.instance.getSelectedRowsData();
    this.saveBtnExpt.visible = true;
    this.deleteBtnExpt.visible = false;
    this.popupFormExpt.instance.getEditor('cust_nm').option('value', this.rowData.cust_nm);
    this.popupFormExpt.instance.getEditor('cust_nm').option('disabled', true);
    this.popupFormExpt.instance.getEditor('cont_dt').option('disabled', false);
    this.popupFormExpt.instance.getEditor('impt_cd').option('disabled', false);
    this.popupFormExpt.instance.getEditor('cont_gb').option('disabled', false);
    this.popupFormExpt.instance.getEditor('dely_rate').option('disabled', false);
    this.popupFormExpt.instance.getEditor('reportid').option('disabled', false);
    this.popupFormExpt.instance.getEditor('expt_vat').option('disabled', false);
    this.popupFormExpt.instance.getEditor('std_rate').option('disabled', false);
    this.popupFormExpt.instance.getEditor('cont_conts').option('disabled', false);
    this.popupFormExpt.instance.getEditor('mony_unit').option('disabled', false);
    this.popupFormExpt.instance.getEditor('dely_rate').option('disabled', false);
    this.popupFormExpt.instance.getEditor('cont_st_dt').option('disabled', false);
    this.popupFormExpt.instance.getEditor('cont_end_dt').option('disabled', false);
    this.popupFormExpt.instance.getEditor('reportid').option('disabled', false);
    this.popupFormExpt.instance.getEditor('expt_vat').option('disabled', false);
    this.popupFormExpt.instance.getEditor('cont_rental_period').option('disabled', false);

    if (this.popupModeExpt === 'Edit') {

      this.copyBtn.visible = true;

      // this.popupFormExpt.instance.getEditor('dely_rate').option('value', 0);
      this.popupFormExpt.instance.getEditor('dely_rate').option('disabled', true);
      // this.popupFormExpt.instance.getEditor('std_rate').option('value', 1);
      this.popupFormExpt.instance.getEditor('cont_dt').option('disabled', true);
      this.popupFormExpt.instance.getEditor('impt_cd').option('disabled', true);
      this.popupFormExpt.instance.getEditor('cont_gb').option('disabled', true);

      if (this.popupFormDataExpt.cont_gb === '1') {
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('disabled', true);
        this.rent_visible = false;
      }
      if (this.popupFormDataExpt.cont_gb === '2') {
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('disabled', false);
        this.rent_visible = true;
      }

      if (this.rowData.use_yn === 'N' || this.popupFormExpt.instance.getEditor('cont_end_yn').option('value') === 'Y') {
        this.saveBtnExpt.visible = false;
        this.deleteBtnExpt.visible = true;
        this.popupFormExpt.instance.getEditor('cust_nm').option('disabled', true);
        this.popupFormExpt.instance.getEditor('std_rate').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_conts').option('disabled', true);
        this.popupFormExpt.instance.getEditor('mony_unit').option('disabled', true);
        this.popupFormExpt.instance.getEditor('dely_rate').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_st_dt').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_end_dt').option('disabled', true);
        this.popupFormExpt.instance.getEditor('reportid').option('disabled', true);
        this.popupFormExpt.instance.getEditor('expt_vat').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('disabled', true);
      } else {
        this.saveBtnExpt.visible = true;
        this.deleteBtnExpt.visible = false;
      }

      if (this.sign_stat[0].sign_stat > '1') {
        this.popupFormExpt.instance.getEditor('cust_nm').option('disabled', true);
        this.popupFormExpt.instance.getEditor('std_rate').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_conts').option('disabled', true);
        this.popupFormExpt.instance.getEditor('mony_unit').option('disabled', true);
        this.popupFormExpt.instance.getEditor('dely_rate').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_st_dt').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_end_dt').option('disabled', true);
        this.popupFormExpt.instance.getEditor('reportid').option('disabled', true);
        this.popupFormExpt.instance.getEditor('expt_vat').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('disabled', true);
      }

      this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    }

    if (this.popupModePur === 'Add') {
      this.popupFormExpt.instance.getEditor('std_rate').option('value', 1);
      this.popupFormExpt.instance.getEditor('cont_end_yn').option('value', 'N');
    }

    // this.utilService.setPopupGridHeight(this.popupExpt, this.popupFormExpt, this.popupGrid);
    // if (!this.isExptPopupShown) {
    //   this.isExptPopupShown = true;
    // } else {
    //   this.utilService.adjustFormHeightInPopup();
    // }


  }

  // 팝업 입력 데이터 저장
  async popupSaveClick(e): Promise<void> {
    console.log(this.popupGrid.instance.totalCount());
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '품목 목록을 추가하세요.'
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.item_cd', '품목', 'Item'));
      this.utilService.notify_error(msg);
      return;
    }

    const popData = this.popupFormExpt.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        const lastPopupData: string = JSON.stringify(this.popupFormDataExpt);
        let formModified = 'N';

        if (this.firstPopupData !== lastPopupData) {
          formModified = 'Y';
          console.log('diff');
        } else {
          console.log('same');
        }

        const today: string = this.gridUtil.getToday().replace(/-/gi, '');
        const contDt: string = this.popupFormExpt.instance.getEditor('cont_dt').option('value').replace(/-/gi, '');
        const contStDt: string = this.popupFormExpt.instance.getEditor('cont_st_dt').option('value').replace(/-/gi, '');
        const contEndDt: string = this.popupFormExpt.instance.getEditor('cont_end_dt').option('value').replace(/-/gi, '');
        const indexWhenDup = this.bizService.getIndexWhenDup(this.popupGrid, 'item_cd');

        // 팝업 유효성 검사
        if (indexWhenDup > -1) {
          this.utilService.notify_error(this.utilService.convert('품목이 중복됩니다.'));
          return;
        }
        /*if( this.popupModeExpt === 'Add' && contDt < today ) {
          const msg = "계약일자는 당일 포함 이후만 가능합니다.";
          this.utilService.notify_error(msg);
          return;
        }*/

        if (contStDt < contDt) {
          this.utilService.notify_error(this.utilService.convert('계약시작일자는 계약일자 포함 이후만 가능합니다.'));
          return;
        }

        if (contEndDt < contStDt) {
          this.utilService.notify_error(this.utilService.convert('계약종료일자는 계약시작일자 이후만 가능합니다.'));
          return;
        }

        const saveContent = this.popupFormDataExpt as CustContVO;
        const saveContent2 = this.popupFormDataExpt as CustContVO;

        const detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
        const detailList2 = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);

        if (detailList.length > 0) {
          // 팝업 그리드 유효성 검사
          for (const items of detailList) {
            if (items.operType !== 'remove') {
              if (items.item_cd === '') {
                this.utilService.notify_error(this.utilService.convert('품목은 필수입니다.'));
                return;
              }
              // if (items.cont_pr <= 0 && this.popupFormDataExpt.cont_gb === '1') {
              //   this.utilService.notify_error(this.utilService.convert('판매단가를 입력하세요.'));
              //   return;
              // }
              if (this.popupFormDataExpt.cont_gb === '2') {
                if (items.rent_day_pr <= 0) {
                  this.utilService.notify_error(this.utilService.convert('렌탈단가를 입력하세요.'));
                  return;
                }
              }
            }
          }
        } else if (detailList.length <= 0) {
          if (this.popupModeExpt === 'Add') {
            this.utilService.notify_error(this.utilService.convert('품목은 필수입니다.'));
            return;
          }
        }

        if (formModified === 'N' && !this.popupGrid.instance.hasEditData()) {
          this.utilService.notify_error(this.utilService.convert('변경항목이 없습니다.'));
          return;
        }
        // 팝업 그리드 유효성 검사
        /*for (const items of detailList) {
          if (items.item_cd == "" || items.item_cd == undefined) {
            const msg = "품목은 필수입니다.";
            this.utilService.notify_error(msg);
            return;
          }
        }
                console.log(detailList.length);
        if (this.firstPopupData.length+2 == lastPopupData.length && detailList.length <= 0) {
          this.utilService.notify_error('변경항목이 없습니다.');
          return;
        }*/

        /*if(){
            const msg = "변경항목이 없습니다.";
            this.utilService.notify_error(msg);
            return;
        }*/

        saveContent.custDetailList = detailList;
        saveContent.cust_cd = this.rowData.cust_cd;
        saveContent.createdby = this.utilService.getUserUid();
        saveContent.modifiedby = this.utilService.getUserUid();
        saveContent.formModified = formModified;

        saveContent2.custDetailList2 = detailList2;
        saveContent2.cust_cd = this.rowData.cust_cd;

        // 계약기간 중복여부 유효성 검사
        let resultCount;
        let resultCount2;

        resultCount = await this.service.detailCount(saveContent);
        this.detailCount = resultCount.data;

        resultCount2 = await this.service.imptCdCheck(saveContent2);
        this.detailCount2 = resultCount2.data;

        if (this.detailCount.count > 0 && this.popupModeExpt === 'Add') {
          this.utilService.notify_error(this.utilService.convert('계약기간이 중복되었습니다.'));
          return;
        }

        if (this.detailCount2 === 1 && this.popupModeExpt === 'Add') {
          this.utilService.notify_error(this.utilService.convert('아직 계약중인 수출사 입니다.'));
          return;
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        result = await this.service.prodInsert(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupFormExpt.instance.resetValues();
          this.popupVisibleExpt = false;
          this.onSubSearch(this.rowData);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 팝업 호출 데이터 삭제
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormDataExpt as CustContVO;
      const result = await this.service.detailDelete(deleteContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupFormExpt.instance.resetValues();
        this.popupVisibleExpt = false;
        this.onSubSearch(this.rowData);
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 닫기 클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisibleExpt = false;
    this.popupFormExpt.instance.resetValues();
  }

  // 로우 추가 시 초기값 셋팅
  onInitNewRowPopup(e): void {
    e.data.item_cd = '';
    e.data.cont_pr = 0;
    if (this.popupFormDataExpt.cont_gb === '2') {
      e.data.rent_day_pr = 0;
    } else if (this.popupFormDataExpt.cont_gb === '1') {
      e.data.rent_day_pr = 0;
    }
  }

  // 팝업 그리드 로우 추가
  onPopupAddRow(): void {
    if (this.popupFormDataExpt.cont_end_yn === 'N' && this.popupFormDataExpt.sign_stat === '1' || this.popupFormDataExpt.cont_end_yn === 'N' && this.popupFormDataExpt.sign_stat === undefined) {
      this.popupGrid.instance.addRow().then(() => {
        this.setFocusRow(this.popupGrid, this.popupGrid.instance.getVisibleRows().length - 1);
      });
    }
  }

  // 팝업 그리드 로우 삭제
  async onPopupDeleteRow(): Promise<void> {
    if (this.popupFormDataExpt.cont_end_yn === 'N' && this.popupFormDataExpt.sign_stat === '1' || this.popupFormDataExpt.cont_end_yn === 'N' && this.popupFormDataExpt.sign_stat === undefined) {
      if (this.popupGrid.focusedRowIndex > -1) {
        this.popupGrid.instance.deleteRow(this.popupGrid.focusedRowIndex);
        this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);
        this.setFocusRow(this.popupGrid, this.popupGrid.focusedRowIndex - 1);
      }
    }
  }

  // row별 Edit 제어
  onEditorPreparing(e, grid): void {
    if (e.dataField === 'item_cd' && e.parentType === 'dataRow') {
      e.editorOptions.disabled = e.row.data.cont_dt ? true : false;

      const standardHandler = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args) => {
        const checkRows = this.popupGrid.instance.getVisibleRows();
        let check = false;

        for (const row of checkRows) {

          if (row.data.item_cd === args.value) {
            check = true;
            break;
          }
        }

        if (check) {
          this.utilService.notify_error(this.utilService.convert1('이미 존재하는 품목이 있습니다.', '이미 존재하는 품목이 있습니다.'));
          this.popupGrid.instance.cellValue(e.row.rowIndex, 'item_cd', '');
          this.popupGrid.instance.cellValue(e.row.rowIndex, 'set_item_yn', '');
          return;
        } else {
          const item = this.dsExptItem.filter(el => el.item_cd === args.value)[0];
          this.popupGrid.instance.cellValue(e.row.rowIndex, 'item_cd', item.item_cd);
          this.popupGrid.instance.cellValue(e.row.rowIndex, 'set_item_yn', item.set_item_yn);
          standardHandler(args);
        }
      };
    }

  }

  // ***** PurCont Popup ***** //

  // 계약정보버튼 이벤트
  async onNewPur(e): Promise<void> {

    // 계약기간 중복여부 유효성 검사
    let resultCount;

    resultCount = await this.service.purCount(this.rowData);
    this.purCount = resultCount.data;

    /*TODO 확인필요*/
    // if (this.purCount.count > 0) {
    //   this.utilService.notify_error(this.utilService.convert('이미 존재하는 계약건수가 있습니다.'));
    //   return;
    // }

    this.deleteBtnPur.visible = false;
    this.showPurPopup('Add', {...e.data});
  }

  // 그리드 더블클릭시 호출하는 함수
  purRowDblClick(e): void {
    this.deleteBtnPur.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPurPopup('Edit', {...e.data});
  }

  showPurPopup(popupMode, data): void {

    this.changes = [];  // 초기화

    this.popupEntityStorePur = new ArrayStore({
      data: [],
      key: 'cont_no'
    });

    this.popupDataSourcePur = new DataSource({
      store: this.popupEntityStorePur
    });

    this.popupFormDataPur = data;
    this.popupFormDataPur = {tenant: this.G_TENANT, ...this.popupFormDataPur};
    this.popupFormDataPur.cust_nm = this.rowData.cust_nm;
    this.firstPopupData = JSON.stringify(this.popupFormDataPur);
    this.popupModePur = popupMode;
    this.popupVisiblePur = true;
    this.onSearchPopupPur();
  }

  onPopupAfterOpenPur(): void {
    this.saveBtnPur.visible = true;

    this.popupFormPur.instance.getEditor('cust_nm').option('value', this.rowData.cust_nm);
    this.popupFormPur.instance.getEditor('cust_nm').option('disabled', true);
    this.popupFormPur.instance.getEditor('mony_unit').option('disabled', false);
    this.popupFormPur.instance.getEditor('std_rate').option('disabled', false);
    this.popupFormPur.instance.getEditor('cont_conts').option('disabled', false);

    if (this.popupModePur === 'Add') {
      this.popupFormPur.instance.getEditor('std_rate').option('value', 1);
      this.popupFormPur.instance.getEditor('cont_end_yn').option('value', 'N');
    }
    this.popupPurGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    // 팝업 그리드 사이즈 조정
    this.utilService.setPopupGridHeight(this.popupPur, this.popupFormPur, this.popupPurGrid);
  }

  // 팝업 그리드 조회
  async onSearchPopupPur(): Promise<void> {
    if (this.popupFormDataPur.cont_no) {

      // Service의 get 함수 생성
      const result = await this.service.purDetailList(this.popupFormDataPur);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupPurGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.popupEntityStorePur = new ArrayStore({
          data: result.data.purDetailList,
          key: 'item_cd'
        });

        this.popupDataSourcePur = new DataSource({
          store: this.popupEntityStorePur
        });

        this.popupPurGrid.focusedRowKey = null;
        this.popupPurGrid.paging.pageIndex = 0;
      }
    }
  }

  // 팝업 입력 데이터 저장
  async purSaveClick(e): Promise<void> {

    const popData = this.popupFormPur.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        const lastPopupData: string = JSON.stringify(this.popupFormDataPur);
        let formModified = 'N';

        if (this.firstPopupData !== lastPopupData) {
          formModified = 'Y';
          console.log('diff');
        } else {
          console.log('same');
        }

        const indexWhenDup = this.bizService.getIndexWhenDup(this.popupPurGrid, 'item_cd');

        // 팝업 유효성 검사
        if (indexWhenDup > -1) {
          this.utilService.notify_error(this.utilService.convert('품목이 중복됩니다.'));
          return;
        }

        const saveContent = this.popupFormDataPur as PurContVO;
        const detailList = this.bizService.collectGridData(this.changes, this.popupPurGrid, this.G_TENANT);

        if (detailList.length > 0) {
          // 팝업 그리드 유효성 검사
          for (const items of detailList) {
            if (items.operType !== 'remove') {
              if (items.item_cd === '' && items.cont_end_yn === 'N') {
                this.utilService.notify_error(this.utilService.convert('품목은 필수입니다.'));
                return;
              }
              if (items.min_ord_qty < 0) {
                this.utilService.notify_error(this.utilService.convert('최소발주수량을 입력하세요.'));
                return;
              }
              if (items.lead_time < 0) {
                this.utilService.notify_error(this.utilService.convert('리드타임을 입력하세요.'));
                return;
              }
              if (items.inp_limit_rate < 0) {
                this.utilService.notify_error(this.utilService.convert('입고한계치를 입력하세요.'));
                return;
              }
              // if (items.pur_item_no === '') {
              //   this.utilService.notify_error(this.utilService.convert('거래처품번을 입력하세요.'));
              //   return;
              // }
              if (items.chk_tar_yn === '') {
                this.utilService.notify_error(this.utilService.convert('검사대상여부를 입력하세요.'));
                return;
              }
              if (items.std_pur_vat_rate < 0) {
                this.utilService.notify_error(this.utilService.convert('표준부가세를 입력하세요.'));
                return;
              }
            }
          }
        } else if (detailList.length <= 0) {
          if (this.popupModePur === 'Add') {
            this.utilService.notify_error(this.utilService.convert('품목은 필수입니다.'));
            return;
          }
        }

        if (this.firstPopupData === lastPopupData && detailList.length <= 0) {
          this.utilService.notify_error(this.utilService.convert('변경항목이 없습니다.'));
          return;
        }

        saveContent.purDetailList = detailList;
        saveContent.pur_cd = this.rowData.cust_cd;
        saveContent.createdby = this.utilService.getUserUid();
        saveContent.modifiedby = this.utilService.getUserUid();
        saveContent.formModified = formModified;

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));

        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        result = await this.service.purDetailInsert(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupFormPur.instance.resetValues();
          this.popupVisiblePur = false;
          this.onSubSearch(this.rowData);
          this.onPurSearch(this.rowData);
          this.onPtrnSearch(this.rowData);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 팝업 호출 데이터 삭제
  async purDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormDataPur as PurContVO;
      const result = await this.service.purDelete(deleteContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupFormPur.instance.resetValues();
        this.popupVisiblePur = false;
        this.onSubSearch(this.rowData);
        this.onPurSearch(this.rowData);
        this.onPtrnSearch(this.rowData);
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 닫기 클릭 이벤트
  purCancelClick(e): void {
    this.popupVisiblePur = false;
    this.popupFormPur.instance.resetValues();
  }

  // 로우 추가 시 초기값 셋팅
  onInitPurRowPopup(e): void {
    e.data.item_cd = '';
    e.data.ord_unit = '';
    e.data.pur_item_no = '';
    e.data.chk_tar_yn = '';
    e.data.min_ord_qty = 0;
    e.data.ord_pr = 0;
    e.data.lead_time = 0;
    e.data.inp_limit_rate = 0;
    e.data.std_pur_vat_rate = 0;
    e.data.vat_rate = 0;
  }

  // 팝업 그리드 로우 추가
  onPurAddRow(): void {
    this.popupPurGrid.instance.addRow().then(() => {
      const idx = this.popupPurGrid.instance.getVisibleRows().length - 1;
      this.setFocusRow(this.popupPurGrid, idx);
      this.popupPurGrid.instance.cellValue(idx, 'tax_yn', 'N');
      this.popupPurGrid.instance.cellValue(idx, 'chk_tar_yn', 'Y');
      this.popupPurGrid.instance.cellValue(idx, 'inp_limit_rate', 99999);
    });
  }

  // 팝업 그리드 로우 삭제
  async onPurDeleteRow(): Promise<void> {
    if (this.popupPurGrid.focusedRowIndex > -1) {
      this.popupPurGrid.instance.deleteRow(this.popupPurGrid.focusedRowIndex);
      this.popupEntityStorePur.push([{type: 'remove', key: this.popupPurGrid.focusedRowKey}]);
      this.setFocusRow(this.popupPurGrid, this.popupPurGrid.focusedRowIndex - 1);
    }
  }

  // row별 Edit 제어
  onEditorPurPreparing(e, grid): void {
    if (e.parentType === 'dataRow') {

      if (e.dataField === 'item_cd') {
        e.editorOptions.disabled = e.row.data.pur_cd ? true : false;
      } else if (e.dataField === 'tax_yn') {
        const standardHandler = e.editorOptions.onValueChanged;

        e.editorOptions.onValueChanged = (args) => {

          if (args.value === 'N') {
            this.popupPurGrid.instance.cellValue(e.row.rowIndex, 'vat_rate', 0);
          }
          this.popupPurGrid.instance.cellValue(e.row.rowIndex, 'tax_yn', args.value);
          standardHandler(args);
        };
      }
    }
  }

  // ***** PtrnCont Popup ***** //

  // 계약정보버튼 이벤트
  async onNewPtrn(e): Promise<void> {
    this.changes = [];  // 초기화

    this.deleteBtnPtrn.visible = false;
    this.showPtrnPopup('Add', {...e.data, ...this.rowData, detailList: []});
  }

  onInitPtrnRowPopup(e): void {
    e.data.ptrn_cd = this.rowData.cust_cd;
    e.data.cont_no = null;
    e.data.item_cd = null;

    e.data.out_type = 'NONE';
    e.data.out_cost = 0;
    e.data.rtn_type = 'NONE';
    e.data.rtn_cost = 0;
    e.data.keep_type = 'NONE';
    e.data.keep_cost = 0;
    e.data.oper_type = 'NONE';
    e.data.oper_cost = 0;
    e.data.dstr_proc_type = 'NONE';
    e.data.dstr_proc_cost = 0;
    e.data.tran_type = 'NONE';
    e.data.tran_cost = 0;
    e.data.etc_type = 'NONE';
    e.data.etc_cost = 0;
  }

  // 그리드 더블클릭시 호출하는 함수
  async ptrnRowDblClick(e): Promise<void> {
    this.changes = [];  // 초기화
    const res = await this.service.ptrnInfo({cont_no: e.data.cont_no});
    let detailList = [];
    if (res.success) {
      console.log('res', res);
      detailList = res.data.detailList;
    } else {
      this.utilService.notify_error(res.msg);
    }

    this.deleteBtnPtrn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPtrnPopup('Edit', {...e.data, detailList});
  }

  showPtrnPopup(popupMode, data): void {

    this.popupEntityStorePtrn = new ArrayStore({
      data: data.detailList,
      key: 'item_cd'
    });

    this.popupDataSourcePtrn = new DataSource({
      store: this.popupEntityStorePtrn
    });


    this.popupFormDataPtrn = data;
    this.popupFormDataPtrn = {tenant: this.G_TENANT, ...this.popupFormDataPtrn};
    this.popupFormDataPtrn.cust_nm = this.rowData.cust_nm;
    this.firstPopupData = JSON.stringify(this.popupFormDataPtrn);
    this.popupModePtrn = popupMode;
    this.popupVisiblePtrn = true;
  }

  /**
   * 파트너 계약 팝업 오픈
   */
  onPopupAfterOpenPtrn(): void {
    this.popupFormPtrn.instance.getEditor('cont_no').option('disabled', true);
    if (this.popupModePtrn === 'Add') {
      this.popupFormPtrn.instance.getEditor('cont_dt').option('value', this.gridUtil.getToday());
      this.popupFormPtrn.instance.getEditor('cont_end_yn').option('value', 'N');
    }

    const isDisabled = this.popupFormDataPtrn.cont_end_yn === 'Y';
    this.popupFormPtrn.instance.getEditor('cont_dt').option('disabled', isDisabled);
    this.popupFormPtrn.instance.getEditor('cont_st_dt').option('disabled', isDisabled);
    this.popupFormPtrn.instance.getEditor('cont_end_dt').option('disabled', isDisabled);
    this.popupFormPtrn.instance.getEditor('mony_unit').option('disabled', isDisabled);
    this.popupFormPtrn.instance.getEditor('cont_conts').option('disabled', isDisabled);

    // this.deleteBtn.visible = !isDisabled;
    // this.saveBtn.visible = !isDisabled;

    this.saveBtnPtrn.visible = true;

    this.popupPtrnGrid.instance.repaint();
    // this.utilService.setPopupGridHeight(this.popupPtrn, this.popupFormPtrn, this.popupPtrnGrid);
    //
    // this.utilService.getGridHeight(this.popupPtrnGrid);
    // 팝업 여백 조정
    // if (!this.isOpenedPopupPtrn) {
    //   this.isOpenedPopupPtrn = true;
    // } else {
    //   this.utilService.adjustFormHeightInPopup();
    // }

  }

  onPtrnAddRow(): any {
    this.popupPtrnGrid.instance.addRow().then(() => {
      const rowIdx = this.popupPtrnGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.popupPtrnGrid.focusedRowIndex = rowIdx;
    });
  }

  // 팝업 그리드 로우 삭제
  onPtrnDeleteRow(): any {
    if (this.popupPtrnGrid.focusedRowIndex > -1) {
      this.popupPtrnGrid.instance.deleteRow(this.popupPtrnGrid.focusedRowIndex);
      this.popupEntityStorePtrn.push([{type: 'remove', key: this.popupPtrnGrid.focusedRowKey}]);
      this.setFocusRow(this.popupPtrnGrid, this.popupPtrnGrid.focusedRowIndex - 1);
    }
  }

  /**
   * 출고 구분 변경시
   */
  setOutType(rowData: any, value: any, currentData: any): void {
    rowData.out_type = value;
    if (value === 'NONE') {
      rowData.out_cost = 0;
    }
  }

  /**
   * 회수 구분 변경시
   */
  setRtnType(rowData: any, value: any, currentData: any): void {
    rowData.rtn_type = value;
    if (value === 'NONE') {
      rowData.rtn_cost = 0;
    }
  }

  /**
   * 보관 구분 변경시
   */
  setKeepType(rowData: any, value: any, currentData: any): void {
    rowData.keep_type = value;
    if (value === 'NONE') {
      rowData.keep_cost = 0;
    }
  }

  /**
   * 영업수수료 구분 변경시
   */
  setOperType(rowData: any, value: any, currentData: any): void {
    rowData.oper_type = value;
    if (value === 'NONE') {
      rowData.oper_cost = 0;
    }
  }

  /**
   * 유통가공비 구분 변경시
   */
  setDstrProcType(rowData: any, value: any, currentData: any): void {
    rowData.dstr_proc_type = value;
    if (value === 'NONE') {
      rowData.dstr_proc_cost = 0;
    }
  }

  /**
   * 운송비 구분 변경시
   */
  setTranType(rowData: any, value: any, currentData: any): void {
    rowData.tran_type = value;
    if (value === 'NONE') {
      rowData.tran_cost = 0;
    }
  }

  /**
   * 기타 구분 변경시
   */
  setEtcType(rowData: any, value: any, currentData: any): void {
    rowData.etc_type = value;
    if (value === 'NONE') {
      rowData.etc_cost = 0;
    }
  }

  /**
   * 파트너 계약 금액 미사용 수정 금지
   */
  onEditingPopupPtrnGridStart(e): void {
    const validColList = ['out_cost', 'rtn_cost', 'keep_cost', 'oper_cost', 'dstr_proc_cost', 'tran_cost', 'etc_cost',];
    const checkColList = ['out_type', 'rtn_type', 'keep_type', 'oper_type', 'dstr_proc_type', 'tran_type', 'etc_type',];

    const findIdx = validColList.indexOf(e.column.dataField);
    if (findIdx !== -1 && e.data[checkColList[findIdx]] === 'NONE') {
      e.cancel = true;
    }
  }

  onFocusedCellChangedPtrnGrid(e): void {
    this.setFocusRow(this.popupPtrnGrid, e.rowIndex);
  }

  // 팝업 입력 데이터 저장
  async ptrnSaveClick(e): Promise<void> {
    const popData = this.popupFormPtrn.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        const lastPopupData: string = JSON.stringify(this.popupFormDataPtrn);


        if (this.firstPopupData === lastPopupData && this.popupModePtrn === 'Edit' && !this.popupPtrnGrid.instance.hasEditData()) {
          this.utilService.notify_error(this.utilService.convert('변경항목이 없습니다.'));
          return;
        }

        const saveContent = this.popupFormDataPtrn as any;
        const detailList = this.bizService.collectGridData(this.changes, this.popupPtrnGrid, this.G_TENANT);
        const indexWhenDup = this.bizService.getIndexWhenDup(this.popupPtrnGrid, 'item_cd');

        // 팝업 유효성 검사
        if (indexWhenDup > -1) {
          this.utilService.notify_error(this.utilService.convert('품목이 중복됩니다.'));
          return;
        }

        if (detailList.length > 0) {
          // 팝업 그리드 유효성 검사
          for (const items of detailList) {
            if (items.operType !== 'remove') {
              if (items.item_cd === '' && items.cont_end_yn === 'N') {
                this.utilService.notify_error(this.utilService.convert('품목은 필수입니다.'));
                return;
              }

              let typeCnt = 0;

              if (!items.item_cd) {
                const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.item_cd'));
                this.utilService.notify_error(msg);
                return;
              }

              if (items.out_type !== 'NONE') {
                typeCnt++;
              }
              if (items.rtn_type !== 'NONE') {
                typeCnt++;
              }
              if (items.keep_type !== 'NONE') {
                typeCnt++;
              }
              if (items.oper_type !== 'NONE') {
                typeCnt++;
              }
              if (items.dstr_proc_type !== 'NONE') {
                typeCnt++;
              }
              if (items.tran_type !== 'NONE') {
                typeCnt++;
              }
              if (items.etc_type !== 'NONE') {
                typeCnt++;
              }

              if (typeCnt === 0) {
                const msg = this.utilService.convert1('sacs010.ptrnContDetail.requiredType', '1가지 이상의 구분을 지정하여야 합니다.');
                this.utilService.notify_error(msg);
                return;
              }
            }
          }
        } else if (detailList.length <= 0) {
          if (this.popupModePtrn === 'Add') {
            this.utilService.notify_error(this.utilService.convert('품목은 필수입니다.'));
            return;
          }
        }

        saveContent.ptrn_cd = this.rowData.cust_cd;
        saveContent.detailList = detailList;
        saveContent.createdby = this.utilService.getUserUid();
        saveContent.modifiedby = this.utilService.getUserUid();

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        if (this.popupModePtrn === 'Add') {
          result = await this.service.ptrnInsert(saveContent);
        } else {
          result = await this.service.ptrnUpdate(saveContent);
        }

        if (!result.success) {
          const msg = this.utilService.convert(result.msg);
          this.utilService.notify_error(msg || result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupFormPtrn.instance.resetValues();
          this.popupVisiblePtrn = false;
          this.onPtrnSearch(this.rowData);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 팝업 호출 데이터 삭제
  async ptrnDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const result = await this.service.ptrnDelete(this.popupFormDataPtrn);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupFormPtrn.instance.resetValues();
        this.popupVisiblePtrn = false;
        this.onSubSearch(this.rowData);
        this.onPurSearch(this.rowData);
        this.onPtrnSearch(this.rowData);
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 닫기 클릭 이벤트
  ptrnCancelClick(e): void {
    this.popupVisiblePtrn = false;
    this.changes = [];
    this.popupFormPtrn.instance.resetValues();
  }


  // ***** 거래처 등록 시 파일업로드 ***** //

  // 업로드 후 처리
  onUploaded(e): void {

    const file = this.fileUploader.value[0];

    if (file) {
      this.phyFileNm = file.name;
    }
    // this.logFileNm = this.fileIdchk + '.' + this.phyFileNm.split('.').pop();
  }

  generateFileNm(e): void {
    this.bizService.getSaleFileId('sacs010').subscribe(result => {
      this.fileId = result.data.file_id;
    });
    this.fileIdchk = this.fileId;

    this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'newFileName', this.fileIdchk);
    e.component.option('uploadUrl', this.uploadUrl);
  }

  updateQueryStringParameter(uri, key, value): any {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri + separator + key + '=' + value;
    }
  }

  // 업로드 파일 다운로드
  onDownloadFile(value): void {
    const num = parseInt(value.slice(-1), 10); // value 값에서 마지막 숫자를 추출하여 정수형으로 변환
    const fileName = this.popupFormData[`log_file_nm${num}`];
    const origFileName = this.popupFormData[`phy_file_nm${num}`];

    this.bizService.portalFileDownload(fileName, origFileName);
  }

  // 업로드 파일 삭제
  onDeleteFile(value): void {
    const num = parseInt(value.slice(-1), 10); // value 값에서 마지막 숫자를 추출하여 정수형으로 변환
    const fileName = this.popupFormData[`log_file_nm${num}`];

    this.bizService.fileDelete(fileName);
    this.popupFormData[`log_file_nm${num}`] = '';
    this.popupFormData[`phy_file_nm${num}`] = '';
    this.phyFileNm = '';
    this.logFileNm = '';
  }


  // ***** 거래처정보 업로드 ***** //

  // 거래처정보 업로드
  async onCustUploadClick(e): Promise<void> {
    this.custUploadPopupVisible = true;
  }

  onCustUpPopupClose(e): void {
    this.popupCustInfo.instance.resetValues();

    if (!!this.custUpDataSource) {
      this.custUpEntityStore.clear();
      this.custUpDataSource.reload();
      this.fileUploader.instance.reset();
    }
  }

  // 업로드 저장
  async onCustUpSaveClick(): Promise<void> {
    const dataItems = this.custUpDataSource.items();
    if ((dataItems !== undefined) && (dataItems.length > 0)) {
      try {
        // 유효성 체크 실패한 건이 있는지 체크
        const maxItem = dataItems.reduce((prev, current) => {
          return (prev.err_msg > current.err_msg) ? prev : current;
        });

        if (maxItem.err_msg) {
          let msg = '오류를 확인하여 주세요.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Please check for errors.';
          }
          this.utilService.notify_error(msg);
          return;
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        const updateContent = {
          tenant: this.G_TENANT,
          createdby: this.sessionUid,
          modifiedby: this.sessionUid,
          itemList: [],
        };
        const saveContent = {
          tenant: this.G_TENANT,
          createdby: this.sessionUid,
          modifiedby: this.sessionUid,
          itemList: [],
        };
        for (const row of dataItems) {
          if (row.hasOwnProperty('cust_cd')) {
            updateContent.itemList.push(row);
          } else {
            saveContent.itemList.push(row);
          }
        }
        let isSuccess = false;
        if (updateContent.itemList.length > 0) {
          const updateResult = await this.service.updateCustUp(updateContent);
          if (this.resultMsgCallback(updateResult, 'Update')) {
            isSuccess = true;
          }
        }
        if (saveContent.itemList.length > 0) {
          const saveResult = await this.service.saveCustUp(saveContent);
          if (this.resultMsgCallback(saveResult, 'Update')) {
            isSuccess = true;
          } else {
            isSuccess = false;
          }
        }
        // 인터페이스 송신
        let apiResult;
        if (isSuccess) {
          const vo = {sendType: 'cust'};
          apiResult = await this.bizService.sendApi(vo);
        }
        if (!apiResult.success) {
          this.utilService.notify_error(JSON.stringify(apiResult));
        } else {
          // console.log('Save success, I/F Success');
          this.custUpDataSource.reload();
          this.utilService.notify_success('Save success, I/F Success');
          this.custUploadPopupVisible = false;
        }

      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  onCustUpCancelClick(): void {
    this.custUploadPopupVisible = false;
  }

  // 여부 관련된 데이터를 확인한다.
  checkCustYn(rowData: object): object {
    const chkList = ['ptrn_yn', 'expt_yn', 'impt_yn', 'pur_yn'];
    for (const chk of chkList) {
      if (Boolean(rowData[chk])) {
        const val = String(rowData[chk]).trim();
        if (Boolean(val) === false) {
          rowData[chk] = 'N';
        }
      } else {
        rowData[chk] = 'N';
      }
    }
    return rowData;
  }

  // 날짜가 1900년부터 카운팅된 형식으로 나오는 경우 변경
  fixDate(date: any): string {
    const daysBeforeUnixEpoch = 70 * 365 + 19;
    const hour = 60 * 60 * 1000;
    const newDate = new Date(Math.round((date - daysBeforeUnixEpoch) * 24 * hour) + 12 * hour);

    return this.utilService.formatDate2(newDate);
  }

  async changeTextToCode(rowData: any): Promise<void> {
    // 국가, 설립일자, 성별(DB), 사업자구분(DB)
    const chkList = ['boss_country', 'country', 'wh_country',];
    for (const item of chkList) {
      const isExist = Boolean(rowData[item]);
      if (isExist) {
        const country = String(rowData[item]);
        rowData[item] = country.substring(country.length - 3, country.length - 1);
      }
    }

    rowData.est_dt = this.fixDate(rowData.est_dt);

    for (const item of this.dsBizGb) {
      if (rowData.biz_gb.includes(item.code)) {
        rowData.biz_gb = item.code;
        break;
      }
    }
    for (const item of this.dsSex) {
      if (rowData.boss_sex.includes(item.code)) {
        rowData.boss_sex = item.code;
        break;
      }
    }
    // return null;
  }

  checkRequiredData(rowData: object): object {
    const chkList = ['cust_nm', 'biz_gb', 'eng_cust_nm', 'eng_cust_short_nm',
      'biz_unit_tax_yn', 'biz_no', 'est_dt', 'eng_boss_nm', 'country', 'biz_adr1',
      'wh_country', 'wh_biz_adr1'];
    const codePath = 'sales.';
    for (const chk of chkList) {
      if (Boolean(rowData[chk])) {
        const val = String(rowData[chk]).trim();
        if (Boolean(val) === false) {
          // @ts-ignore
          rowData.err_msg = this.utilService.convert(codePath + chk);
          break;
        }
      } else {
        // @ts-ignore
        rowData.err_msg = this.utilService.convert(codePath + chk);
        break;
      }
    }
    return rowData;
  }

  setRowNumber(rowList: Array<any>): Array<any> {
    let idx = 1;
    for (const row of rowList) {
      row.No = idx;
      idx++;
    }
    return rowList;
  }


  async addAddress(rowData: any): Promise<void> {
    const codePath = 'sales.';
    const resultComp: any = await this.mapService(rowData.country, rowData.biz_adr1);
    if (resultComp.result) {
      rowData.eng_biz_adr1 = resultComp.data.englishAddress;
      rowData.zip_no = resultComp.data.zip;
      rowData.lat = resultComp.data.lat;
      rowData.long = resultComp.data.long;
    }
    const resultDistr: any = await this.mapService(rowData.wh_country, rowData.wh_biz_adr1);
    if (resultDistr.result) {
      rowData.wh_eng_biz_adr1 = resultDistr.data.englishAddress;
      rowData.wh_zip_no = resultDistr.data.zip;
      rowData.wh_lat = resultDistr.data.lat;
      rowData.wh_long = resultDistr.data.long;
    }
    if (!resultComp.result && !resultDistr.result) {
      rowData.err_msg = `${this.utilService.convert(codePath + 'comp_biz_adr1')},` +
        `${this.utilService.convert(codePath + 'distr_biz_adr1')}`;
    } else if (!resultComp.result) {
      rowData.err_msg = this.utilService.convert(codePath + 'comp_biz_adr1');
    } else if (!resultDistr.result) {
      rowData.err_msg = this.utilService.convert(codePath + 'distr_biz_adr1');
    }
  }

  rowValidation(rowData: object): object {
    const adjustResult = this.checkCustYn(rowData);
    const chkDataResult = this.checkRequiredData(adjustResult);
    this.addAddress(adjustResult);
    this.changeTextToCode(rowData);

    return chkDataResult;
  }

  async onCustUpFileUploader(fileUploader: DxFileUploaderComponent): Promise<void> {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = fileUploader.value[0];

    if (!file) {
      return;
    }

    let sheetContentList = [];
    reader.onload = async (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      sheetContentList = mapData.main;
      sheetContentList = sheetContentList.slice(1);

      /** 1. key 및 value trim해야함.
       * 2. 데이터 유효성 검사
       * */
      for (const row of sheetContentList) {
        // 키값 trim
        for (const key of Object.keys(row)) {
          const newKey = String(key).trim();
          row[newKey] = row[key];
          delete row[key];
        }
        // 데이터 유효성검사 및 수정
        const result = this.rowValidation(row);
      }
      this.setRowNumber(sheetContentList);
      this.custUpEntityStore = new ArrayStore({
        data: sheetContentList,
        key: 'No'
      });

      this.custUpDataSource = new DataSource({
        store: this.custUpEntityStore
      });

      this.custUpDataSource.reload();

    };
    reader.readAsBinaryString(file);
  }

  onCustUpResetFileUploader(fileUploader: DxFileUploaderComponent): void {
    this.custUpEntityStore.clear();
    this.custUpDataSource.reload();

    fileUploader.instance.reset();

    this.custUpEntityStore = new ArrayStore({
      data: [], key: 'uid'
    });

    this.custUpDataSource = new DataSource({
      store: this.custUpEntityStore
    });
  }

  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('serialTemplete', '양식다운로드'),
        onClick: this.downloadExcel.bind(this)
      }
    });
    e.toolbarOptions.items = newToolbarItems;
  }

  async downloadExcel(): Promise<void> {
    this.service.download();
  }

  // 전자계약 버튼 이벤트
  async onViewReportElecCont(): Promise<void> {

    const idx = this.exptGrid.focusedRowIndex;
    const uid = this.exptGrid.instance.cellValue(idx, 'reportid');
    const arrCont_no = this.exptGrid.instance.cellValue(idx, 'cont_no');
    const arrCust_cd = this.exptGrid.instance.cellValue(idx, 'cust_cd');
    const sign_stat = this.exptGrid.instance.cellValue(idx, 'sign_stat');

    this.tabs = [];

    const reportData = this.reportData as any;

    if (uid) {
      reportData.uid = uid;
      reportData.arrCont_no = arrCont_no;
      reportData.arrCust_cd = arrCust_cd;
      reportData.sign_stat = sign_stat;

      let evalUrl;

      const result = await this.reportService.getFull(reportData);

      if (result.success) {
        const resultData = result.data;
        const reportSet = result.data.reportDetailList;

        // 2차서명
        let url1 = '_final';
        let url2 = 'jrf';
        let footerIdx = 3;
        let finalFooterIdx = 1;

        // 서명대기
        if (Number(sign_stat) === 1) {
          url1 = '1';
          url2 = 'jef';
          footerIdx = 1;
          // 1차서명
        } else if (Number(sign_stat) === 2) {
          url1 = '2';
          url2 = 'jef';
          footerIdx = 2;
        }

        let headerIdx;
        let bodyIdx;
        let cnt = 0;

        for (const idxData of reportSet) {
          if (idxData.dataSet === 'DataSet0') {
            headerIdx = cnt;
          }
          if (idxData.dataSet === 'DataSet1') {
            bodyIdx = cnt;
          }

          console.log(idxData.path.substring(idxData.path.length - 1));
          // @ts-ignore
          if (idxData.dataSet === 'DataSet2' && idxData.path.substring(idxData.path.length - 1) === String(footerIdx)) {
            finalFooterIdx = cnt;
          }
          cnt++;
        }

        // Header
        const evalValue = eval(reportSet[0].apiParam);

        const headerObj = {
          dataSet: reportSet[headerIdx].dataSet         // report file안에 dataset 명
          , node: reportSet[headerIdx].node          // api response data node 명
          , path: reportSet[headerIdx].path          // api request url
          , apiParam: JSON.parse(evalValue)
        };
        // Body
        const bodyObj = {
          dataSet: reportSet[bodyIdx].dataSet
          , node: reportSet[bodyIdx].node
          , path: reportSet[bodyIdx].path
          , apiParam: JSON.parse(evalValue)
        };

        // Footer (서명란)
        const footerObj = {
          dataSet: reportSet[finalFooterIdx].dataSet
          , node: reportSet[finalFooterIdx].node
          , path: reportSet[finalFooterIdx].path
          , apiParam: JSON.parse(evalValue)
        };

        this.tabs.push(headerObj);
        this.tabs.push(bodyObj);
        this.tabs.push(footerObj);
        evalUrl = eval(resultData.url).toString();

        this.utilService.openViewReport(evalUrl, this.tabs, false, 0, 'SL');

      } else {
        let msg = '선택된 계약번호가 없습니다.';
        if (this.utilService.getLanguage() !== 'ko') {
          msg = 'There is no checked contract number.';
        }
        this.utilService.notify_error(msg);
        return;
      }
    }
  }

  onGbChanged(e): void {
    if (this.gbChanged) {
      this.gbChanged = false;
      return;
    }
    if (!e) {
      return;
    }
    if (!e.event) {
      return;
    }

    if (this.popupModeExpt === 'Add') {
      this.contGb = e.value;
      if (this.popupGrid.instance.getVisibleRows().length > 0) {
        this.gbChanged = true;
        this.popupFormExpt.instance.getEditor('cont_gb').option('value', e.previousValue);
        this.utilService.notify_error(this.utilService.convert('품목이 있는 경우 계약구분을 변경할 수 없습니다.'));
        return;
      }

      if (e.value === '1') {
        this.rent_visible = false;
        this.popupFormExpt.instance.getEditor('impt_cd').option('value', '');
        this.popupFormExpt.instance.getEditor('dely_rate').option('value', '0');
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('value', '0');
        this.popupFormExpt.instance.getEditor('expt_vat').option('value', '0');
        this.popupFormExpt.instance.getEditor('std_rate').option('value', '0');
        this.popupFormExpt.instance.getEditor('impt_cd').option('disabled', true);
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('disabled', true);
      } else if (e.value === '2') {
        this.rent_visible = true;
        this.popupFormExpt.instance.getEditor('dely_rate').option('value', '0');
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('value', '0');
        this.popupFormExpt.instance.getEditor('expt_vat').option('value', '0');
        this.popupFormExpt.instance.getEditor('std_rate').option('value', '0');
        this.popupFormExpt.instance.getEditor('impt_cd').option('disabled', false);
        this.popupFormExpt.instance.getEditor('cont_rental_period').option('disabled', false);
      }
    }
  }

  async mapService(country: string, addr: string): Promise<object> {
    let result;
    if (country === 'KR') {
      result = await this.naverMapApiService(addr);
    } else {
      result = await this.googleMapApiService(addr);
    }
    return result;
  }

  async naverMapApiService(addr: string): Promise<any> {
    return new Promise((resolve) => {
      const resultObj = {
        msg: '',
        result: false,
        data: {
          roadAddress: '',
          englishAddress: '',
          zip: '',
          lat: '',
          long: ''
        }
      };
      // @ts-ignore
      naver.maps.Service.geocode({
        query: addr
      }, async (status, response) => {
        // @ts-ignore
        if (status !== naver.maps.Service.Status.OK) {
          resultObj.msg = this.utilService.convert('com_search_result_fail');
          resultObj.data = null;
          resolve(resultObj);
        } else {
          const result = response.v2; // 검색 결과의 컨테이너
          const items = result.addresses; // 검색 결과의 배열

          if (items.length === 1) {

            let zipCode = '';
            for (const addrElement of items[0].addressElements) {
              if (addrElement.types.includes('POSTAL_CODE')) {
                zipCode = addrElement.longName;
              }
            }
            if (!zipCode) {
              resultObj.msg = this.utilService.convert('com_txt_addr_search_error');
              resultObj.data = null;
              resolve(resultObj);
            } else {
              resultObj.msg = this.utilService.convert('com_txt_addr_search_success');
              resultObj.result = true;
              resultObj.data.roadAddress = items[0].roadAddress;
              resultObj.data.englishAddress = items[0].englishAddress;
              resultObj.data.zip = zipCode;
              resultObj.data.lat = items[0].y;
              resultObj.data.long = items[0].x;
              resolve(resultObj);
            }
          } else {
            resultObj.msg = this.utilService.convert('com_txt_addr_search_error');
            resultObj.data = null;
            resolve(resultObj);
          }
        }
      });
    });
  }

  async googleMapApiService(addr: string): Promise<any> {
    return new Promise((resolve) => {
      const resultObj = {
        msg: '',
        result: false,
        data: {
          roadAddress: '',
          englishAddress: '',
          zip: '',
          lat: 0,
          long: 0
        }
      };
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        address: addr,
      }, (results, status) => {
        if (status === 'OK') {
          if (results.length === 1) {

            let zipCode = '';
            for (const addrElement of results[0].address_components) {
              if (addrElement.types.includes('postal_code')) {
                zipCode = addrElement.long_name;
              }
            }

            if (!zipCode) {
              resultObj.msg = this.utilService.convert('com_search_result_fail');
              resultObj.data = null;
              resolve(resultObj);
            } else {
              resultObj.msg = this.utilService.convert('com_txt_addr_search_success');
              resultObj.result = true;
              resultObj.data.roadAddress = results[0].formatted_address;
              resultObj.data.englishAddress = results[0].formatted_address;
              resultObj.data.zip = zipCode;
              resultObj.data.lat = results[0].geometry.location.lat();
              resultObj.data.long = results[0].geometry.location.lng();
              resolve(resultObj);
            }
          } else {
            resultObj.msg = this.utilService.convert('com_txt_addr_search_error');
            resultObj.data = null;
            resolve(resultObj);
          }
        } else {
          resultObj.msg = this.utilService.convert('com_search_result_fail');
          resultObj.data = null;
          resolve(resultObj);
        }
      });
    });
  }

  async comfirmAddress(target: string): Promise<any> {
    let addr;
    let apiResult;
    if (target === 'address') {
      addr = this.searchAddress.getInputValue();
      apiResult = await this.mapService(this.popupFormData.country, addr);
      if (apiResult.result) {
        this.searchAddress.setInputValue(apiResult.data.roadAddress);  // 전체 주소
        this.popupFormData.eng_biz_adr1 = apiResult.data.englishAddress;  // 영문주소
        this.popupFormData.zip_no = apiResult.data.zip;
        this.popupFormData.lat = apiResult.data.lat;
        this.popupFormData.long = apiResult.data.long;
      } else {
        apiResult.msg = this.utilService.convert('com_search_result_fail');
        this.utilService.notify_error(apiResult.msg);
      }
    } else {
      addr = this.searchWhAddress.getInputValue();
      apiResult = await this.mapService(this.popupFormData.wh_country, addr);
      if (apiResult.result) {
        this.searchWhAddress.setInputValue(apiResult.data.roadAddress);  // 전체 주소
        this.popupFormData.wh_eng_biz_adr1 = apiResult.data.englishAddress;  // 영문주소
        this.popupFormData.wh_zip_no = apiResult.data.zip;
        this.popupFormData.wh_lat = apiResult.data.lat;
        this.popupFormData.wh_long = apiResult.data.long;
      } else {
        apiResult.msg = this.utilService.convert('com_search_result_fail');
        this.utilService.notify_error(apiResult.msg);
      }
    }
  }

  async onCopy(): Promise<void> {
    this.deleteBtn.visible = false;

    this.popupForm.instance.getEditor('cust_cd').option('value', '');

    this.popupMode = 'Add';

  }

  // phone 양식 커서 위치
  focusIn(e: any): void {
    let len = 1;
    const textValue = e.component._textValue?.trimEnd();
    if (textValue && textValue.charAt(textValue.length - 1) !== ')') {
      len = textValue.length + 1;
    } else {
      len = e.component._value?.trimEnd().length + 1;
    }

    e.element.children[1].children[0].children[0].onclick = () => {
      if (e.element.children[1].children[0].children[0].selectionStart < textValue.length) {

      } else {
        e.element.children[1].children[0].children[0].selectionStart = len || 1;
        e.element.children[1].children[0].children[0].selectionEnd = len || 1;
      }
    };
  }

  async deleteClickBom(): Promise<void> {

    if (this.bomPopupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.bomPopupGrid.focusedRowIndex;
      const instance = this.bomPopupGrid.instance;
      this.bomPopupGrid.instance.deleteRow(focusedIdx);
      // this.bomPopupGrid.instance.getDataSource().store().remove(this.bomPopupGrid.focusedRowKey);
      this.bomPopupGrid.instance.getDataSource().store().push([{type: 'remove', key: this.bomPopupGrid.focusedRowKey}]);
      // console.log('this.bomPopupGrid.dataSource', this.bomPopupGrid.dataSource.store().remove(''));
      // this.dataSource
      // this.bomPopupGrid.editing.changes.push({type: 'remove', key: this.popupGrid.focusedRowKey});
      // this.entityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);
      this.bomPopupGrid.focusedRowIndex = focusedIdx - 1;
      // await this.bomPopupGrid.instance.refresh();
    }
  }

  async customCollectGridData(rows: any): Promise<any> {
    const gridList = [];

    for (const row of rows) {
      gridList.push(row.data);
    }
    return gridList;
  }

  bomPopupCancelClick(e): void {
    this.bomPopup.visible = false;
  }

  onFocusedCellChangedBomPopup(e): void {
    this.setFocusRow(this.bomPopupGrid, e.rowIndex);
  }

  addClickBom(): void {

    this.bomPopupGrid.instance.addRow().then(r => {
      const changes = this.bomPopupGrid.editing.changes;
      const rowIdx = this.bomPopupGrid.instance.getRowIndexByKey(changes[changes.length - 1].key);
      this.setFocusRow(this.bomPopupGrid, rowIdx);
    });
  }

  onHiddenBomPopup(e): void {
    this.bomPopupForm.formData = {};
    this.bomPopupGrid.dataSource = this.setGridDataSource([], this.bomKey);
    this.bomPopupGrid.instance.cancelEditData();
  }

  // 품목 선택시 금액 표시
  onChagedItemCd(e): void {
    // const filtered = this.dsItemcode.filter((el) => el.cd === e.value);
    //
    // if (filtered.length > 0) {
    //   this.popupForm.instance.getEditor('sale_krw_pr').option('value', filtered[0].sale_krw_pr);
    //   this.popupForm.instance.getEditor('sale_usd_pr').option('value', filtered[0].sale_usd_pr);
    // } else {
    //   this.popupForm.instance.getEditor('sale_krw_pr').option('value', null);
    //   this.popupForm.instance.getEditor('sale_usd_pr').option('value', null);
    // }
  }

  setGridDataSource(data: any[], key: any): any {

    return new DataSource({
      store: new ArrayStore({data, key})
    });
  }

  bomPopupSaveClick(e): void {
    const rows = this.bomPopupGrid.instance.getVisibleRows();
    const cont_gb = this.popupFormDataExpt.cont_gb;
    const tot = rows.reduce((acc, el) => {

      if (cont_gb === '1') {
        return acc + (el.data.cont_pr * el.data.qty);
      } else {
        return acc + (el.data.rent_day_pr * el.data.qty);
      }
    }, 0);


    if (cont_gb === '1') {

      if (tot !== this.bomPopupForm.formData.cont_pr_tot) {
        this.bomPopupForm.formData.cont_dt_pr_tot = tot;
        this.utilService.notify_error(this.utilService.convert1('계약단가가 맞지않습니다.', '계약단가가 맞지않습니다.'));
        return;
      } else {

        this.customCollectGridData(rows).then(result => {
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'bom', result);
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'checkBom', 'Y');
          this.bomPopup.visible = false;
        });
      }
    } else {

      if (tot !== this.bomPopupForm.formData.cont_pr_tot) {
        this.bomPopupForm.formData.cont_dt_pr_tot = tot;
        this.utilService.notify_error(this.utilService.convert1('렌트일단가가 맞지않습니다.', '렌트일단가가 맞지않습니다.'));
        return;
      } else {

        this.customCollectGridData(rows).then(result => {
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'bom', result);
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'checkBom', 'Y');
          this.bomPopup.visible = false;
        });
      }
    }
  }

  isButtonVisible(e): boolean {
    return e.row.data.set_item_yn === 'Y';
  }

  /**
   * 세트 상품일 경우 모듈 팝업 호출
   */
  async onBomPopupOpen(e, data): Promise<void> {
    const cont_gb = this.popupFormDataExpt.cont_gb;
    const contPr = this.popupGrid.instance.cellValue(data.rowIndex, 'cont_pr'); // 계약단가
    const rentDayPr = this.popupGrid.instance.cellValue(data.rowIndex, 'rent_day_pr');  // 렌트일단가
    if (cont_gb === '1') {
      if (contPr <= 0) {
        this.utilService.notify_error(this.utilService.convert1('계약단가를 입력해주세요.', '계약단가를 입력해주세요.'));
        return;
      }
    } else {
      if (rentDayPr <= 0) {
        this.utilService.notify_error(this.utilService.convert1('렌트일단가를 입력해주세요.', '렌트일단가를 입력해주세요.'));
        return;
      }
    }

    this.bomPopup.visible = true;

    this.changeColumn(this.popupFormDataExpt.cont_gb);
    this.bomPopupForm.formData.item_cd = this.popupGrid.instance.cellValue(data.rowIndex, 'item_cd');

    if (cont_gb === '1') {
      this.bomPopupForm.formData.cont_pr_tot = _.cloneDeep(contPr);
    } else {
      this.bomPopupForm.formData.cont_pr_tot = _.cloneDeep(rentDayPr);
    }

    this.popupGrid.instance.cellValue(data.rowIndex, 'checkBom', '');

    if (!!data.data.bom && data.data.bom.length > 0) {
      this.bomPopupGrid.dataSource = this.setGridDataSource(data.data.bom, this.bomKey);
    } else {

      this.service.sendPost(data.data, 'mainInfo').then(result => {
        const detailList = result.data.sasd040DetailList;
        detailList.map(el => {
          el.sub_item_cd = el.m_item_cd;
          el.qty = el.c_qty;
          el.cont_pr = el.sale_krw_pr;
          el.rent_day_pr = el.sale_krw_pr;
        });
        this.bomPopupGrid.dataSource = this.setGridDataSource(detailList, this.bomKey);
      });
    }
  }

  changeColumn(type): void {
    // [{cd: "1", nm: this.utilService.convert('sales.sale')},
    //  {cd: "2", nm: this.utilService.convert('sales.rent')}]
    this.visibleColumn = type === '2' ? true : false;
  }

  setTabGridHeight(tab, grid): void {
    const gridTop = grid.element.nativeElement.offsetTop;
    grid.height = tab.height - gridTop - 55;
  }
}
