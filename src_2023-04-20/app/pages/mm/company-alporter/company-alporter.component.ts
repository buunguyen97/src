import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CompanyAlporterService} from './company-alporter.service';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {BizCodeService} from '../../../shared/services/biz-code.service';
import _ from 'lodash';
import {CompanySearchVO} from '../company/company.service';

@Component({
  selector: 'app-company-alporter',
  templateUrl: './company-alporter.component.html',
  styleUrls: ['./company-alporter.component.scss']
})
export class CompanyAlporterComponent implements OnInit, AfterViewInit {
  // Form
  @ViewChild('searchForm', {static: false}) searchForm: DxFormComponent;
  @ViewChild('searchForm2', {static: false}) searchForm2: DxFormComponent;
  @ViewChild('searchForm3', {static: false}) searchForm3: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;

  // Popup
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupForm2', {static: false}) popupForm2: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('deleteBtn2', {static: false}) deleteBtn2: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('saveBtn2', {static: false}) saveBtn2: DxButtonComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('newBtn', {static: false}) newBtn: DxButtonComponent;


  // Global
  G_TENANT: any;
  vTENANT: any;
  rowData: any;
  rowDataPopup: any;

  // Form
  searchFormData = {};
  searchFormData2 = {};

  // Grid
  dataSource: DataSource;
  dataSource2: DataSource;
  entityStore: ArrayStore;
  entityStore2: ArrayStore;
  selectedRows: number[];
  selectedRows2: number[];
  key = 'uid';
  data: any;
  addFlg = false;
  mainCount: any;
  detailCount: any;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupMode2 = 'Add';
  popupFormData: any;
  popupFormData2: any;
  firstPopupData = '';
  bizNoCnt: any;
  dunsNoCnt: any;
  mBizNoCnt: any;

  // PopupMap
  autocomplete: any;
  autocomplete2: any;
  autoCompleteAddressFlg = false;
  autoCompleteAddressFlg2 = false;
  selectedAddress1 = '';
  selectedAddress2 = '';
  options = {
    componentRestrictions: {countrycd: ''},
    fields: ['address_components', 'geometry', 'name'],
    strictBounds: false,
    types: ['geocode', 'establishment']
  };
  bizAdr: any;

  // PopupGrid
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  // PopupChanges
  changes = [];

  // dataSet
  dsCountry = [];	// 국가
  dsBizGb = [];		// 사업자구분
  dsSex = [];		// 성별
  dsCont = [];		// 계약담당사
  dsPtrn = [];		// 물류파트너사
  dsAccount = [];	// 회계처리사
  dsAccountSys = []; // 회계처리시스템

  dsActFlg = [];	// 사용여부
  dsMonyUnit = [];	// 화폐단위
  dsItem = []; 		// 품목코드

  dsWarehouseId = [];
  dsUser = [];
  dsLocId = [];

  GRID_STATE_KEY = 'company_alporter';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  phonePattern: any = /^[0-9|\+|\)|-]+$/;

  phoneChangeFlg = false;
  phoneChangeFlg2 = false;
  checkFlg = false;

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
    getInputComp: () => {
      return document.getElementsByName('corpAddress1').item(0) as HTMLInputElement;
    },
    resetInput: () => {
      this.searchAddress.getInputComp().value = '';
    },
    setInputValue: (value: string) => {
      this.searchAddress.getInputComp().value = value;
    },
    getInputValue: () => {
      return this.searchAddress.getInputComp().value;
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
    getInputComp: () => {
      return document.getElementsByName('address1').item(0) as HTMLInputElement;
    },
    resetInput: () => {
      this.searchWhAddress.getInputComp().value = '';
    },
    setInputValue: (value: string) => {
      this.searchWhAddress.getInputComp().value = value;
    },
    getInputValue: () => {
      return this.searchWhAddress.getInputComp().value;
    }
  };

  constructor(
    public utilService: CommonUtilService,
    private service: CompanyAlporterService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
    public bizService: BizCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.onPopupSave = this.onPopupSave.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    // this.allowEditing = this.allowEditing.bind(this);
    this.onChangedCountry = this.onChangedCountry.bind(this);
    this.onChangedCountrycd = this.onChangedCountrycd.bind(this);
    this.initMap = this.initMap.bind(this);
    this.onLwhChanged = this.onLwhChanged.bind(this);

    this.getFilteredLocId = this.getFilteredLocId.bind(this);
    this.isAllowEditing = this.isAllowEditing.bind(this);
    this.addClick = this.addClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.onChangedBsNo = this.onChangedBsNo.bind(this);
    this.onChangedDunsNo = this.onChangedDunsNo.bind(this);
    this.onChangedBizNoSub = this.onChangedBizNoSub.bind(this);
  }

  // 화면 생성 된 후 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();

    this.initCode();

    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.dataSource = new DataSource({
      store: this.entityStore
    });

    this.entityStore2 = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSource2 = new DataSource({
      store: this.entityStore2
    });
  }

  ngAfterViewInit(): void {
    this.searchAddress.initPacComp();
    this.searchWhAddress.initPacComp();


    this.utilService.getFoldable(this.searchForm, this.foldableBtn);
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);

    // 관리자 계정일 경우 신규 버튼 보이기
    // this.newBtn.visible = this.utilService.isAdminUser();

    const pacComp = document.getElementsByClassName('pac-container pac-logo');
    for (let i = 0; i < pacComp.length; i++) {
      if (pacComp.item(i)) {
        pacComp.item(i).remove();
      }
    }
    this.searchForm.instance.getEditor('company').focus();
    // this.utilService.getGridHeight(this.subGrid);
  }


  initCode(): void {

    // // 국가
    // this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
    //   this.dsCountry = result.data;
    // });

    // 국가
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
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

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 품목코드
    this.bizService.getItem(this.G_TENANT, 'N', 'Y', '', '', '').subscribe(result => {
      this.dsItem = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      // this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 입고대기로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocId = result.data;
    });

  }

  // 그리드 포커스
  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(grid, e.rowIndex);
  }

  onFocusedRowChanging(e): void {
    this.initGrid();
    if (e.rowIndex < 0 || !e.row) {
      return;
    } else {
      this.rowData = e.row.data;
      // this.onSubSearch(this.rowData);
    }
  }

  initGrid(): void {
    this.initGrid2();
  }

  initGrid2(): void {
    this.entityStore2 = new ArrayStore({
      data: [],
      key: this.key
    });

    this.dataSource2 = new DataSource({
      store: this.entityStore2
    });
  }

  // 기본 주소지 정보 복사
  async onLwhChanged(): Promise<void> {
    this.checkFlg = true;

    const bizAdr2 = this.popupForm.instance.getEditor('corpAddress2').option('value');
    const engBizAdr1 = this.popupForm.instance.getEditor('engCorpAddress1').option('value');
    const engBizAdr2 = this.popupForm.instance.getEditor('engCorpAddress2').option('value');
    const lat = this.popupForm.instance.getEditor('corpLat').option('value');
    const long = this.popupForm.instance.getEditor('corpLong').option('value');
    const corpZip = this.popupForm.instance.getEditor('corpZip').option('value');

    // const telNo = this.popupForm.instance.getEditor('phone1').option('value');
    // const faxNo = this.popupForm.instance.getEditor('fax_no').option('value');
    const chgNm = this.popupForm.instance.getEditor('corpName').option('value');
    const chgEmail = this.popupForm.instance.getEditor('corpEmail').option('value');
    const chgFax = this.popupForm.instance.getEditor('corpFax').option('value');
    const chgTelNo = this.popupForm.instance.getEditor('corpPhone').option('value');
    const chgTelNo1 = this.popupForm.instance.getEditor('corpPhone1').option('value');
    const chgHpNo = this.popupForm.instance.getEditor('corpPhone2').option('value');
    const corpCountry = this.popupForm.instance.getEditor('corpCountry').option('value');
    const input = document.getElementsByName('corpAddress1').item(0) as HTMLInputElement;

    if (this.popupForm && this.popupForm.instance.getEditor('check').option('value') === true) {
      this.popupForm.instance.getEditor('address1').option('value', input.value);
      this.popupForm.instance.getEditor('address2').option('value', bizAdr2);
      this.popupForm.instance.getEditor('engAddress1').option('value', engBizAdr1);
      this.popupForm.instance.getEditor('engAddress2').option('value', engBizAdr2);
      this.popupForm.instance.getEditor('gps_lat').option('value', lat);
      this.popupForm.instance.getEditor('gps_long').option('value', long);
      this.popupForm.instance.getEditor('zip').option('value', corpZip);
      // this.popupForm.instance.getEditor('wh_tel_no').option('value', telNo);
      // this.popupForm.instance.getEditor('wh_fax_no').option('value', faxNo);
      this.popupForm.instance.getEditor('refName').option('value', chgNm);
      this.popupForm.instance.getEditor('fax1').option('value', chgFax);
      this.popupForm.instance.getEditor('email').option('value', chgEmail);
      this.popupForm.instance.getEditor('whPhone').option('value', chgTelNo);
      this.popupForm.instance.getEditor('phone1').option('value', chgTelNo1);
      this.popupForm.instance.getEditor('phone2').option('value', chgHpNo);
      this.popupForm.instance.getEditor('countrycd').option('value', corpCountry);

      // this.popupForm.instance.getEditor('wh_chg_hp_no').option('value', chgHpNo);
    } else {

      if (this.checkFlg === true && this.popupForm.instance.getEditor('check').option('value') !== undefined) {
        this.popupForm.instance.getEditor('zip').option('value', '');
        this.popupForm.instance.getEditor('address1').option('value', '');
        this.popupForm.instance.getEditor('address2').option('value', '');
        this.popupForm.instance.getEditor('engAddress1').option('value', '');
        this.popupForm.instance.getEditor('engAddress2').option('value', '');
        this.popupForm.instance.getEditor('gps_lat').option('value', '');
        this.popupForm.instance.getEditor('gps_long').option('value', '');
        this.popupForm.instance.getEditor('refName').option('value', '');
        this.popupForm.instance.getEditor('fax1').option('value', '');
        this.popupForm.instance.getEditor('email').option('value', '');
        this.popupForm.instance.getEditor('whPhone').option('value', '');
        this.popupForm.instance.getEditor('phone1').option('value', '');
        this.popupForm.instance.getEditor('phone2').option('value', '');
        this.popupForm.instance.getEditor('countrycd').option('value', '');

        this.checkFlg = false;
      }
    }
  }

  async onBizNoCheck(): Promise<void> {
    this.bizNoCnt = 0;

    if (this.popupForm.instance.getEditor('bsNo').option('value') === ''
      || this.popupForm.instance.getEditor('bsNo').option('value') === null) {
      const msg = '사업자번호를 입력해주세요.';
      this.utilService.notify_error(msg);
      this.bizNoCnt = 0;
      return;
    }

    const resultCount = await this.service.bizNoCount(this.popupFormData);

    if (resultCount.success) {
      if (resultCount.data > 0) {
        const msg = '이미 존재하는 사업자번호입니다.';
        this.utilService.notify_error(msg);
        this.bizNoCnt = 0;
        return;
      } else {
        const msg = '사용 가능한 사업자번호입니다.';
        this.utilService.notify_success(msg);
        this.bizNoCnt = 1;
      }
    } else {
      this.utilService.notify_error(resultCount.msg);
    }
  }

  async onDunsNoCheck(): Promise<void> {
    // const resultCount = await this.popupFormData.dunsNo();
    this.dunsNoCnt = 1;
    if (this.popupForm.instance.getEditor('dunsNo').option('value') === ''
      || this.popupForm.instance.getEditor('dunsNo').option('value') === null) {
      const msg = 'DUNS NO를 입력해주세요.';
      this.utilService.notify_error(msg);
      this.dunsNoCnt = 0;
      return;
    }

    const resultCount = await this.service.dunsNoCount(this.popupFormData);

    if (resultCount.success) {
      if (resultCount.data > 0) {
        const msg = '이미 존재하는 DUNS NO입니다.';
        this.utilService.notify_error(msg);
        this.dunsNoCnt = 0;
        return;
      } else {
        const msg = '사용 가능한 DUNS NO입니다.';
        this.utilService.notify_success(msg);
        this.dunsNoCnt = 1;
      }
    } else {
      this.utilService.notify_error(resultCount.msg);
    }
  }

  async onMBizCheck(): Promise<void> {
    this.mBizNoCnt = 0;

    if (this.popupForm.instance.getEditor('bizNoSub').option('value') === ''
      || this.popupForm.instance.getEditor('bizNoSub').option('value') === null) {
      const msg = '종사업장번호를 입력해주세요.';
      this.utilService.notify_error(msg);
      this.mBizNoCnt = 0;
      return;
    }
    console.log(this.popupFormData);
    const resultCount = await this.service.mBizNoCount(this.popupFormData);

    if (resultCount.success) {
      if (resultCount.data > 0) {
        const msg = '이미 존재하는 종사업장번호입니다.';
        this.utilService.notify_error(msg);
        this.mBizNoCnt = 0;
        return;
      } else {
        const msg = '사용 가능한 종사업장번호입니다.';
        this.utilService.notify_success(msg);
        this.mBizNoCnt = 1;
      }
    } else {
      this.utilService.notify_error(resultCount.msg);
    }
  }

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
      const searchData = _.cloneDeep(this.searchFormData) as CompanySearchVO;

      searchData.isCarrier = this.searchForm.instance.getEditor('isCarrier').option('value') === true ? 1 : 0;
      searchData.isCustomer = this.searchForm.instance.getEditor('isCustomer').option('value') === true ? 1 : 0;
      searchData.isEtc = this.searchForm.instance.getEditor('isEtc').option('value') === true ? 1 : 0;
      searchData.isOwner = this.searchForm.instance.getEditor('isOwner').option('value') === true ? 1 : 0;
      searchData.isShipTo = this.searchForm.instance.getEditor('isShipTo').option('value') === true ? 1 : 0;
      searchData.isSupplier = this.searchForm.instance.getEditor('isSupplier').option('value') === true ? 1 : 0;
      searchData.isWarehouse = this.searchForm.instance.getEditor('isWarehouse').option('value') === true ? 1 : 0;

      const result = await this.service.get(searchData);

      // const result = await this.service.mainList(this.searchFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      } else {
        return;
      }

      // if (!result.success) {
      //   return;
      //
      // } else {
      //
      //   this.mainGrid.instance.cancelEditData();
      //
      //   this.entityStore = new ArrayStore({
      //     data: result.data,
      //     key: this.key
      //   });
      //
      //   this.dataSource = new DataSource({
      //     store: this.entityStore
      //   });
      //
      //   this.mainGrid.focusedRowKey = null;
      //   this.mainGrid.paging.pageIndex = 0;
      //
      //   const keys = this.mainGrid.instance.getSelectedRowKeys();
      //   this.mainGrid.instance.deselectRows(keys);
      // }
    }
  }

  // // 거래처정보 셀 클릭 시 계약정보 조회
  // async onSubSearch(vo): Promise<void> {
  //   if (this.addFlg || !vo.cust_cd) {
  //     this.addFlg = false;
  //     return;
  //   }
  //
  //   const result = await this.service.detailList(vo);
  //
  //   if (!result.success) {
  //     return;
  //   } else {
  //     this.subGrid.instance.cancelEditData();
  //     this.entityStore2 = new ArrayStore({
  //       data: result.data,
  //       key: this.key
  //     });
  //
  //     this.dataSource2 = new DataSource({
  //       store: this.entityStore2
  //     });
  //
  //     this.subGrid.focusedRowKey = null;
  //     this.subGrid.paging.pageIndex = 0;
  //
  //     const keys = this.subGrid.instance.getSelectedRowKeys();
  //     this.subGrid.instance.deselectRows(keys);
  //   }
  // }

  // 초기화 버튼 클릭 시 검색영역 초기화
  async onReset(): Promise<void> {
    await this.searchForm.instance.resetValues();
    await this.initForm();
  }

  // 초기화 후 기본 값 셋팅
  initForm(): void {
    this.searchForm.instance.getEditor('actFlg').option('value', 'Y');
    this.searchForm.instance.getEditor('company').focus();
  }


  // ***** Popup Comm *****//

  // 신규
  async onNew(e): Promise<void> {
    // 관리자 계정이 아닐 경우 생성 불가
    if (!this.utilService.isAdminUser()) {
      this.utilService.notify_error('신규 생성 권한이 없습니다.');
      return;
    }
    // this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
    this.popupFormData2 = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
  }

  // ***** CustMst Popup ***** //

  // 팝업 열기
  async onPopupOpen(e): Promise<void> {
    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });
    this.popup.visible = true;
    this.phoneChangeFlg = false;
    this.checkFlg = false;
    if (e.element.id === 'open') {
      // this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      await this.initMap();
      // this.deleteBtn.visible = this.utilService.isAdminUser();
      this.saveBtn.visible = this.utilService.isAdminUser();
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then(
        (r) => {
          this.popupForm.instance.getEditor('name').focus();
          // this.popupForm.instance.getEditor('address1').option('value', e.data.address1);
          // this.popupForm.instance.getEditor('address2').option('value', e.data.address2);
          // this.popupForm.instance.getEditor('engAddress1').option('value', e.data.engAddress1);
          // this.popupForm.instance.getEditor('engAddress2').option('value', e.data.engAddress2);
          // this.popupForm.instance.getEditor('gps_lat').option('value', '');
          // this.popupForm.instance.getEditor('gps_long').option('value', '');
        }
      );
    }

  }

  // 팝업 단건조회
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;

      this.popupEntityStore = new ArrayStore(
        {
          data: result.data.warehouseList,
          key: this.key
        }
      );

      this.popupDataSource = new DataSource({
        store: this.popupEntityStore
      });
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;
    } else {
      return;
    }
  }

  // 팝업 오픈 후 처리
  onPopupAfterOpen(): void {
    this.utilService.getPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    this.utilService.adjustFormHeightInPopup();

    // 관리자 권한이 아닌 경우 수정불가능
    const isDisabled = this.utilService.isAdminUser();
    for (const group of this.popupForm.items) {
      if (group.hasOwnProperty('items')) {
        // @ts-ignore
        for (const i of group.items) {
          if (i.hasOwnProperty('dataField')) {
            try {
              this.popupForm.instance.getEditor(i.dataField).option('disabled', !isDisabled && this.popupMode !== 'Add');
            } catch {
            }
          }
        }
      }
    }

    this.searchAddress.hidePacComp();
    this.searchWhAddress.hidePacComp();


    // 기본설정
    this.saveBtn.visible = true;
    // this.popupForm.instance.getEditor('company').option('disabled', true);
    if (this.popupMode === 'Add') {
      // this.popupForm.instance.getEditor('ptrnYn').option('value', 0);
      // this.popupForm.instance.getEditor('exptYn').option('value', 0);
      // this.popupForm.instance.getEditor('imptYn').option('value', 0);
      // this.popupForm.instance.getEditor('purYn').option('value', 0);
      this.popupForm.instance.getEditor('check').option('value', 0);
      // this.popupForm.instance.getEditor('check2').option('value', 0);
      // this.popupForm.instance.getEditor('bill_chg_tel_no').option('value', '');
      // this.popupForm.instance.getEditor('bill_chg_hp_no').option('value', '');
      this.popupForm.instance.getEditor('phone1').option('value', '');
      this.popupForm.instance.getEditor('fax1').option('value', '');
      this.popupForm.instance.getEditor('phone2').option('value', '');
      // this.popupForm.instance.getEditor('wh_chg_hp_no').option('value', '');
      this.bizNoCnt = 0;
      this.dunsNoCnt = 0;
      this.mBizNoCnt = 0;

      // this.popupForm.instance.getEditor('user_id').option('disabled',true);
      // this.popupForm.instance.getEditor('user_id').option('value',this.cookieService.get(APPCONSTANTS.TOKEN_USER_USERID_KEY))
      this.initMap();
    } else if (this.popupMode === 'Edit') {
      // this.popupForm.instance.getEditor('check').option('value', 0);
      // this.popupForm.instance.getEditor('check2').option('value', 0);
      this.popupForm.instance.getEditor('company').option('disabled', true);
      this.changedCountry(this.popupFormData.countrycd);

      this.bizNoCnt = 0;
      this.dunsNoCnt = 0;
      this.mBizNoCnt = 0;

      if (this.popupFormData.bizNoSub) {
        this.mBizNoCnt = 1;
      }
      if (this.popupFormData.dunsNo) {
        this.dunsNoCnt = 1;
      }
      if (this.popupFormData.bsNo) { // 사업장번호
        this.bizNoCnt = 1;
      }

      const input = document.getElementsByName('corpAddress1').item(0) as HTMLInputElement;
      input.value = this.popupFormData.corpAddress1;
      this.autoCompleteAddressFlg = true;

      const input2 = document.getElementsByName('address1').item(0) as HTMLInputElement;
      input2.value = this.popupFormData.address1;
      this.autoCompleteAddressFlg2 = true;
    }
  }

  // 팝업 입력 데이터 저장
  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      try {
        if (this.popupFormData.bsNo && this.bizNoCnt === 0) {
          const msg = '사업자번호 중복체크를 확인해주세요.';
          this.utilService.notify_error(msg);
          return;
        }

        if (this.popupFormData.dunsNo && this.dunsNoCnt === 0) {
          const msg = 'DUNS NO 중복체크를 확인해주세요.';
          this.utilService.notify_error(msg);
          return;
        }

        if (this.popupFormData.bizNoSub && this.mBizNoCnt === 0) {
          const msg = '종사업장번호 중복체크를 확인해주세요.';
          this.utilService.notify_error(msg);
          return;
        }

        let result;
        this.popupFormData.corpAddress1 = this.searchAddress.getInputValue();
        this.popupFormData.address1 = this.searchWhAddress.getInputValue();


        const saveContent = this.popupFormData as any;
        const detailList = this.collectGridData(this.changes);

        const addList = this.popupDataSource.items();

        const saveList = [];
        detailList.forEach(el => {
          const filtered = addList.filter(ee => ee.uid === el.uid);

          if (filtered.length > 0) {
            filtered[0].operType = el.operType;
            // 원본에 수정 데이터 삽입
            filtered[0].warehouseId = el.warehouseId ? el.warehouseId : filtered[0].warehouseId;
            filtered[0].uRcvIngLocId = el.uRcvIngLocId ? el.uRcvIngLocId : filtered[0].uRcvIngLocId;
            filtered[0].urcvIngLocId = el.urcvIngLocId ? el.urcvIngLocId : filtered[0].urcvIngLocId;
            filtered[0].badReturnLocId = el.badReturnLocId ? el.badReturnLocId : filtered[0].badReturnLocId;
            filtered[0].cancelLocId = el.cancelLocId ? el.cancelLocId : filtered[0].cancelLocId;
            filtered[0].sortLocId = el.sortLocId ? el.sortLocId : filtered[0].sortLocId;

            filtered[0].produceLocId = el.produceLocId ? el.produceLocId : filtered[0].produceLocId;
            filtered[0].finishedLocId = el.finishedLocId ? el.finishedLocId : filtered[0].finishedLocId;

            filtered[0].remarks = el.remarks ? el.remarks : filtered[0].remarks;

            saveList.push(filtered[0]);
          } else {
            saveList.push(el);
          }
        });

        // 저장하기 전 형변환
        saveContent.isCarrier = this.popupFormData.isCarrier === true ? 1 : 0;
        saveContent.isCustomer = this.popupFormData.isCustomer === true ? 1 : 0;
        saveContent.isEtc = this.popupFormData.isEtc === true ? 1 : 0;
        saveContent.isOwner = this.popupFormData.isOwner === true ? 1 : 0;
        saveContent.isShipTo = this.popupFormData.isShipTo === true ? 1 : 0;
        saveContent.isSupplier = this.popupFormData.isSupplier === true ? 1 : 0;
        saveContent.isWarehouse = this.popupFormData.isWarehouse === true ? 1 : 0;

        saveContent.ownerId = this.utilService.getCommonOwnerId();
        saveContent.warehouseList = saveList;

        if (this.popupMode === 'Add') {
          console.log(saveContent);
          result = await this.service.save(saveContent);
        } else {
          console.log(saveContent);
          result = await this.service.update(saveContent);
        }
        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    } else {
      const msg = '필수 입력 정보를 확인해주세요.';
      this.utilService.notify_error(msg);
      return;
    }
  }

  onChangedBsNo(): void {
    this.bizNoCnt = 0;
  }

  onChangedDunsNo(): void {
    this.dunsNoCnt = 0;
  }

  onChangedBizNoSub(): void {
    this.mBizNoCnt = 0;
  }

  // 팝업 호출 데이터 삭제
  async onPopupDelete(): Promise<void> {
    try {
      this.popupFormData.isCarrier = this.popupFormData.isCarrier === true ? 1 : 0;
      this.popupFormData.isCustomer = this.popupFormData.isCustomer === true ? 1 : 0;
      this.popupFormData.isEtc = this.popupFormData.isEtc === true ? 1 : 0;
      this.popupFormData.isOwner = this.popupFormData.isOwner === true ? 1 : 0;
      this.popupFormData.isShipTo = this.popupFormData.isShipTo === true ? 1 : 0;
      this.popupFormData.isSupplier = this.popupFormData.isSupplier === true ? 1 : 0;
      this.popupFormData.isWarehouse = this.popupFormData.isWarehouse === true ? 1 : 0;

      const result = await this.service.delete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
    this.checkFlg = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.getEditor('company').option('disabled', false);

    if (!!this.popupDataSource) {
      this.popupEntityStore.clear();
      this.popupDataSource.reload();
      this.popupGrid.instance.cancelEditData();
    }
    this.onSearch();
  }

  onChangedCountry(e): void {
    this.changedCountry(e.value);

    if (this.phoneChangeFlg) {
      const findCode = this.dsCountry.find(el => el.code === this.popupFormData.corpCountry);
      if (findCode) {
        // this.popupForm.instance.getEditor('phone1').option('value', '+' + findCode.etcColumn1 + ')');
        this.popupForm.instance.getEditor('corpPhone1').option('value', findCode.etcColumn1);
      }
    }
    this.phoneChangeFlg = true;
  }

  async changedCountry(country: string): Promise<void> {
    this.searchAddress.resetInput();  // 주소 초기화
    // this.searchWhAddress.resetInput();  // 주소 초기화

    // this.popupFormData.zip = '';  // 우편번호
    // this.popupFormData.gps_lat = '';  // 위도
    // this.popupFormData.gps_long = ''; // 경도

    // // 한국일 경우 네이버 지도 API호출
    // if (country === 'KR') {
    //   // 구글 API 초기화
    //   this.autocomplete = null;
    //   this.searchAddress.initPacComp();
    //   this.searchAddress.getInputComp().removeEventListener('change', this.searchAddress.resetInput);
    // } else {
    //   await this.initMap();
    //
    //   if (this.autocomplete) {
    //     if (country) {
    //       this.autocomplete.setComponentRestrictions({country});
    //     } else {
    //       this.autocomplete.setOptions(this.options);
    //     }
    //   }
    //
    //   this.searchAddress.showPacComp();
    // }
  }

  onChangedCountrycd(e): void {
    this.changedCountrycd(e.value);

    if (this.phoneChangeFlg2) {
      const findCode = this.dsCountry.find(el => el.code === this.popupFormData.countrycd);
      if (findCode) {
        this.popupForm.instance.getEditor('phone1').option('value', findCode.etcColumn1);
        // this.popupForm.instance.getEditor('corpPhone1').option('value', '+' + findCode.etcColumn1 + ')');
      }
    }
    this.phoneChangeFlg2 = true;
  }

  async changedCountrycd(country: string): Promise<void> {
    // this.searchAddress.resetInput();  // 주소 초기화
    this.searchWhAddress.resetInput();  // 주소 초기화
  }

  // 주소 입력 시 구글 Map Api 데이터 출력
  async initMap(): Promise<void> {
    // const input = this.searchAddress.getInputComp();
    //
    // if (!this.autocomplete) {
    //   this.autocomplete = await new google.maps.places.Autocomplete(input, this.options);
    //   this.autocomplete.addListener('place_changed', () => {
    //     const place = this.autocomplete.getPlace();
    //     if (!place.geometry || !place.geometry.location || !this.popupFormData.countrycd) {
    //       this.searchAddress.resetInput();
    //     }
    //
    //     const geo = place.geometry;
    //     // 좌표
    //     this.popupFormData.gps_lat = geo.location.lat();
    //     this.popupFormData.gps_long = geo.location.lng();
    //
    //     for (const addr of place.address_components) {
    //       if (addr.types.indexOf('postal_code') !== -1) {
    //         this.popupFormData.zip = addr.long_name;
    //       }
    //     }
    //   });
    //
    //   input.addEventListener('change', this.searchAddress.resetInput);
    // }
  }

  // ***** CustCont Popup ***** //

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // this.deleteBtn.visible = this.utilService.isAdminUser();
    this.saveBtn.visible = this.utilService.isAdminUser();
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};

    this.popupMode = popupMode;
    this.popupVisible = true;

    this.onSearchPopup();
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupFormData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getPopup(this.popupFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.warehouseList,
            key: this.key
          }
        );
        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });
        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  // // 팝업 오픈 후 처리
  // onPopupAfterOpen2(): void {
  //
  //   this.saveBtn2.visible = true;
  //
  //   this.popupForm2.instance.getEditor('name').option('value', this.rowData.name);
  //   this.popupForm2.instance.getEditor('name').option('disabled', true);
  //   this.popupForm2.instance.getEditor('contractYn').option('disabled', false);
  //   this.popupForm2.instance.getEditor('contractDate').option('disabled', false);
  //   this.popupForm2.instance.getEditor('ConstractDateStart').option('disabled', false);
  //   this.popupForm2.instance.getEditor('ContractDateEnd').option('disabled', false);
  //
  //   if (this.popupMode2 === 'Add') {
  //     this.popupForm2.instance.getEditor('contractYn').option('value', 'N');
  //   } else if (this.popupMode2 === 'Edit') {
  //     this.popupForm2.instance.getEditor('contractDate').option('disabled', true);
  //   }
  //
  //   if (this.rowData.use_yn === 'N' || this.popupForm2.instance.getEditor('contractYn').option('value') === 'Y') {
  //     this.saveBtn2.visible = false;
  //     this.deleteBtn2.visible = true;
  //
  //     this.popupForm2.instance.getEditor('name').option('disabled', true);
  //     this.popupForm2.instance.getEditor('contractYn').option('disabled', true);
  //     this.popupForm2.instance.getEditor('contractDate').option('disabled', true);
  //     this.popupForm2.instance.getEditor('ConstractDateStart').option('disabled', true);
  //     this.popupForm2.instance.getEditor('ContractDateEnd').option('disabled', true);
  //   }
  // }

  // 팝업 호출 데이터 삭제
  async popupDeleteClick(e): Promise<void> {

    if (this.utilService.isAdminUser() || this.popupMode === 'Add') {
      if (this.popupGrid.focusedRowIndex > -1) {
        this.popupGrid.instance.deleteRow(this.popupGrid.focusedRowIndex);
        this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);
      }
    }
  }

  // 닫기 클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm2.instance.resetValues();
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


  addClick(): void {
    if (this.utilService.isAdminUser() || this.popupMode === 'Add') {
      this.popupGrid.instance.addRow().then(r => {
        const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
        this.setFocusRow(this.popupGrid, rowIdx);
      });
    }
  }

  async deleteClick(): Promise<void> {
    if (this.utilService.isAdminUser() || this.popupMode === 'Add') {
      if (this.popupGrid.focusedRowIndex > -1) {
        const focusedIdx = this.popupGrid.focusedRowIndex;

        this.popupGrid.instance.deleteRow(focusedIdx);
        this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

        // 삭제된 로우 위로 포커스
        this.popupGrid.focusedRowIndex = focusedIdx - 1;
      }
    }
  }

  isAllowEditing(): boolean {
    return this.utilService.isAdminUser() || this.popupMode === 'Add';
  }

  // 창고선택시 로케이션 초기화
  setWarehouseValue(rowData: any, value: any): void {
    rowData.warehouseId = value;
    rowData.urcvIngLocId = null;
    rowData.badReturnLocId = null;
    rowData.cancelLocId = null;
    rowData.sortLocId = null;
  }

  // 그리드 Lookup filter
  getFilteredLocId(options): any {
    return {
      store: this.dsLocId,
      filter: options.data ? ['warehouseId', '=', options.data.warehouseId] : null
    };
  }

  collectGridData(changes: any): any[] {
    const gridList = [];

    // tslint:disable-next-line:forin
    for (const rowIndex in changes) {
      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      }
    }

    return gridList;
  }

  openMapLine(): void {
    window.open('https://www.geoplaner.com/', '_blank');
  }

  comfirmAddress(): void {
    const addr = this.searchAddress.getInputValue();

    if (this.popupFormData.countrycd === 'KR') {

      // @ts-ignore
      naver.maps.Service.geocode({
        query: addr
      }, (status, response) => {

        // @ts-ignore
        if (status !== naver.maps.Service.Status.OK) {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }

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
            this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
            return;
          }

          this.searchAddress.setInputValue(items[0].roadAddress);  // 전체 주소
          this.popupFormData.engCorpAddress1 = items[0].englishAddress;  // 영문주소
          this.popupFormData.corpZip = zipCode;
          this.popupFormData.corpLat = items[0].y;
          this.popupFormData.corpLong = items[0].x;
        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    } else {
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
              this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
              return;
            }

            this.searchAddress.setInputValue(results[0].formatted_address);  // 전체 주소
            this.popupFormData.engCorpAddress1 = results[0].formatted_address;  // 영문주소
            this.popupFormData.corpZip = zipCode; // 우편번호
            this.popupFormData.corpLat = results[0].geometry.location.lat();
            this.popupFormData.corpLong = results[0].geometry.location.lng();

          } else {
            this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
            return;
          }
        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    }
  }

  comfirmWhAddress(): void {
    const addr = this.searchWhAddress.getInputValue();

    if (this.popupFormData.countrycd === 'KR') {

      // @ts-ignore
      naver.maps.Service.geocode({
        query: addr
      }, (status, response) => {

        // @ts-ignore
        if (status !== naver.maps.Service.Status.OK) {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }

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
            this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
            return;
          }

          this.searchWhAddress.setInputValue(items[0].roadAddress);  // 전체 주소
          this.popupFormData.engAddress1 = items[0].englishAddress;  // 영문주소
          this.popupFormData.zip = zipCode;
          this.popupFormData.gps_lat = items[0].y;
          this.popupFormData.gps_long = items[0].x;
        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    } else {
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
              this.utilService.notify_error(this.utilService.convert1('정확한 주소를 입력하세요.', '정확한 주소를 입력하세요.'));
              return;
            }

            this.searchWhAddress.setInputValue(results[0].formatted_address);  // 전체 주소
            this.popupFormData.engAddress1 = results[0].formatted_address;  // 영문주소
            this.popupFormData.zip = zipCode;
            this.popupFormData.gps_lat = results[0].geometry.location.lat();
            this.popupFormData.gps_long = results[0].geometry.location.lng();

          } else {
            this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
            return;
          }
        } else {
          this.utilService.notify_error(this.utilService.convert1('검색결과가 존재하지 않습니다.', '검색결과가 존재하지 않습니다.'));
          return;
        }
      });
    }
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
}
