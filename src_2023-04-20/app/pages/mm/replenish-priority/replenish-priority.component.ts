import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {ReplenishPriorityService, ReplenishPriorityVO} from './replenish-priority.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-replenish-priority',
  templateUrl: './replenish-priority.component.html',
  styleUrls: ['./replenish-priority.component.scss']
})
export class ReplenishPriorityComponent implements OnInit, AfterViewInit {

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

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: ReplenishPriorityVO;
  dsYN = [];
  dsRepPriorityKey = [];
  dsItemAdminId = [];
  dsUser = [];

  PAGE_PATH = '';

  GRID_STATE_KEY = 'mm_replenishpriority';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: ReplenishPriorityService
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
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
    this.utilService.getGridHeight(this.mainGrid);

    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
  }

  initCode(): void {

    // 창고(로그인 사용자가 선택할 수 있는 창고)
    // this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 화주(로그인 사용자가 선택할 수 있는 창고)
    // this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // popup 화주
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 보충할당룰
    // this.codeService.getCode(this.G_TENANT, 'REPPRIORITYKEY').subscribe(result => {
    //   this.dsRepPriorityKey = result.data;
    // });
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

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
  }

  onPopupAfterOpen(): void {

    if (this.popupMode === 'Add') {
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
}
