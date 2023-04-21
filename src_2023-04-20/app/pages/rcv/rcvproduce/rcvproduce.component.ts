import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxFileUploaderComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvproduceService, RcvProduceVO} from './rcvproduce.service';
import {RcvCommonUtils} from '../rcvCommonUtils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-rcvproduce',
  templateUrl: './rcvproduce.component.html',
  styleUrls: ['./rcvproduce.component.scss']
})
export class RcvproduceComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;

  // Global
  G_TENANT: any;
  changes = [];

  // ***** main ***** //
  // Form
  mainFormData: RcvProduceVO = {} as RcvProduceVO;
  dsLocGroup = [];
  dsLocationId = [];
  dsItemId = [];
  dsWarehouseId = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  dsItem = [];
  dsOwner = [];
  dsUser = [];
  dsFilteredItemId = [];
  dsSpec = [];

  // Grid
  mainGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  key = 'logicalKey';
  dsLocId = [];
  dsRcvkey = [];
  dsLocation = [];

  // serial
  serialPopupVisible = false;
  serialDataSource: DataSource;
  serialEntityStore: ArrayStore;
  serialFormData: any;

  currTenant: any;
  currRcvId: any;
  currRcvDetailId: any;
  currExpectQty: any;
  currentItemId: any;

  // ***** main ***** //
  dxDamageFlg = [];
  dsYN = [];
  dsDamageFlg = [];

  GRID_STATE_KEY = 'rcv_rcvproduct';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  loadStateTag = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_tag');
  saveStateTag = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_tag');

  constructor(public utilService: CommonUtilService,
              private service: RcvproduceService,
              private codeService: CommonCodeService,
              private rcvUtil: RcvCommonUtils,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.onSerialCancelClick = this.onSerialCancelClick.bind(this);
    this.onSerialUploadClick = this.onSerialUploadClick.bind(this);
    this.onSerialDeleteClick = this.onSerialDeleteClick.bind(this);
    this.onSerialPopupClick = this.onSerialPopupClick.bind(this);
    this.onSerialPopupClosed = this.onSerialPopupClosed.bind(this);
  }

  ngOnInit(): void {
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

    this.serialEntityStore = new ArrayStore(
      {
        data: [],
        key: 'serial'
      }
    );
    this.serialDataSource = new DataSource({
      store: this.serialEntityStore
    });
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 조회조건 로케이션
    this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.utilService.getCommonWarehouseId().toString()).subscribe(result => {
      this.dsLocationId = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocId = result.data;
    });

    // 회사
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
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

        await this.mainGrid.instance.deselectAll();
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

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(grid, e.rowIndex);
  }

  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  // 생산입고
  async executeRcvProduce(e): Promise<void> {
    await this.mainGrid.instance.saveEditData();
    const dataList = this.mainGrid.instance.getSelectedRowsData();

    if (dataList.length > 0) {

      for (const data of dataList) {
        if (!data.moveQty) {
          const msg = this.utilService.convert('com_valid_required', this.utilService.convert('rcvProduce.moveQty'));
          this.utilService.notify_error(msg);
          return;
        }
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('rcvProduce.executeBtn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const result = await this.service.executeRcvProduce(dataList);
      if (result.success) {
        await this.onSearch();
        await this.mainGrid.instance.deselectAll();
      } else {
        this.utilService.notify_error(result.msg);
      }
    } else {
      // 생산입고 리스트를 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcvProduct.mainGridTitle'));
      this.utilService.notify_error(msg);
      return;
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
    this.mainForm.instance.focus();
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === RcvCommonUtils.FLAG_TRUE;
  }

  async onSerialPopupClick(e, rowIdx: any): Promise<void> {

    const mainGridIdx = this.mainGrid.focusedRowIndex;
    const serialList = this.mainGrid.instance.cellValue(mainGridIdx, 'serialList');
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
    }

    this.serialPopupVisible = true;
  }

  // 팝업 추가 부분
  onSerialPopupShown(e): void {
    const rowIdx = this.mainGrid.focusedRowIndex;
    this.currExpectQty = this.mainGrid.instance.cellValue(rowIdx, 'moveQty');
    this.currentItemId = this.mainGrid.instance.cellValue(rowIdx, 'itemId');
    this.serialFormData.expectQty1 = this.mainGrid.instance.cellValue(rowIdx, 'moveQty');
    this.serialFormData.itemId = this.mainGrid.instance.cellValue(rowIdx, 'itemId');

    this.serialPopupVisible = true;
  }

  onSerialPopupClosed(e): void {
    this.serialForm.instance.resetValues();
    this.serialEntityStore.clear();
    this.serialDataSource.reload();
  }

  async onSerialDeleteClick(e): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      const result = await this.rcvUtil.deleteTag({
        tenant: this.currTenant,
        rcvId: this.currRcvId,
        rcvDetailId: this.currRcvDetailId
      });
      try {
        if (result.success) {
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
    // 선택한 재고 하위에 시리얼 목록 저장
    // 다시 선택하면 불러오고

    const serialList = this.serialDataSource.items();

    if ((serialList !== undefined) && (serialList.length > 0)) {
      // 예정수량 대비 체크
      if (this.currExpectQty !== serialList.length) {
        // 예정수량과 시리얼수량이 일치하지 않습니다.
        const expectedQtyMsg = this.utilService.convert('inv_moveLocation_moveQty');
        const tagQtyMsg = this.utilService.convert('rcvDetail.tagQty');
        const msg = this.utilService.convert('not_equal_values', expectedQtyMsg, tagQtyMsg);
        this.utilService.notify_error(msg);
        return;
      }

      const mainGridIdx = this.mainGrid.focusedRowIndex;
      this.mainGrid.instance.cellValue(mainGridIdx, 'serialList', this.serialDataSource.items());
      this.mainGrid.instance.cellValue(this.mainGrid.focusedRowIndex, 'tagQty', serialList.length);

      this.serialDataSource.reload();
      // this.utilService.notify_success('Save success');
      this.onSerialPopupClear();

    } else {
      // this.utilService.notify_error('There was an error!');
    }

    this.serialPopupVisible = false;
    return;
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
          Sheet1[key].rcvId = this.currRcvId;
          Sheet1[key].rcvDetailId = this.currRcvDetailId;
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

    const mainGridIdx = this.mainGrid.focusedRowIndex;
    this.mainGrid.instance.cellValue(mainGridIdx, 'serialList', null);
    this.mainGrid.instance.cellValue(mainGridIdx, 'tagQty', 0);
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
}
