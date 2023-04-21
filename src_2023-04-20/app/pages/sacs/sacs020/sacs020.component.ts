import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacs020Service, Sacs020VO} from './sacs020.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';

@Component({
  selector: 'app-sacs020',
  templateUrl: './sacs020.component.html',
  styleUrls: ['./sacs020.component.scss']
})
export class Sacs020Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sacs020Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private bizService: BizCodeService
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.sessionUid = this.utilService.getUserUid();
    this.onSelectionChangedExptCd = this.onSelectionChangedExptCd.bind(this);
    this.onSelectionChangedPtrnCd = this.onSelectionChangedPtrnCd.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  // Global
  G_TENANT: any;
  dsUser = [];

  // Form
  mainFormData = {};
  mainCount: any;

  // Grid
  mainGridDataSource: DataSource;
  entityStore1: ArrayStore;
  mainEntityStore: ArrayStore;
  key = ['expt_cd', 'ptrn_cd'];

  // grid Data
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  // combobox
  sbxExptCd = [];
  sbxPtrnCd = [];
  dsCountry = [];	// 국가

  sessionUid: any;

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: Sacs020VO;

  PAGE_PATH = '';

  suspendValueChagned = false;

  // 화면 초기 로딩
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.entityStore1 = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.mainGridDataSource = new DataSource({
      store: this.entityStore1
    });
    this.initCode();
  }

  // 콤보박스 코드
  initCode(): void {
    // 수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
      this.sbxExptCd = result.data;
    });

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.sbxPtrnCd = result.data;
    });

    // 국가
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  // 화명 로딩 후 처리
  ngAfterViewInit(): void {
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
  }

  // 성공, 실패 안내문 호출
  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      const convert = this.utilService.convert(result.msg);
      if (convert) {
        this.utilService.notify_error(convert);
      } else {
        this.utilService.notify_error(result.msg);
      }
    }
    return result.success;
  }

  // 그리드 툴바
  onToolbarPreparing(e, title): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));
    const searchPanelTemp = toolbarItems.find(item => item.name === 'searchPanel');
    searchPanelTemp.location = 'after';

    newToolbarItems.push(searchPanelTemp);
    e.toolbarOptions.items = newToolbarItems;

    newToolbarItems.push({
      location: 'before',
      template(): any {
        return `<h4 class="grid_title">${title}</h4>`;
      },
    });
  }

  /******************** 수출사파트너사 등록 함수 ********************/
  // 조회 함수(수출사파트너사 정보)
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.mainList(this.mainFormData);

      console.log(result.data);
      if (this.resultMsgCallback(result, 'Search')) {

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      } else {
        return;
      }
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 팝업 열기(수출사파트너사 정보)
  onPopupOpen(e): void {
    this.popup.visible = true;
    this.deleteBtn.visible = true;
    this.saveBtn.visible = true;

    if (e.element.id === 'Add') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.saveBtn.visible = false;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then();
    }
  }

  // 팝업 닫기(수출사파트너사 정보)
  onPopupClose(): void {
    this.popup.visible = false;
  }

  // 팝업 호출시 초기데이터(수출사파트너사 정보)
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT});
  }

  // 팝업 호출 후 처리(수출사파트너사 정보)
  onPopupAfterOpen(): void {
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);
      this.popupForm.instance.getEditor('country').option('disabled', true);
      this.popupForm.instance.getEditor('zip_no').option('disabled', true);
      this.popupForm.instance.getEditor('address').option('disabled', true);
      this.popupForm.instance.getEditor('eng_address').option('disabled', true);
      this.popupForm.instance.getEditor('wh_address').option('disabled', true);
      this.popupForm.instance.getEditor('wh_eng_address').option('disabled', true);
      this.popupForm.instance.getEditor('chg_nm').option('disabled', true);
      this.popupForm.instance.getEditor('chg_tel_no').option('disabled', true);
      this.popupForm.instance.getEditor('chg_email').option('disabled', true);
      this.popupForm.instance.getEditor('ptrn_country').option('disabled', true);
    } else {
      this.popupForm.instance.getEditor('expt_cd').option('disabled', true);
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
      this.popupForm.instance.getEditor('country').option('disabled', true);
      this.popupForm.instance.getEditor('zip_no').option('disabled', true);
      this.popupForm.instance.getEditor('address').option('disabled', true);
      this.popupForm.instance.getEditor('eng_address').option('disabled', true);
      this.popupForm.instance.getEditor('wh_address').option('disabled', true);
      this.popupForm.instance.getEditor('wh_eng_address').option('disabled', true);
      this.popupForm.instance.getEditor('chg_nm').option('disabled', true);
      this.popupForm.instance.getEditor('chg_tel_no').option('disabled', true);
      this.popupForm.instance.getEditor('chg_email').option('disabled', true);
      this.popupForm.instance.getEditor('ptrn_country').option('disabled', true);
      this.popupDataSource = null;
    }
  }

  // 팝업 종류 후 처리
  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
  }

  // 팝업 데이터 호출(수출사파트너사 정보)
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);

    if (result != null) {
      this.popupFormData = result.data;
    } else {
      return;
    }
  }

  // 저장 버튼 온클릭(수출사파트너사 정보)
  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      if (await this.execSave()) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  // 데이터 저장(수출사파트너사 정보)
  async execSave(): Promise<boolean> {
    try {
      let result;
      let resultCount;

      resultCount = await this.service.mainCount(this.popupFormData);
      this.mainCount = resultCount.data;

      if (this.mainCount.count > 0 && this.popupMode === 'Add') {
        const msg = this.utilService.convert1('sales.sentence1', '이미 등록된 정보입니다.', 'This is already registered information.');
        this.utilService.notify_error(msg);
        return;
      }

      this.popupFormData.createdby = this.sessionUid;
      this.popupFormData.modifiedby = this.sessionUid;

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      if (this.popupMode === 'Add') {
        result = await this.service.mainInsert(this.popupFormData);
      }
      if (this.resultMsgCallback(result, 'Save')) {
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

  // 삭제 버튼 온클릭(수출사파트너사 정보)
  async onPopupDelete(): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const result = await this.service.mainDelete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  onSelectionChangedPtrnCd(e): void {
    console.log('=== onSelectionChangedPtrnCd ===');

    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (!e) {
      return;
    }
    if (!e.event) {
      return;
    }

    // 파트너사 국가 - 파트너사명
    if (e) {
      if (e.value) {
        this.service.getPtrnInfo(e.value).subscribe(result => {
          // console.log(result.data[0]);
          this.popupFormData.ptrn_nm = result.data[0].ptrn_nm;
          this.popupFormData.ptrn_country = result.data[0].country;
        });
      }
    }
  }

  onSelectionChangedExptCd(e): void {
    console.log('=== onSelectionChangedExptCd ===');
    if (this.suspendValueChagned) {
      this.suspendValueChagned = false;
      return;
    }

    if (!e) {
      return;
    }
    if (!e.event) {
      return;
    }

    // 수출사 국가 - 수출사
    if (e) {
      if (e.value && this.popupMode === 'Add') {
        this.service.getExptInfo(e.value).subscribe(result => {
          this.popupFormData.country = result.data[0].country;
          this.popupFormData.zip_no = result.data[0].zip_no;
          this.popupFormData.address = result.data[0].address;
          this.popupFormData.eng_address = result.data[0].eng_address;
          this.popupFormData.wh_address = result.data[0].wh_address;
          this.popupFormData.wh_eng_address = result.data[0].wh_eng_address;
          this.popupFormData.chg_nm = result.data[0].chg_nm;
          this.popupFormData.chg_tel_no = result.data[0].chg_tel_no;
          this.popupFormData.chg_email = result.data[0].chg_email;
          const data = result.data[0].country;
          this.onPtrnSearch(data).then();
        });
      }
    }
  }

  // 팝업 데이터 호출(수출사파트너사 정보)
  async onPtrnSearch(data): Promise<void> {
    const result = await this.service.gridInfo(data);
    console.log(result.data);
    if (!result.success) {
      return;
    } else {

      this.popupGrid.instance.cancelEditData();

      this.popupEntityStore = new ArrayStore({
        data: result.data,
        key: this.key
      });
      this.popupDataSource = new DataSource({
        store: this.popupEntityStore
      });
      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;

      const keys = this.popupGrid.instance.getSelectedRowKeys();
      this.popupGrid.instance.deselectRows(keys);
    }
  }

  onFocusedCellChanging(e): void {
    this.setFocusRow(this.mainGrid, e.rowIndex);
  }

  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  onFocusedRowChanging(e): void {
    if (this.popupMode === 'Add') {
      this.popupFormData.ptrn_country = e.row.data.country;
      this.popupFormData.ptrn_nm = e.row.data.ptrn_nm;
      this.popupFormData.ptrn_cd = e.row.data.ptrn_cd;
    }
  }
}
