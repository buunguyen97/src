import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {MoveDetailVO, MoveVO, WarehousemoveService} from './warehousemove.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-warehousemove',
  templateUrl: './warehousemove.component.html',
  styleUrls: ['./warehousemove.component.scss']
})
export class WarehousemoveComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;
  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;
  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: MoveVO = {} as MoveVO;
  // Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainKey = 'uid';
  selectedRows: number[];
  // ***** main ***** //

  // ***** popup ***** //
  popupMode = 'Add';
  popupVisible = false;
  // Form
  popupFormData: MoveVO;
  // Grid
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;
  popupKey = 'uid';
  codeList: MoveDetailVO[];

  // Changes
  popupChanges = [];
  // ***** popup ***** //

  // DataSet

  dsYN = [];
  dsDamageFlg = [];
  dsMoveType = [];
  dsOwner = [];
  dsWarehouse = [];
  dsMoveStatus = [];
  dsItemAdmin = [];
  dsItemId = [];
  dsLocation = [];
  dsUser = [];
  dsDeliveryType = [];

  shownFlag = false;

  // summary
  searchList = [];

  GRID_STATE_KEY = 'inv_move';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  constructor(
    public utilService: CommonUtilService,
    private service: WarehousemoveService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.onValueChangedToWarehouseId = this.onValueChangedToWarehouseId.bind(this);
    this.onValueChangedTransWarehouseId = this.onValueChangedTransWarehouseId.bind(this);
    this.onValueChangedFromAutoShipFlg = this.onValueChangedFromAutoShipFlg.bind(this);
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
    this.setItemValue = this.setItemValue.bind(this);
  }

  // 화면 생성 된 후 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
    this.inputDataSource([], 'main');
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.inputDataSource(this.codeList, 'popup');
    this.initData('main');
  }

  initCode(): void {

    // 화주
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 이동유형
    this.codeService.getCode(this.G_TENANT, 'MOVETYPE').subscribe(result => {
      this.dsMoveType = result.data;
    });

    // 이동상태
    this.codeService.getCode(this.G_TENANT, 'MOVESTATUS').subscribe(result => {
      this.dsMoveStatus = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 운송구분
    this.codeService.getCode(this.G_TENANT, 'SODELIVERYTYPE').subscribe(result => {
      this.dsDeliveryType = result.data;
    });
  }

  inputDataSource(inputData, type): void {

    this[type + 'EntityStore'] = new ArrayStore({
        data: inputData,
        key: this[type + 'Key']
      }
    );

    this[type + 'DataSource'] = new DataSource({
      store: this[type + 'EntityStore']
    });
  }

  initData(type): void {

    if (type === 'main') {

      this.fromShipSchDate.value = '';
      this.toShipSchDate.value = '';
      this.fromRcvSchDate.value = '';
      this.toRcvSchDate.value = '';

      this[type + 'Form'].formData = {
        tenant: this.G_TENANT,
        ownerId: this.utilService.getCommonOwnerId(),
        fromWarehouseId: this.utilService.getCommonWarehouseId()
      };
    } else {

      this[type + 'FormData'] = Object.assign({
        tenant: this.G_TENANT,
        ownerId: this.utilService.getCommonOwnerId(),
        moveType: 'WMOVE',
        sts: '100',
        deliveryType: 'INNER',
        fromWarehouseId: this.utilService.getCommonWarehouseId(),
        fromLogisticsId: this.utilService.getCommonWarehouseVO().logisticsId,
        companyId: this.utilService.getCommonOwnerId(),
        shipSchDate: this.utilService.formatDate(new Date()),
        rcvSchDate: this.utilService.formatDate(new Date()),
        autoShipFlg: 'N',
        autoReceiveFlg: 'N'
      });
    }
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

      if (this.resultMsgCallback(result, 'Search')) {
        this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async onPopupOpen(e): Promise<void> {
    this.inputDataSource([], 'popup');

    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      await this.initData('popup');
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      await this.onPopupSearch(e.data);
    }

    if (this.shownFlag) {
      this.changeDisabled(this.deleteBtn.visible, !e.data ? '100' : e.data.sts);
    }
    this.popup.visible = true;
  }

  changeDisabled(type, sts): void {
    const confirmedBtn = this.popup.toolbarItems[0];
    const editorList = ['toWarehouseId', 'deliveryType', 'transWarehouseId', 'transLocId',
      'shipSchDate', 'rcvSchDate'];
    confirmedBtn.options = {
      text: this.utilService.convert1('phyconfirmed_msg_confirmed', '확정'),
      type: 'normal',
      onClick: this.onPopupExcute.bind(this)
    };

    if (type) { // type Add, Edit

      if (sts === '100') {
        this.popupGrid.editing.allowUpdating = true;
        this.saveBtn.visible = true;
        this.deleteBtn.visible = true;
        confirmedBtn.visible = true;

        editorList.forEach(el => {
          this.popupForm.instance.getEditor(el).option('disabled', !type);
        });

      } else {
        this.popupGrid.editing.allowUpdating = false;
        this.saveBtn.visible = false;
        this.deleteBtn.visible = false;
        confirmedBtn.visible = false;

        editorList.forEach(el => {
          this.popupForm.instance.getEditor(el).option('disabled', type);
        });
      }
    } else {
      this.popupGrid.editing.allowUpdating = false;
      this.saveBtn.visible = true;
      confirmedBtn.visible = false;

      editorList.forEach(el => {
        this.popupForm.instance.getEditor(el).option('disabled', type);
      });
    }
    this.popupGrid.focusedRowKey = null;
    this.popupGrid.paging.pageIndex = 0;
  }

  onPopupAddRow(): void {

    if (this.popupFormData.sts === '100') {

      this.popupGrid.instance.addRow().then(() => {
        this.setFocusRow(this.popupGrid.instance.getVisibleRows().length - 1);
      });
    }
  }

  onInitNewRowPopup(e): void {

    e.data = {
      tenant: this.utilService.getTenant(),
      codeCategoryId: this.popupFormData.uid,
      itemAdminId: this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : null,
      expectQty1: 0, shippedQty1: 0, receivedQty1: 0,
      lotReserveFlg: 'N', damageFlg: 'N'
    };
  }

  async onPopupDeleteRow(): Promise<void> {

    if (this.popupFormData.sts === '100') {

      if (this.popupGrid.focusedRowIndex > -1) {
        this.popupGrid.instance.deleteRow(this.popupGrid.focusedRowIndex);
        this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);
        this.setFocusRow(this.popupGrid.focusedRowIndex - 1);
      }
    }
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {

      this.popupFormData = result.data;
      this.popupFormData.soKey = data.soKey;
      this.popupFormData.rcvKey = data.rcvKey;
      this.inputDataSource(result.data.moveDetailList, 'popup');
    }
  }

  async onPopupSave(): Promise<void> {

    // 창고이동 상세리스트 여부
    if ((this.popupGrid.instance.totalCount() + this.popupChanges.length) === 0) {
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert('inv_warehousemove_popupgrid'));
      this.utilService.notify_error(msg);
      return;
    }

    const popData = this.popupForm.instance.validate();
    const detailList = this.collectDetail(this.popupChanges);

    if (popData.isValid) {
      let result;
      this.popupFormData.moveDetailList = detailList;

      if (this.popupGrid.instance.getVisibleRows().length === 0) {
        this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert('so_so_popupGridTitle')));
        return;
      }
      const visibleRows = this.popupGrid.instance.getVisibleRows();
      let checkCell = false;

      for (const row of visibleRows) {
        const CELLS = 'cells';

        for (const cell of row[CELLS]) {
          const dField = cell.column.dataField;

          if (dField === 'itemAdminId' || dField === 'itemId') {

            if (!cell.value) {
              checkCell = true;
              this.setFocusRow(row.rowIndex);
              this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert('so_so_' + dField)));
              break;
            }
          } else if (dField === 'expectQty1') {

            if (cell.value <= 0) {
              checkCell = true;
              this.setFocusRow(row.rowIndex);
              this.utilService.notify_error(this.utilService.convert('so_valid_qtygt', this.utilService.convert('so_so_expectQty1'), '0'));
              break;
            }
          }
        }

        if (checkCell) {
          break;
        }
      }

      if (checkCell) {
        return;
      }
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      if (this.popupMode === 'Add') {
        result = await this.service.save(this.popupFormData);
      } else {
        result = await this.service.update(this.popupFormData);
      }

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        this.onPopupClose();
      }
    }
  }

  async onPopupExcute(): Promise<void> {
    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('phyconfirmed_msg_confirmed'));

    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    if (!!this.popupFormData.uid) {
      const result = await this.service.proc([this.popupFormData.uid]);

      if (this.resultMsgCallback(result, 'Excute')) {
        this.onPopupClose();
      }
    } else {
      this.utilService.notify_success('이동할 데이터가 없습니다');
    }
  }

  async onPopupDelete(): Promise<void> {
    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));

    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    const result = await this.service.delete(this.popupFormData);

    if (this.resultMsgCallback(result, 'Delete')) {
      this.onPopupClose();
    }
  }

  onValueChangedToWarehouseId(e): void {

    if (!e.value) {
      this.popupFormData.toLogisticsId = null;
    } else {
      const findData = this.dsWarehouse.filter(el => el.uid === e.value);
      const logisticsIdValue = findData[0].logisticsId;
      this.popupFormData.toLogisticsId = findData.length > 0 ? logisticsIdValue : null;
    }
  }

  onValueChangedTransWarehouseId(e): void {
    if (!e.value && e.popupMode === 'add') {
      this.popupFormData.transLogisticsId = null;
      this.dsLocation = [];
    } else {
      const findData = this.dsWarehouse.filter(el => el.uid === e.value);

      // const logisticsIdValue = findData[0].logisticsId;
      this.popupFormData.transLogisticsId = findData.length > 0 ? findData[0].logisticsId : null;

      this.codeService.getLocation(this.G_TENANT, e.value).subscribe(result => {
        this.dsLocation = result.data;
      });
    }
  }

  onValueChangedFromAutoShipFlg(e): void {
    this.popupForm.instance.getEditor('autoReceiveFlg').option('disabled', e.value !== 'Y');
  }

  onShown(): void {
    this.popupFormData.transLogisticsId = null;
    if (this.popupMode === 'add') {
      this.dsLocation = [];
    }

    if (!this.shownFlag) {
      this.changeDisabled(this.popupMode !== 'Add', this.popupMode !== 'Add' ? this.popupFormData.sts : '100');
      this.shownFlag = true;
    }
    this.utilService.getPopupGridHeight(this.popupGrid, this.popup, 35);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupGrid.instance.cancelEditData();
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

  onReset(): void {
    this.mainForm.instance.resetValues();
    this.initData('main');
  }

  setItemAdminValue(rowData: any, value: any): void {
    rowData.itemAdminId = value;
    rowData.itemId = null;
    rowData.unit = null;
  }

  getFilteredItemId(options): any {
    return {
      store: this.dsItemId,
      filter: options.data ? ['itemAdminId', '=', options.data.itemAdminId] : null
    };
  }

  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
    rowData.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }
}
