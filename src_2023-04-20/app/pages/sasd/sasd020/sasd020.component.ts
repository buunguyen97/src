import {Component, OnInit, ViewChild} from '@angular/core';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {ExchVO, Sasd020Service} from './sasd020.service';

@Component({
  selector: 'app-sasd020',
  templateUrl: './sasd020.component.html',
  styleUrls: ['./sasd020.component.scss']
})
export class Sasd020Component implements OnInit {

  @ViewChild('searchForm', {static: false}) searchForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;

  @ViewChild('fromExchDt', {static: false}) fromExchDt: DxDateBoxComponent;
  @ViewChild('toExchDt', {static: false}) toExchDt: DxDateBoxComponent;

  dsMonyUnit = []; // 화폐단위
  dsUser = [];

  // Global
  G_TENANT: any;

  // Form
  searchFormData = {} as ExchVO;

  // Grid
  dataSource: DataSource;
  popupDataSource: DataSource;
  entityStore: ArrayStore;
  data: ExchVO;
  changes = [];
  popupEntityStore: ArrayStore;
  mainCount: any;

  buySelValue = 1;

  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: ExchVO;

  constructor(public utilService: CommonUtilService,
              private service: Sasd020Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }


  ngAfterViewInit(): void {
    // 날짜세팅
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  // ***** Main ***** //
  // 조회함수
  async onSearch(): Promise<void> {

    const data = this.searchForm.instance.validate();

    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {
      this.searchFormData.fromExchDt = document.getElementsByName('fromExchDt').item(1).getAttribute('value');
      this.searchFormData.toExchDt = document.getElementsByName('toExchDt').item(1).getAttribute('value');

      const result = await this.service.mainList(this.searchFormData);
      if (!result.success) {
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: 'uid'
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  async onReset(): Promise<void> {
    await this.searchForm.instance.resetValues();
    await this.initForm();
  }

  // 초기 화면 셋팅
  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromExchDt.value = rangeDate.fromDate;
    this.toExchDt.value = rangeDate.toDate;
    this.searchForm.instance.getEditor('mony_unit').focus();
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
      // this.popupForm.instance.getEditor('slotPriority').option('disabled', true);
    } else {
      return;
    }
  }

  async onPopupSave(): Promise<void> {

    const popData = this.popupForm.instance.validate();

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
      let resultCount;

      resultCount = await this.service.mainCount(this.popupFormData);
      this.mainCount = resultCount.data;

      if (this.mainCount.count > 0 && this.popupMode === 'Add') {
        const msg = "이미 등록된 정보입니다.";
        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      this.popupFormData["createdby"] = this.utilService.getUserUid();
      this.popupFormData["modifiedby"] = this.utilService.getUserUid();

      if (this.popupMode === 'Add') {
        result = await this.service.mainInsert(this.popupFormData);
      } else {
        result = await this.service.mainUpdate(this.popupFormData);
        this.onSearch();
      }

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        // this.onSearch();
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

  async onPopupDelete(): Promise<void> {

    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
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

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;

    if (e.element.id === 'open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then(
        () => this.popupForm.instance.getEditor('buy_rate').focus()
      );
    }
  }

  // 신규 팝업 호출 시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
  }

  // 팝업 오픈 후 처리
  onPopupAfterOpen(): void {
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('exch_dt').option('disabled', false);
      this.popupForm.instance.getEditor('mony_unit').option('disabled', false);
      this.popupForm.instance.getEditor('exch_dt').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('mony_unit').focus();

      this.popupForm.instance.getEditor('buy_rate').option('value', 0);
      this.popupForm.instance.getEditor('sel_rate').option('value', 0);
      this.popupForm.instance.getEditor('t_buy_rate').option('value', 0);
      this.popupForm.instance.getEditor('t_sel_rate').option('value', 0);
      this.popupForm.instance.getEditor('rate_unit').option('value', 0);
    } else if (this.popupMode === 'Edit') {
      this.popupForm.instance.getEditor('exch_dt').option('disabled', true);
      this.popupForm.instance.getEditor('mony_unit').option('disabled', true);
    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.onSearch();
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }
}

