import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {SlotPriorityService, SlotPriorityVO} from './slot-priority.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-slot-priority',
  templateUrl: './slot-priority.component.html',
  styleUrls: ['./slot-priority.component.scss']
})
export class SlotPriorityComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';

  dsWarehouseId = [];
  dsOwnerId = [];
  dsOwner = [];
  dsUser = [];
  dsCompany = [];

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: SlotPriorityVO;
  dsYN = [];
  dsSlotStyleType = [];
  dsItemAdminId = [];
  dsSetRcvTagLocFlg = [];

  GRID_STATE_KEY = 'mm_slotpriority';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: SlotPriorityService
  ) {
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);

  }

  initCode(): void {
    // 창고(로그인 사용자가 선택할 수 있는 창고)
    // this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 화주(로그인 사용자가 선택할 수 있는 화주)
    // this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // popup 화주
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 적재단위
    this.codeService.getCode(this.G_TENANT, 'SLOTSTYLETYPE').subscribe(result => {
      this.dsSlotStyleType = result.data;
    });

    // 실적로케이션
    this.codeService.getCode(this.G_TENANT, 'SETRCVTAGLOCCDFLG').subscribe(result => {
      this.dsSetRcvTagLocFlg = result.data;
    });

    // 실적로케이션
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    this.codeService.getCompany(this.utilService.getTenant(), null, null, null, null, null, null, null).subscribe(r => {
      this.dsCompany = r.data;
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

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
      } else {
        return;
      }
    }
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;

    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then(
        () => this.popupForm.instance.getEditor('name').focus()
      );
    }
  }

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
  }

  onPopupAfterOpen(): void {

    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('companyId').option('value', this.utilService.getCompanyId());
      this.popupForm.instance.getEditor('warehouseId').focus();
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

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

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
      }
    }
  }

  async execSave(): Promise<boolean> {
    try {
      let result;

      if (this.popupMode === 'Add') {
        result = await this.service.save(this.popupFormData);
      } else {
        result = await this.service.update(this.popupFormData);
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
      const result = await this.service.delete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {

    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('companyId').option('value', this.utilService.getCompanyId());
    this.mainForm.instance.focus();
  }
}
