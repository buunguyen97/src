import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {ItemadminService, ItemAdminVO} from './itemadmin.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-itemadmin',
  templateUrl: './itemadmin.component.html',
  styleUrls: ['./itemadmin.component.scss']
})
export class ItemadminComponent implements OnInit, AfterViewInit {

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
  // ***** main ***** //

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: ItemAdminVO;
  // ***** popup ***** //

  // DataSet
  dsYN = [];
  dsUser = [];

  GRID_STATE_KEY = 'mm_itemadmin';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: ItemadminService
  ) {
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.mainFormData = Object.assign({tenant: this.G_TENANT});
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

  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getGridHeight(this.mainGrid);
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.mainForm.instance.getEditor('actFlg').option('value', 'Y');

  }

  initCode(): void {

    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
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

  onPopupOpen(e): void {

    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data);
    }
    this.popup.visible = true;
  }

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData =
      Object.assign({
        tenant: this.G_TENANT,
        itemAdmin: '',
        name: '',
        shortName: '',
        actFlg: 'Y'
      });
  }

  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.getEditor('itemAdmin').option('disabled', false);

    this.onSearch();
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
      this.popupForm.instance.getEditor('itemAdmin').option('disabled', true);
    } else {
      return;
    }
  }

  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      let result;
      result = await this.service.save(this.popupFormData);

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        this.onPopupClose();
      }
    }
  }

  async onPopupDelete(): Promise<void> {

    try {
      const result = await this.service.delete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
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
}
