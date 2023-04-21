import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {CodeCategoryVO, CodeService, CodeVO} from './code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainKey = 'uid';
  selectedRows: number[];
  // ***** main ***** //

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: CodeCategoryVO = {} as CodeCategoryVO;
  // Grid
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;
  popupKey = 'uid';
  codeList: CodeVO[];
  // Changes
  popupChanges = [];
  // ***** popup ***** //

  // DataSet
  dsYN = [];
  dsUser = [];

  GRID_STATE_KEY = 'mm_code';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: CodeService
  ) {
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
  }

  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.inputDataSource([], 'main');
    this.inputDataSource(this.codeList, 'popup');
  }

  initCode(): void {

    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  inputDataSource(inputData, inputType): void {

    this[inputType + 'EntityStore'] = new ArrayStore({
        data: inputData,
        key: this[inputType + 'Key']
      }
    );

    this[inputType + 'DataSource'] = new DataSource({
      store: this[inputType + 'EntityStore']
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  onPopupOpen(e): void {

    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.popupFormData = {tenant: this.G_TENANT, isUsingSystemFlg: 'N', isEditPossibleFlg: 'Y'} as CodeCategoryVO;
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data);
    }
    this.popup.visible = true;
  }

  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.getEditor('codeCategory').option('disabled', false);

    if (!!this.popupDataSource) {
      this.popupEntityStore.clear();
      this.popupDataSource.reload();
      this.popupGrid.instance.cancelEditData();
    }
    this.onSearch();
  }

  onPopupAddRow(): void {

    this.popupGrid.instance.addRow().then(() => {
        const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.popupChanges[this.popupChanges.length - 1].key);
        this.setFocusRow(rowIdx);
      }
    );
  }

  onInitNewRowPopup(e): void {
    e.data.tenant = this.utilService.getTenant();
    e.data.codeCategoryId = this.popupFormData.uid;
  }

  async onPopupDeleteRow(): Promise<void> {

    if (this.popupGrid.focusedRowIndex > -1) {
      this.popupGrid.instance.deleteRow(this.popupGrid.focusedRowIndex);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);
    }
    // this.setFocusRow(this.popupGrid.focusedRowIndex === -1 ? 0 : this.popupGrid.focusedRowIndex - 1);
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
      this.inputDataSource(result.data.codeList, 'popup');
    }
  }

  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();
    const detailList = this.collectDetail(this.popupChanges);

    if (popData.isValid) {
      let result;
      this.popupFormData.codeList = detailList;

      if (this.popupMode === 'Add') {
        result = await this.service.save(this.popupFormData);
      } else {
        result = await this.service.update(this.popupFormData);
      }
      console.log(result);

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        this.onPopupClose();
      }
    }
  }

  async onPopupDelete(): Promise<void> {
    const result = await this.service.delete(this.popupFormData);

    if (this.resultMsgCallback(result, 'Delete')) {
      this.onPopupClose();
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

  collectDetail(changes: any): any[] {
    const detailList = [];

    for (const rowIndex in changes) {
      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        detailList.push(Object.assign({operType: changes[rowIndex].type, uid: null}, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        detailList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      } else {
        detailList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      }
    }
    return detailList;
  }

  onFocusedCellChangedPopupGrid(e): void {
    this.setFocusRow(e.rowIndex);
  }

  setFocusRow(index): void {
    this.popupGrid.focusedRowIndex = index;
  }
}
