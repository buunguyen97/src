import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {ArrangeTruckService} from './arrange-truck.service';
import {SoCommonUtils} from '../soCommonUtils';
import {SoVO} from "../so/so.service";

@Component({
  selector: 'app-arrange-truck',
  templateUrl: './arrange-truck.component.html',
  styleUrls: ['./arrange-truck.component.scss']
})
export class ArrangeTruckComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: SoVO = {} as SoVO;

  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  selectedRows: number[];
  key = 'vehicleArrangeKey';
  subKey = 'uid';
  changes = [];
  dsUser = [];

  dsSts = [];
  dsCountry = [];
  dsSoType = [];
  dsItemAdminId = [];
  dsItem = [];
  dsVehicleType = [];

  subDataSource: DataSource;
  subEntityStore: ArrayStore;

  // ***** main ***** //

  // DataSet
  dsYN = [];

  dsOwner = [];
  dsActFlg = [];
  dsWarehouse = [];
  dsFilteredItemId = [];

  dsMoveStatus = [];
  dsItemAdmin = [];
  dsItemId = [];
  dsCompany = [];
  dsShipTo = [];
  dsVehicleKey = [];

  // summary
  searchList = [];

  constructor(
    public utilService: CommonUtilService,
    private service: ArrangeTruckService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.G_TENANT = this.utilService.getTenant();

    // this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);
    this.saveClick = this.saveClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.onChangeVehicleId = this.onChangeVehicleId.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

  }

  ngOnInit(): void {

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });

    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });
    this.initCode();
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.utilService.getGridHeight(this.subGrid);

    this.initForm();
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 상태
    this.codeService.getCode(this.G_TENANT, 'SOSTATUS').subscribe(result => {
      this.dsSts = result.data;
    });

    // 출고유형
    this.codeService.getCode(this.G_TENANT, 'SOTYPE').subscribe(result => {
      this.dsSoType = result.data;
    });

    // 출고처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 차량키
    this.codeService.getVehicle(this.G_TENANT).subscribe(result => {
      this.dsVehicleKey = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  // search Form 초기화
  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;
    // 공통 조회 조건 set
    // this.mainForm.instance.getEditor('fromShipSchDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toShipSchDate').option('value', rangeDate.toDate);
    this.mainForm.instance.getEditor('sts').option('value', SoCommonUtils.STS_ACCEPTED);

    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.initCode();
    // this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {
    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });

    const data = this.mainForm.instance.validate();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

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
        await this.mainGrid.instance.deselectAll();
      } else {
        return;
      }
    }
  }

  onToolbarPreparing(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push({  // second
      location: 'after',
      widget: 'dxButton',
      options: {
        type: 'default',
        icon: 'check',
        text: this.utilService.convert1('com_btn_merge', '합치기'),
        onClick: this.onMerge.bind(this)
      }
    });

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));         // first
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));        // second
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton')); // third
    e.toolbarOptions.items = newToolbarItems;
  }

  addClick(e): void {
    this.subGrid.instance.addRow().then(r => {
      const rowIdx = this.subGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.subGrid);
    });
  }

  async deleteClick(e): Promise<void> {
    if (this.subGrid.focusedRowIndex > -1) {
      this.subGrid.instance.deleteRow(this.subGrid.focusedRowIndex);
      this.subEntityStore.push([{type: 'remove', key: this.subGrid.focusedRowKey}]);
    }
  }

  // 조회
  async onSearchSub(data): Promise<void> {
    this.subGrid.instance.cancelEditData();

    const result = await this.service.getArrangeTruckDetail(data);

    if (this.resultMsgCallback(result, 'DetailSearch')) {

      // this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.mainFormData.warehouseId.toString()).subscribe(locationResult => {
      //   this.dsVehicleId = locationResult.data;
      // });
      this.subEntityStore = new ArrayStore(
        {
          key: this.subKey,
          data: result.data
        }
      );
      this.subDataSource = new DataSource({
        store: this.subEntityStore
      });
      this.subGrid.focusedRowKey = null;
      this.subGrid.paging.pageIndex = 0;
    } else {
      return;
    }
  }

  async onVehicleIdChange(e): Promise<void> {
    // if (e.fullName === 'editing.changes') {
    //   const rowNum = this.subGrid.focusedRowIndex;
    //
    //   if (e.value.length > 0 && e.value[0].data && e.value[0].data.vehicleId) {
    //     console.log('kkkkk');
    //     console.log(rowNum);
    //     console.log(e.value);
    //     const data = this.dsVehicleKey.filter(el => el.uid === e.value[0].data.vehicleId);
    //     console.log(data);
    //     console.log('dahee');
    //     e.value[0].data.vehicleType = data[0].vehicleType;
    //     e.value[0].data.cbm = data[0].cbm;
    //     e.value[0].data.cbmAble = data[0].cbmAble;
    //     // 현재 포커스있는 Row Get
    //     // 그 Row의 Cell 값 할당.
    //     // rowData.vehicleType = data[0].vehicleType;
    //   }
    // }
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  // onValueChangedItemAdminId(e): void {
  //   this.mainForm.instance.getEditor('itemId').option('value', null);
  //   if (!e.value) {
  //     this.dsItemId = null;
  //     return;
  //   }
  //   const findValue = this.dsItemAdminId.filter(code => code.uid === e.value);
  //
  //   this.codeService.getItemWithItemAdminId(this.G_TENANT, findValue[0].uid).subscribe(result => {
  //     this.dsItemId = result.data;
  //   });
  // }

  async saveClick(): Promise<void> {
    // const columns = ['messageKey'];
    const tempData = this.collectGridData(this.changes);

    if (this.changes.length > 0) {
      const msgStr = this.utilService.convert('com_btn_save');
      const confirmMsg = this.utilService.convert('confirmExecute', msgStr);

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      this.subGrid.instance.saveEditData();
      const result = await this.service.save(tempData);

      if (result.success) {
        this.utilService.notify_success('save success');
      } else {
        this.utilService.notify_success('save failed');
      }
      const findRow = this.mainGrid.instance.byKey(this.mainGrid.focusedRowKey);

      findRow.then((selectedRow) => {
          this.onSearchSub(selectedRow);
        }
      );
    } else {
      //  변경된 데이터가 없습니다.
      const msg = this.utilService.convert('noChangedData');
      this.utilService.notify_error(msg);
      return;
    }
    // for (const item of tempData) {
    //   if (item.type === 'delete') {
    //     return;
    //   }
    // }

  }

  async onMerge(): Promise<void> {
    const msgStr = this.utilService.convert('com_btn_merge');

    const selectRowKeys = this.mainGrid.selectedRowKeys;

    if (selectRowKeys.length > 0) {
      const confirmMsg = this.utilService.convert('confirmExecute', msgStr);

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      // console.log(this.mainGrid.instance.getSelectedRowsData());
      // console.log(this.mainGrid.instance.getSelectedRowKeys());
      // console.log(this.mainGrid.instance.getVisibleRows());
      // return;

      const result = await this.service.merge(this.mainGrid.instance.getSelectedRowsData());

      if (result.success) {
        this.utilService.notify_success('save success');
        this.onSearch();
      } else {
        this.utilService.notify_success('save failed');
      }
    } else {
      this.utilService.notify_error(this.utilService.convert('com_msg_noselectData', msgStr));
    }
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT,
          vehicleArrangeKey: this.mainGrid.focusedRowKey
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
              vehicleArrangeKey: this.mainGrid.focusedRowKey
            }, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
              vehicleArrangeKey: this.mainGrid.focusedRowKey
            }, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);

    if (e.data) { // && !

      if (e.data.key) {
        e.data.tenant = '1000';
      }

      this.onSearchSub(e.data);
    }
  }

  // 그리드 상태 저장
  saveStateGrid1 = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('so_arrangetruck', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadStateGrid1 = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('so_arrangetruck');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 그리드 상태 저장
  saveStateSub = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('so_arrangetruck3', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadStateSub = () => {
    return new Promise((resolve, reject) => {

      const data = localStorage.getItem('so_arrangetruck3');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // onFocusedCellChangingDetail(e, grid): void {
  //   console.log(e.focusedRowIndex);
  //   this.subGrid.focusedRowIndex = e.focusedRowIndex;
  // }

  onChangeVehicleId(rowData: any, value: any): void {
    const data = this.dsVehicleKey.filter(el => el.uid === value);
    if (data) {
      rowData.vehicleId = value;
      rowData.vehicleType = data[0].vehicleType;
      rowData.cbm = data[0].cbm;
      rowData.cbmAble = data[0].cbmAble;
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }

  onSelectionClick(e): void {
    if (e.rowType === 'header' && e.column.type === 'selection') {
      // console.log('여기니?');
    }
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }
}
