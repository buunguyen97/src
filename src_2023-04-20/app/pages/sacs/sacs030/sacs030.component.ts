import {Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacs030Service, Sacs030VO} from './sacs030.service';

//test

@Component({
  selector: 'app-sacs030',
  templateUrl: './sacs030.component.html',
  styleUrls: ['./sacs030.component.scss']
})
export class Sacs030Component implements OnInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  // Global
  G_TENANT: any;
  dsUser = [];
  sessionUserId: any;

  // Form
  mainFormData = {};
  // Grid
  mainCount: any;
  mainGridDataSource: DataSource;
  entityStore1: ArrayStore;
  mainEntityStore: ArrayStore;
  key = ['cust_cd', 'wh_cd'];

  // combobox
  sbxCust_cd = [];
  sbxWh_cd = [];
  dsCountry = [];

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: Sacs030VO;

  PAGE_PATH = '';

  constructor(public utilService: CommonUtilService,
              private service: Sacs030Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private bizService: BizCodeService
  ) {
    this.sessionUserId = this.utilService.getUserUid();
    this.PAGE_PATH = this.utilService.getPagePath();
  }

  // 화면 초기 로딩
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
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
    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.sbxCust_cd = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.sbxWh_cd = result.data;
    });

    // 국가
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
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
      this.utilService.notify_error(result.msg);
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

  /******************** 파트너사창고 등록 함수 ********************/
  // 조회 함수(파트너사창고 정보)
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.mainList(this.mainFormData);

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

        var keys = this.mainGrid.instance.getSelectedRowKeys();
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

  // 팝업 열기(파트너사창고 정보)
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
      this.onPopupSearch(e.data).then()
    }
  }

  // 팝업 닫기(파트너사창고 정보)
  onPopupClose(): void {
    this.popup.visible = false;
  }

  // 팝업 호출시 초기데이터(파트너사창고 정보)
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT});
  }

  // 팝업 호출 후 처리(파트너사창고 정보)
  onPopupAfterOpen(): void {
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('cust_cd').option('disabled', false);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', false);
    } else {
      this.popupForm.instance.getEditor('cust_cd').option('disabled', true);
      this.popupForm.instance.getEditor('wh_cd').option('disabled', true);
    }
  }

  // 팝업 종류 후 처리
  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
  }

  // 팝업 데이터 호출(파트너사창고 정보)
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);

    if (result != null) {
      this.popupFormData = result.data;
    } else {
      return;
    }
  }

  // 저장 버튼 온클릭(파트너사창고 정보)
  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      if (await this.execSave()) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  // 데이터 저장(파트너사창고 정보)
  async execSave(): Promise<boolean> {
    try {
      let result;
      let resultCount;

      resultCount = await this.service.mainCount(this.popupFormData);
      this.mainCount = resultCount.data;

      if (this.mainCount.cnt > 0 && this.popupMode === 'Add') {
        //const msg = this.utilService.convert1('sales.sentence1', '이미 등록된 정보입니다.', 'This is already registered information.');
        var msg = "이미 등록된 정보입니다.";
        if (this.utilService.getLanguage() != 'ko') {
          msg = "This is already registered information.";
        }
        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      this.popupFormData["createdby"] = this.sessionUserId;
      this.popupFormData["modifiedby"] = this.sessionUserId;

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

  // 삭제 버튼 온클릭(파트너사창고 정보)
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
}
