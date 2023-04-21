import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {LogicalWhMoveService, LogicalWhMoveVO} from './logical-wh-move.service';

@Component({
  selector: 'app-logical-wh-move',
  templateUrl: './logical-wh-move.component.html',
  styleUrls: ['./logical-wh-move.component.scss']
})
export class LogicalWhMoveComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;
  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  mainFormData: LogicalWhMoveVO = {} as LogicalWhMoveVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: LogicalWhMoveVO = {} as LogicalWhMoveVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  key = 'uid';
  selectedRows: number[];
  changes = [];

  popupKey = 'uid';
  popupVisible = false;
  popupMode = 'Add';
  popupData: LogicalWhMoveVO = {} as LogicalWhMoveVO;

  dsWarehouse = [];
  dsCompany = [];
  // dsFilteredItemId = [];
  // dsItemAdmin = [];
  dsItemId = [];
  dsUnitStyle = [];
  dsOwner = [];
  dsYN = [];
  dsUser = [];
  dsToLoc = [];
  dsTransLoc = [];
  dsFromLoc = [];
  dsMoveType = [];
  dsMoveStatus = [];
  dsDamageFlg = [];
  shownFlag = false;
  owner: any;

  GRID_STATE_KEY = 'logicalwhmove1';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  currentCompany = '';

  constructor(
    public utilService: CommonUtilService,
    private service: LogicalWhMoveService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.G_TENANT = this.utilService.getTenant();
    // this.onValueChangedTransWarehouse = this.onValueChangedTransWarehouse.bind(this);
    // this.onValueChangedToWarehouse = this.onValueChangedToWarehouse.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.addClick = this.addClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.changeDisabled = this.changeDisabled.bind(this);

    // this.onInitNewRow = this.onInitNewRow.bind(this);
  }

  ngOnInit(): void {
    this.currentCompany = this.utilService.getCompany();
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  ngAfterViewInit(): void {
    // 팝업 그리드 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [], key: this.popupKey
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initForm(): void {
    // this.mainForm.instance.getEditor('moveType').option('value', 'INNER');
    this.mainForm.instance.getEditor('sts').option('value', '100');

    const rangeDate = this.utilService.getDateRange();

    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;
    this.fromRcvSchDate.value = rangeDate.fromDate;
    this.toRcvSchDate.value = rangeDate.toDate;

    this.mainForm.instance.focus();
  }

  initCode(): void {
    // 창고
    this.codeService.getSalesWarehouse(this.currentCompany).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      // this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 이동유형
    this.codeService.getCode(this.G_TENANT, 'LOGICALWHMOVETYPE').subscribe(result => {
      this.dsMoveType = result.data;
    });

    // 이동상태
    this.codeService.getCode(this.G_TENANT, 'LOGICALWHMOVESTATUS').subscribe(result => {
      this.dsMoveStatus = result.data;
    });

    // // 품목관리사
    // this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
    //   this.dsItemAdmin = result.data;
    // });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.owner = result.data[0]["company"];
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    await this.mainGrid.instance.deselectAll();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromCompanyId = this.currentCompany;
      this.mainFormData.toCompanyId = this.currentCompany;

      const result = await this.service.get(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.mainDataSource = new DataSource({
          store: this.mainEntityStore
        });

        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  popupShown(e): void {
    this.popupGrid.instance.deselectAll();

    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

    this.popupData.itemAdminId = this.utilService.getCommonItemAdminId();
    this.popupData.companyId = this.utilService.getCommonOwnerId();
    this.popupData.ownerId = this.utilService.getCommonOwnerId();

    // this.popupData.moveDate = this.utilService.formatDate(new Date());

    if (this.popupMode === 'Add') { // 신규
      const date = this.utilService.getFormatDate(new Date());

      this.popupForm.instance.getEditor('shipSchDate').option('value', date);
      this.popupForm.instance.getEditor('rcvSchDate').option('value', date);

      this.popupForm.instance.getEditor('sts').option('disabled', true);
      this.popupForm.instance.getEditor('sts').option('value', '100');
      this.popupForm.instance.getEditor('moveType').option('value', 'INNER');

      this.popupData.fromCompanyId = this.currentCompany;
      this.popupData.toCompanyId = this.currentCompany;

      this.changeDisabled('add', this.popupData.sts);

    } else if (this.popupMode === 'Edit') { // 수정
      if (this.popupData.sts === '100') {
        this.shownFlag = true;
      } else {
        this.shownFlag = false;
      }
      this.changeDisabled('Edit', this.popupData.sts);

    }
  }

  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;

    this.showPopup('Add', {...e.data});
  }

  changeDisabled(type, sts): void {

    const confirmedBtn = this.popup.toolbarItems[0];
    const editorList = ['shipSchDate', 'rcvSchDate', 'sts', 'fromLogicalWhId', 'toLogicalWhId', 'moveType', 'remarks'];
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

        if (type === 'add') {
          confirmedBtn.visible = false;
          this.deleteBtn.visible = false;

        } else {
          confirmedBtn.visible = true;
        }

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

  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.popupKey
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.onSearchPopup();
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupData.uid) {
      const result = await this.service.getFull(this.popupData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.logicalWhMoveDetailList,
            key: this.popupKey
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

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {

    const detailList = this.collectGridData(this.changes);

    // await this.popupGrid.instance.saveEditData();

    const popData = this.popupForm.instance.validate();
    const gridList = this.popupGrid.instance.getDataSource().items();

    // if (popData.isValid && detailList.length > 0) {
    if (popData.isValid) {
      for (const items of detailList) {
        if ((items.operType === 'insert') && !items.itemId) {
          const errorMsg = this.utilService.convert1('gridvalidationerror_itemId', '품목을 선택해주세요.');
          this.utilService.notify_error(errorMsg);
          return;
        }

        if (!items.moveQty) {
          const errorMsg = this.utilService.convert1('gridvalidationerror_moveQty', '수량을 입력해주세요.');
          this.utilService.notify_error(errorMsg);
          return;
        }
      }

      if (this.popupData.fromLogicalWhId === this.popupData.toLogicalWhId) {
        const errorMsg = this.utilService.convert1('logicalWhIdDiff', '이동전창고와 이동후창고가 같습니다.');
        this.utilService.notify_error(errorMsg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('/inv/logicalwhmovesave', '창고이동(내부)'));
      if (!await this.utilService.confirm(confirmMsg)) {

        return;
      }
      try {
        let result;
        // const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const saveContent = this.popupData as LogicalWhMoveVO;
        // const moveDate = document.getElementsByName('moveDate').item(1).getAttribute('value');


        // saveContent.ptProdCostDetailList = this.popupGrid.instance.getDataSource().items();
        // saveContent.ptProdCostDetailList = this.popupGrid.instance.getVisibleRows().map(el => el.data);

        saveContent.companyId = 1;
        saveContent.fromLogicalWhId = this.popupForm.instance.getEditor('fromLogicalWhId').option('value');
        saveContent.toLogicalWhId = this.popupForm.instance.getEditor('toLogicalWhId').option('value');
        saveContent.logicalWhMoveDetailList = detailList;
        saveContent.owner = this.owner;

        saveContent.tenant = this.G_TENANT;
        // saveContent.logicalWhMoveDetailList[0].moveQty = 3;

        console.log(saveContent);

        result = await this.service.save(saveContent);


        // if (this.popupMode === 'Add') {
        // } else {
        //   result = await this.service.update(saveContent);
        // }

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch (e) {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  async onPopupExcute(): Promise<void> {
    // const detailList = this.collectGridData(this.changes);

    // await this.popupGrid.instance.saveEditData();

    const popData = this.popupForm.instance.validate();
    const gridList = this.popupGrid.instance.getDataSource().items();

    if (popData.isValid && gridList.length > 0) {

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('/inv/logicalwhmovesave', '창고이동(내부)'));
      if (!await this.utilService.confirm(confirmMsg)) {

        return;
      }
      try {
        let result;
        // const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const saveContent = this.popupData as LogicalWhMoveVO;
        // const moveDate = document.getElementsByName('moveDate').item(1).getAttribute('value');

        // saveContent.companyId = 1;
        // saveContent.fromLogicalWhId = this.popupForm.instance.getEditor('fromLogicalWhId').option('value');
        // saveContent.toLogicalWhId = this.popupForm.instance.getEditor('toLogicalWhId').option('value');
        saveContent.logicalWhMoveDetailList = gridList;

        saveContent.tenant = this.G_TENANT;
        // saveContent.logicalWhMoveDetailList[0].moveQty = 3;
        saveContent.owner = this.owner;

        console.log(this.popupData);
        console.log(saveContent);

        result = await this.service.proc(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch (e) {
        console.log(e);
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
  }

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

  // onValueChangedToWarehouse(e): void {
  //
  //   // if (this.changes.length > 0) {
  //   //   const check = await this.utilService.confirm(this.utilService.convert('inv_move_changeToWarehouse'));
  //   //
  //   //   if (check) {
  //   //     return;
  //   //   } else {
  //   //     this.mainGrid.instance.cancelEditData();
  //   //   }
  //   // }
  //   if (!e.value) {
  //     this.popupForm.formData.toWarehouseId = e.value;
  //     this.popupForm.formData.toLogisticsId = e.value;
  //     this.dsToLoc = [];
  //   } else {
  //     const data = this.dsWarehouse.filter(el => el.uid === e.value);
  //
  //     this.popupForm.formData.toWarehouseId = e.value;
  //     this.popupForm.formData.toLogisticsId = data[0].logisticsId;
  //     this.popupForm.formData.toLatitude = data[0].latitude;
  //     this.popupForm.formData.toLongitude = data[0].longitude;
  //
  //     this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
  //       this.dsToLoc = result.data;
  //     });
  //   }
  // }
  //
  // onValueChangedTransWarehouse(e): void {
  //
  //   if (!e.value) {
  //     this.popupForm.formData.transWarehouseId = e.value;
  //     this.popupForm.formData.transLogisticsId = e.value;
  //     this.dsTransLoc = [];
  //   } else {
  //     const data = this.dsWarehouse.filter(el => el.uid === e.value);
  //
  //     this.popupForm.formData.transWarehouseId = e.value;
  //     this.popupForm.formData.transLogisticsId = data[0].logisticsId;
  //     this.popupForm.formData.tranLatitude = data[0].latitude;
  //     this.popupForm.formData.tranLongitude = data[0].longitude;
  //
  //     this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
  //       this.dsTransLoc = result.data;
  //     });
  //   }
  // }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('logicalwhmove_deletebtn', '창고이동(내부)'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      // this.popupData.ptProdRqDetailList = this.popupGrid.instance.getDataSource().items();

      const deleteContent = this.popupData as LogicalWhMoveVO;

      const result = await this.service.delete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 추가버튼 이벤트
  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  onInitNewRow(e): void {
    e.data.damageFlg = 'N';
  }

  // changes -> savedata 변환
  collectGridData(changes: any): any[] {
    const gridList = [];
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

  test(e): void {
    const qty1 = e.row.qty1;
    const moveQty = e.row.moveQty;
    console.log(e);
    const moveQty1 = this.mainGrid.instance.cellValue(e.rowIndex, 'moveQty');

    console.log(moveQty1);


    if (qty1 < moveQty) {
      console.log(e.row);
      console.log(e.row.column);
    }
  }

  selectionFromLogicalWhId = (e: any) => {
    if (e.value === null)
      return;
    const findWarehouse = this.dsWarehouse.filter(el => el.sales_wh_cd === e.value);


    if (findWarehouse && findWarehouse.length > 0) {
      this.popupData.fromWarehouseId = findWarehouse[0].pwh_cd;
    }
  }

  selectionToLogicalWhId = (e: any) => {
    if (e.value === null)
      return;
    const findWarehouse = this.dsWarehouse.filter(el => el.sales_wh_cd === e.value);
    if (findWarehouse && findWarehouse.length > 0) {
      this.popupData.toWarehouseId = findWarehouse[0].pwh_cd;
    }

  }
}
