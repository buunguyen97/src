import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {InvadjustService, InvAdjustVO} from './invadjust.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../../rcv/rcvCommonUtils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-invadjust',
  templateUrl: './invadjust.component.html',
  styleUrls: ['./invadjust.component.scss']
})
export class InvadjustComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  // @ViewChild('procAdjustBtn', {static: false}) procAdjustBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('mainPopup', {static: false}) mainPopup: DxPopupComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;

  @ViewChild('beginInvListGrid', {static: false}) beginInvListGrid: DxDataGridComponent;
  @ViewChild('beginInvForm', {static: false}) beginInvForm: DxFormComponent;
  @ViewChild('fromAdjustDate', {static: false}) fromAdjustDate: DxDateBoxComponent;
  @ViewChild('toAdjustDate', {static: false}) toAdjustDate: DxDateBoxComponent;

  dsAdjustType = []; // 조정유형
  dsAdjustSts = []; // 상태
  dsWarehouse = []; // 창고
  dsItemAdmin = []; // 품목관리사
  dsItemId = []; // 품목
  dsLocation = []; // 로케이션
  dsActFlg = []; // 사용여부
  dsDamageFlg = []; // 불량여부
  dsUser = []; // 사용자
  dsOwner = []; // 화주

  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupData: InvAdjustVO;

  // serial
  serialPopupVisible = false;
  serialDataSource: DataSource;
  serialEntityStore: ArrayStore;
  serialFormData: any;

  currTenant: any;
  currAdjustId: any;
  currAdjustDetailId: any;
  currAdjustQty: any;
  currentItemId: any;

  // Global
  G_TENANT: any;

  mainFormData: InvAdjustVO = {} as InvAdjustVO;

  // grid
  dataSource: DataSource;
  popupDataSource: DataSource;
  entityStore: ArrayStore;
  popupEntityStore: ArrayStore;
  key = 'uid';
  changes = [];
  GRID_STATE_KEY = 'inv_invadjust1';
  STS_ADJUSTED_KEY = '500';

  beginInvPopupVisible = false;
  beginInvDataSource: DataSource;
  beginInvEntityStore: ArrayStore;
  beginInvFormData: any;
  trafficFilter = [];

  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  loadStateTag = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_tag');
  saveStateTag = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_tag');

  loadStateBeginInv = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_beginInv');
  saveStateBeginInv = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_beginInv');

  constructor(public utilService: CommonUtilService,
              private service: InvadjustService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();

    this.onValueChangedWarehouseId = this.onValueChangedWarehouseId.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.procAdjust = this.procAdjust.bind(this);
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.getFilteredLocation = this.getFilteredLocation.bind(this);
    this.setItemValue = this.setItemValue.bind(this);
    this.onSerialCancelClick = this.onSerialCancelClick.bind(this);
    this.onSerialUploadClick = this.onSerialUploadClick.bind(this);
    this.onSerialDeleteClick = this.onSerialDeleteClick.bind(this);
    this.isAllowEditing = this.isAllowEditing.bind(this);
    this.onBeginInvFileUploader = this.onBeginInvFileUploader.bind(this);
    this.onBeginInvUploadClick = this.onBeginInvUploadClick.bind(this);
    this.onBeginInvCancelClick = this.onBeginInvCancelClick.bind(this);
    this.onBeginInvDeleteClick = this.onBeginInvDeleteClick.bind(this);

    this.trafficFilter = [
      {
        text: 'Y',
        value: ['isRed', '=', true]
      },
      {
        text: 'N',
        value: ['isRed', '=', false]
      }
    ];
  }

  ngOnInit(): void {

    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.dataSource = new DataSource({
      store: this.entityStore
    });

    // 조정유형
    this.codeService.getCode(this.G_TENANT, 'ADJUSTTYPE').subscribe(result => {
      this.dsAdjustType = result.data;
    });

    // 조정상태
    this.codeService.getCode(this.G_TENANT, 'ADJUSTSTATUS').subscribe(result => {
      this.dsAdjustSts = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 화주
    this.codeService.getCommonOwner(this.G_TENANT).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
    rowData.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;          // 시리얼여부
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromAdjustDate.value = rangeDate.fromDate;
    this.toAdjustDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('fromAdjustDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toAdjustDate').option('value', rangeDate.toDate);
    this.mainForm.instance.getEditor('adjustType').option('value', 'ADJ');
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('sts').option('value', '100'); // 예정
    this.mainForm.instance.focus();
  }

  addClick(e): void {
    if (this.popupData.sts !== '100') {
      return;
    }
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  async deleteClick(e): Promise<void> {
    if (this.popupData.sts !== '100') {
      return;
    }
    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;
      this.popupGrid.instance.deleteRow(focusedIdx);
      this.entityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  onInitNewRow(e): void {
    e.data.itemAdminId = this.utilService.getCommonItemAdminId();
    e.data.damageFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.noShippingFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.foreignCargoFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.customsReleaseFlg = RcvCommonUtils.FLAG_FALSE;
    e.data.taxFlg = RcvCommonUtils.FLAG_FALSE;
  }

  setFocusRow(index, grid): void {
    grid.instance.deselectAll();
    grid.focusedRowIndex = index;
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromAdjustDate = document.getElementsByName('fromAdjustDate').item(1).getAttribute('value');
      this.mainFormData.toAdjustDate = document.getElementsByName('toAdjustDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
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
      }
    }
  }

  async onSearchPopup(): Promise<void> {
    if (this.popupData.uid) {
      const result = await this.service.findAdjustFull(this.popupData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.adjustDetailList,
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

  // 그리드 Lookup filter 품목
  getFilteredItemId(options): any {
    return {
      store: this.dsItemId,
      filter: options.data ? ['itemAdminId', '=', options.data.itemAdminId] : null
    };
  }

  // 그리드 Lookup filter 로케이션
  getFilteredLocation(options): any {
    return {
      store: this.dsLocation,
      filter: options.data ? ['warehouseId', '=', this.popupData.warehouseId] : null
    };
  }

  // 그리드 품목관리사 value setter
  setItemAdminValue(rowData: any, value: any): void {
    rowData.itemAdminId = value;
    rowData.itemId = null;
    rowData.unit = null;
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === RcvCommonUtils.FLAG_TRUE;
  }

  // 신규
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    // this.procAdjustBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }

  // Popup 관련
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

    // 신규
    if (popupMode === 'Add') {
      data.adjustDate = this.gridUtil.getToday();
    }

    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.onSearchPopup();
  }

  isAllowEditing(): boolean {
    return this.popupData.sts === '100';
  }

  popupShown(e): void {
    // 팝업 그리드 사이즈 조정
    this.utilService.setPopupGridHeight(this.mainPopup, this.popupForm, this.popupGrid);
    const disabledFlg = this.popupMode === 'Edit';

    if (this.popupMode === 'Add') {
      this.popupData.sts = '100'; // 예정
      this.popupData.warehouseId = this.utilService.getCommonWarehouseId();
      this.popupData.ownerId = this.utilService.getCommonOwnerId();
      this.popupData.adjustType = 'ADJ';
      this.popupData.isIf = 'N';

    } else if (this.popupMode === 'Edit') {
      this.deleteBtn.visible = this.popupData.sts === '100';
    }

    this.saveBtn.visible = this.popupData.sts === '100';

    this.popupForm.instance.getEditor('adjustDate').option('disabled', disabledFlg);  // 조정일
    this.popupForm.instance.getEditor('adjustType').option('disabled', disabledFlg);  // 조정유형
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  async popupSaveClick(): Promise<void> {

    // 시리얼 등록 여부 체크
    for (const change of this.changes) {

      const idx = this.popupGrid.instance.getRowIndexByKey(change.key);

      // 시리얼 여부 - 조정수량 시리얼수량 검사
      if (this.popupGrid.instance.cellValue(idx, 'isSerial') === RcvCommonUtils.FLAG_TRUE) {

        const adjustQty1 = this.popupGrid.instance.cellValue(idx, 'adjustQty1');
        const tagQty = this.popupGrid.instance.cellValue(idx, 'tagQty');

        if (adjustQty1 !== tagQty && adjustQty1 !== (tagQty * -1)) {
          // 예정수량과 시리얼수량이 일치하지 않습니다.
          const expectedQtyMsg = this.utilService.convert('inv_invadjust_adjustQty1');
          const tagQtyMsg = this.utilService.convert('inv_invadjust_tagQty');
          const msg = this.utilService.convert('not_equal_values', expectedQtyMsg, tagQtyMsg);
          this.utilService.notify_error(msg);
          return;
        }
      }
    }


    const messages = {
      itemAdminId: 'inv_phyconfirmed_itemAdminId',
      itemId: 'inv_phyconfirmed_itemId',
      locId: 'inv_phyconfirmed_locId',
      adjustQty1: 'inv_phyconfirmed_adjustQty1'
    };
    const columns = ['itemAdminId', 'itemId', 'locId', 'adjustQty1'];    // required 컬럼 dataField 정의
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      try {
        let result;
        const saveContent = this.popupData as InvAdjustVO;
        const detailList = this.collectGridData(this.changes);

        for (const item of detailList) {

          const filtered = detailList.filter(el => el.uid === item.uid);

          if (filtered.length > 0) {
            const idx = this.popupGrid.instance.getRowIndexByKey(filtered[0].uid);

            this.popupGrid.instance.cellValue(idx, 'lot1', filtered[0].lot1 || this.popupGrid.instance.cellValue(idx, 'lot1'));
            this.popupGrid.instance.cellValue(idx, 'lot2', filtered[0].lot2 || this.popupGrid.instance.cellValue(idx, 'lot2'));
            this.popupGrid.instance.cellValue(idx, 'lot3', filtered[0].lot3 || this.popupGrid.instance.cellValue(idx, 'lot3'));
            this.popupGrid.instance.cellValue(idx, 'lot4', filtered[0].lot4 || this.popupGrid.instance.cellValue(idx, 'lot4'));
            this.popupGrid.instance.cellValue(idx, 'lot5', filtered[0].lot5 || this.popupGrid.instance.cellValue(idx, 'lot5'));
            this.popupGrid.instance.cellValue(idx, 'lot6', filtered[0].lot6 || this.popupGrid.instance.cellValue(idx, 'lot6'));
            this.popupGrid.instance.cellValue(idx, 'lot7', filtered[0].lot7 || this.popupGrid.instance.cellValue(idx, 'lot7'));
            this.popupGrid.instance.cellValue(idx, 'lot8', filtered[0].lot8 || this.popupGrid.instance.cellValue(idx, 'lot8'));
            this.popupGrid.instance.cellValue(idx, 'lot9', filtered[0].lot9 || this.popupGrid.instance.cellValue(idx, 'lot9'));
            this.popupGrid.instance.cellValue(idx, 'lot10', filtered[0].lot10 || this.popupGrid.instance.cellValue(idx, 'lot10'));
            this.popupGrid.instance.cellValue(idx, 'damageFlg',
              filtered[0].damageFlg || this.popupGrid.instance.cellValue(idx, 'damageFlg'));
            this.popupGrid.instance.cellValue(idx, 'noShippingFlg',
              filtered[0].noShippingFlg || this.popupGrid.instance.cellValue(idx, 'noShippingFlg'));
            this.popupGrid.instance.cellValue(idx, 'foreignCargoFlg',
              filtered[0].foreignCargoFlg || this.popupGrid.instance.cellValue(idx, 'foreignCargoFlg'));
            this.popupGrid.instance.cellValue(idx, 'customsReleaseFlg',
              filtered[0].customsReleaseFlg || this.popupGrid.instance.cellValue(idx, 'customsReleaseFlg'));
            this.popupGrid.instance.cellValue(idx, 'taxFlg', filtered[0].taxFlg || this.popupGrid.instance.cellValue(idx, 'taxFlg'));
            this.popupGrid.instance.cellValue(idx, 'whInDate', filtered[0].whInDate || this.popupGrid.instance.cellValue(idx, 'whInDate'));
            this.popupGrid.instance.cellValue(idx, 'mngDate', filtered[0].mngDate || this.popupGrid.instance.cellValue(idx, 'mngDate'));
          }

          if (!item.key && !item.uid) {
            for (const col of columns) {
              if ((item[col] === undefined) || (item[col] === '')) {
                const msg = this.utilService.convert('com_valid_required', this.utilService.convert(messages[col]));
                this.utilService.notify_error(msg);
                return;
              }
            }
          }

          this.popupGrid.instance.byKey(item.key).then(
            (dataItem) => {
              for (const col of columns) {
                if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
                  const msg = this.utilService.convert('com_valid_required', this.utilService.convert(messages[col]));
                  this.utilService.notify_error(msg);
                  return;
                }
              }
            }
          );
        }

        const ownerId = this.mainForm.instance.getEditor('ownerId').option('value');
        saveContent.companyId = ownerId;
        saveContent.adjustDetailList = detailList;

        const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert('invAdjust'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }
        console.log(saveContent);

        if (this.popupMode === 'Add') {
          result = await this.service.saveAdjust(saveContent);
        } else {
          result = await this.service.updateAdjust(saveContent);
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
    }
  }

  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();

    // 재조회
    this.onSearch();
  }

  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('invAdjust', '재고조정'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      const deleteContent = this.popupData as InvAdjustVO;
      const result = await this.service.deleteAdjust(deleteContent);
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

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = e.data.sts !== this.STS_ADJUSTED_KEY;
    // this.procAdjustBtn.visible = e.data.sts !== this.STS_ADJUSTED_KEY;  // 조정완료가 아닐 경우
    this.showPopup('Edit', {...e.data});
  }

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
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
              tenant: this.G_TENANT
            }, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  onValueChangedWarehouseId(e): void {
    const findValue = this.dsWarehouse.filter(code => code.uid === e.value);

    this.popupData.companyId = findValue.length > 0 ? findValue[0].logisticsId : null;
    this.popupData.logisticsId = findValue.length > 0 ? findValue[0].logisticsId : null;
  }

  async procAdjust(): Promise<void> {
    try {
      // const detailList = this.popupGrid.instance.getDataSource().items();

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('invAdjust', '재고조정'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }


      const adjustIdList = [];

      adjustIdList.push(this.popupData.uid);
      const result = await this.service.procAdjust(adjustIdList);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Adjust Success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch (e) {
      this.utilService.notify_error('There was an error!');
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }

  async onSerialPopupClick(e, rowIdx: any): Promise<void> {
    this.currTenant = this.popupGrid.instance.cellValue(rowIdx, 'tenant');
    this.currAdjustId = this.popupGrid.instance.cellValue(rowIdx, 'adjustId');
    this.currAdjustDetailId = this.popupGrid.instance.cellValue(rowIdx, 'uid');

    const serialList = this.popupGrid.instance.cellValue(rowIdx, 'serialList');
    if (serialList) {
      this.serialEntityStore = new ArrayStore(
        {
          data: serialList,
          key: 'serial'
        }
      );

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });
      this.serialPopupVisible = true;
      return;
    }

    if (!this.currAdjustDetailId) {
      this.serialPopupVisible = true;
      return;
    }

    const sendData = {
      tenant: this.currTenant,
      adjustId: this.currAdjustId,
      adjustDetailId: this.currAdjustDetailId
    };
    try {
      const result = await this.service.getTag(sendData);

      if (result.success) {
        for (const key in result.data) {
          if (result.data.hasOwnProperty(key)) {
            result.data[key].tenant = this.currTenant;
            result.data[key].adjustId = this.currAdjustId;
            result.data[key].adjustDetailId = this.currAdjustDetailId;
          }
        }

        this.serialEntityStore = new ArrayStore(
          {
            data: result.data,
            key: 'serial'
          }
        );

        this.serialDataSource = new DataSource({
          store: this.serialEntityStore
        });
        this.utilService.notify_success('Search success');
        this.serialPopupVisible = true;
      } else {
        this.utilService.notify_error(result.msg);
      }
    } catch (e) {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 팝업 추가 부분
  onSerialPopupShown(e): void {

    const rowIdx = this.popupGrid.focusedRowIndex;
    this.currAdjustQty = this.popupGrid.instance.cellValue(rowIdx, 'adjustQty1');
    this.currentItemId = this.popupGrid.instance.cellValue(rowIdx, 'itemId');
    this.serialFormData.adjustQty1 = this.popupGrid.instance.cellValue(rowIdx, 'adjustQty1');
    this.serialFormData.itemId = this.popupGrid.instance.cellValue(rowIdx, 'itemId');

    this.serialPopupVisible = true;
  }

  onSerialPopupClosed(e): void {
    this.serialForm.instance.resetValues();
    this.serialEntityStore.clear();
    this.serialDataSource.reload();
  }

  async onSerialDeleteClick(e): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      const result = await this.service.deleteTag({
        tenant: this.currTenant,
        adjustId: this.currAdjustId,
        adjustDetailId: this.currAdjustDetailId
      });
      try {
        if (result.success) {
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'tagQty', 0);
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'receivedQty1', 0);

          this.fileUploader.instance.reset();
          this.serialEntityStore.clear();
          this.serialDataSource.reload();
          this.utilService.notify_success('Delete success');
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  async onSerialUploadClick(): Promise<void> {
    this.serialDataSource.store().load().then(async (res) => {
      if (res !== undefined && res.length > 0) {
        try {
          const sendData = this.serialDataSource.items();

          // 예정수량 대비 체크
          if (this.currAdjustQty !== res.length && this.currAdjustQty !== (res.length * -1)) {
            // 예정수량과 시리얼수량이 일치하지 않습니다.
            const expectedQtyMsg = this.utilService.convert('inv_invadjust_adjustQty1');
            const tagQtyMsg = this.utilService.convert('rcvDetail.tagQty');
            const msg = this.utilService.convert('not_equal_values', expectedQtyMsg, tagQtyMsg);
            this.utilService.notify_error(msg);
            return;
          }

          this.serialDataSource.reload();
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'serialList', res);
          this.popupGrid.instance.cellValue(this.popupGrid.focusedRowIndex, 'tagQty', res.length);
          this.utilService.notify_success('Save success');
          this.onSerialPopupClear();
          this.serialPopupVisible = false;
          return;
        } catch {
          this.utilService.notify_error('There was an error!');
        }
      }
    });
  }

  onSerialCancelClick(): void {
    this.onSerialPopupClear();
    this.serialPopupVisible = false;
  }

  onSerialPopupClear(): void {
  }

  async onSerialFileUploader(fileUploader: DxFileUploaderComponent): Promise<void> {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = fileUploader.value[0];

    if (!file) {
      return;
    }

    let Sheet1 = [];
    reader.onload = (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      Sheet1 = mapData.Sheet1;
      for (const key in Sheet1) {
        if (Sheet1.hasOwnProperty(key)) {
          Sheet1[key].tenant = this.currTenant;
          Sheet1[key].adjustId = this.currAdjustId;
          Sheet1[key].adjustDetailId = this.currAdjustDetailId;
        }
      }

      this.serialEntityStore = new ArrayStore(
        {
          data: Sheet1,
          key: 'serial'
        }
      );

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });

      this.serialDataSource.reload();
    };

    reader.readAsBinaryString(file);
  }

  onResetFileUploader(fileUploader: DxFileUploaderComponent): void {

    this.serialEntityStore.clear();
    this.serialDataSource.reload();

    fileUploader.instance.reset();

    // this.onSerialPopupClick(null, this.subGrid.focusedRowIndex);

    this.serialEntityStore = new ArrayStore(
      {data: [], key: 'serial'});

    this.serialDataSource = new DataSource({
      store: this.serialEntityStore
    });
  }

  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('serialTemplete', '양식다운로드'),
        onClick: this.downloadExcel.bind(this)
      }
    });

    e.toolbarOptions.items = newToolbarItems;
  }

  async downloadExcel(): Promise<void> {
    this.utilService.downloadSerialExcel();
  }

  /**
   *   기초재고 업로드 추가
   */
  async onBeginInvClick(e): Promise<void> {
    this.beginInvPopupVisible = true;
  }

  onBeginInvPopupClose(e): void {
    this.beginInvForm.instance.resetValues();
    this.beginInvEntityStore.clear();
    this.beginInvDataSource.reload();
  }

  async onBeginInvUploadClick(): Promise<void> {

    this.beginInvDataSource.store().load().then(async (res) => {

      if (res !== undefined && res.length > 0) {
        try {
          const sendData = this.beginInvDataSource.items();
          const result = await this.service.saveBeginInv(res);
          if (result.success) {
            this.beginInvDataSource.reload();
            this.utilService.notify_success('Save success');
            this.onBeginInvPopupClear();
            this.beginInvPopupVisible = false;

            this.onSearch();
          } else {
            const errMsg = JSON.parse(result.msg);
            let rowIndex = 0;
            for (const data of sendData) {
              if (data[errMsg.key] === errMsg.value) {
                this.beginInvListGrid.focusedRowIndex = rowIndex;
              }
              rowIndex++;
            }
            this.utilService.notify_error(errMsg.msg);
          }
        } catch {
          this.utilService.notify_error('There was an error!');
        }
      }
    });

    //
    // if ((this.beginInvDataSource.items() !== undefined) && (this.beginInvDataSource.items().length > 0)) {
    //   try {
    //     const sendData = this.beginInvDataSource.items();
    //     const result = await this.service.saveBeginInv(sendData);
    //     if (result.success) {
    //       this.beginInvDataSource.reload();
    //       this.utilService.notify_success('Save success');
    //       this.onBeginInvPopupClear();
    //       this.beginInvPopupVisible = false;
    //
    //       this.onSearch();
    //     } else {
    //       const errMsg = JSON.parse(result.msg);
    //       let rowIndex = 0;
    //       for (const data of sendData) {
    //         if (data[errMsg.key] === errMsg.value) {
    //           this.beginInvListGrid.focusedRowIndex = rowIndex;
    //         }
    //         rowIndex++;
    //       }
    //       this.utilService.notify_error(errMsg.msg);
    //     }
    //   } catch {
    //     this.utilService.notify_error('There was an error!');
    //   }
    // }
  }

  onBeginInvCancelClick(): void {
    this.beginInvPopupVisible = false;
    this.onBeginInvPopupClear();
  }

  onBeginInvPopupClear(): void {
  }

  async onBeginInvDeleteClick(e): Promise<void> {
    if ((this.beginInvDataSource.items() !== undefined) && (this.beginInvDataSource.items().length > 0)) {
      const result = await this.service.deleteBeginInv({
        tenant: this.currTenant,
      });
      try {
        if (result.success) {
          this.fileUploader.instance.reset();
          this.beginInvEntityStore.clear();
          await this.beginInvDataSource.reload();

          this.utilService.notify_success('Delete success');
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  async onBeginInvFileUploader(fileUploader: DxFileUploaderComponent): Promise<void> {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = fileUploader.value[0];

    if (!file) {
      return;
    }

    let Sheet1 = [];
    reader.onload = (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      let gridList = [];
      Sheet1 = mapData.Sheet1;
      for (const key in Sheet1) {
        if (!Sheet1[key].ownerId) {
          continue;
        }

        if (Sheet1.hasOwnProperty(key)) {
          Sheet1[key].tenant = this.G_TENANT;
        }

        gridList.push(Sheet1[key]);
      }

      gridList = gridList.splice(1);

      this.beginInvEntityStore = new ArrayStore(
        {
          data: gridList,
          key: ['ownerId', 'adjustDate', 'warehouseId', 'itemId', 'locId', 'damageFlg', 'whInDate', 'adjustQty1']
        }
      );

      this.beginInvDataSource = new DataSource({
        store: this.beginInvEntityStore
      });
      this.beginInvDataSource.reload();
    };

    reader.readAsBinaryString(file);

  }

  onBeginInvResetFileUploader(fileUploader: DxFileUploaderComponent): void {

    this.beginInvEntityStore.clear();
    this.beginInvDataSource.reload();

    fileUploader.instance.reset();

    this.beginInvEntityStore = new ArrayStore(
      {data: [], key: 'uid'});

    this.beginInvDataSource = new DataSource({
      store: this.beginInvEntityStore
    });
  }

  onToolbarPreparingWithExtra2(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('beginInvTemplete', '양식다운로드'),
        onClick: this.downloadBeginInvExcel.bind(this)
      }
    });

    e.toolbarOptions.items = newToolbarItems;
  }

  async downloadBeginInvExcel(): Promise<void> {
    this.utilService.downloadBeginInvExcel();
  }

}
