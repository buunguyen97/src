import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {SoDetailVO, SoVO} from '../so/so.service';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import _ from 'lodash';
import {SodirectshipService} from './sodirectship.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../../rcv/rcvCommonUtils';
import * as XLSX from 'xlsx';
import {SoinspectService} from '../soinspect/soinspect.service';

@Component({
  selector: 'app-sodirectship',
  templateUrl: './sodirectship.component.html',
  styleUrls: ['./sodirectship.component.scss']
})
export class SodirectshipComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('serialPopup', {static: false}) serialPopup: DxPopupComponent;

  @ViewChild('popupMainGrid', {static: false}) popupMainGrid: DxDataGridComponent;
  @ViewChild('popupSubGrid', {static: false}) popupSubGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('tagGrid', {static: false}) tagGrid: DxDataGridComponent;

  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;
  @ViewChild('fromShipDate', {static: false}) fromShipDate: DxDateBoxComponent;
  @ViewChild('toShipDate', {static: false}) toShipDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: SoVO = {} as SoVO;
  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  popupMainGridDataSource: DataSource;
  popupMainEntityStore: ArrayStore;
  popupSubGridDataSource: DataSource;
  popupSubEntityStore: ArrayStore;

  // serial
  serialPopupVisible = false;
  serialDataSource: DataSource;
  serialEntityStore: ArrayStore;
  serialFormData: any;

  currTenant: any;
  currSoId: any;
  currSoDetailId: any;
  currExpectQty: any;
  currentItemId: any;
  currentItemAdminId: any;


  selectedRows: number[];
  key = 'uid';
  dsUser = [];

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: SoVO;
  // Grid
  codeList: SoDetailVO[];

  // Changes
  changes = [];
  // ***** popup ***** //

  // DataSet
  dsSoType = [];
  dsOwner = [];
  dsActFlg = [];
  dsWarehouse = [];
  dsSoStatus = [];
  dsItemAdmin = [];
  dsItemId = [];
  dsCompany = [];
  dsShipTo = [];
  dsCountry = [];
  dsPort = [];
  dsCustomerPort = [];
  dsLocation = [];
  dsDamageFlg = [];

  PAGE_PATH = '';

  // summary
  searchList = [];

  GRID_STATE_KEY = 'so_sodirectship';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopupMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popupMain');
  loadStatePopupMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popupMain');
  saveStatePopupSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popupSub');
  loadStatePopupSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popupSub');

  loadStateTag = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_tag');
  saveStateTag = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_tag');


  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private inspectService: SoinspectService,
              private service: SodirectshipService
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.G_TENANT = this.utilService.getTenant();
    this.onSelectionChangedWarehouse = this.onSelectionChangedWarehouse.bind(this);
    this.onSerialUploadClick = this.onSerialUploadClick.bind(this);
    this.onSerialDeleteClick = this.onSerialDeleteClick.bind(this);
    this.onSerialCancelClick = this.onSerialCancelClick.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

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
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);

    this.initForm();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');

      this.mainFormData.fromShipDate = document.getElementsByName('fromShipDate').item(1).getAttribute('value');
      this.mainFormData.toShipDate = document.getElementsByName('toShipDate').item(1).getAttribute('value');

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
      } else {
        return;
      }
    }
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

    // 출고유형
    this.codeService.getCode(this.G_TENANT, 'SOTYPE').subscribe(result => {
      this.dsSoType = result.data;
    });

    // 출고상태
    this.codeService.getCode(this.G_TENANT, 'SOSTATUS').subscribe(result => {
      this.dsSoStatus = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 출고처
    this.codeService.getCompany(this.G_TENANT, null, null, true, null, null, null, null).subscribe(result => {
      this.dsShipTo = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => {
      this.dsPort = result.data;
      this.dsCustomerPort = _.cloneDeep(this.dsPort);
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

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('sts').option('value', '200'); // 출고접수

    const rangeDate = this.utilService.getDateRange();
    // this.mainForm.instance.getEditor('fromShipSchDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toShipSchDate').option('value', rangeDate.toDate);

    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;

    this.fromShipDate.value = '';
    this.toShipDate.value = '';

    this.initCode();
  }

  onSelectionChangedWarehouse(e): void {  // 거래처 코드
    const findData = this.dsWarehouse.filter(el => el.uid === e.value);
    const logisticsIdValue = findData[0].logisticsId;

    this.popupFormData.logisticsId = findData.length > 0 ? logisticsIdValue : null;
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onFocusedCellChangedGrid(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);


  }

  onFocusedRowChangedGrid(e, grid): void {
    if (grid === this.popupMainGrid) {
      this.onPopupSubSearch();
    }
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 팝업 열기
  onPopupOpen(e): void {
    this.initDsLocation(e.data.warehouseId);

    this.changes = [];
    this.popupFormData = e.data;
    this.onPopupMainSearch(e.data);
    this.popup.visible = true;
  }

  async onPopupMainSearch(data): Promise<void> {
    await this.initPopupGrid();
    const result = await this.service.findSoFull(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      // this.popupFormData = result.data;
      this.popupMainEntityStore = new ArrayStore(
        {
          data: result.data.soDetailList,
          key: this.key
        }
      );

      this.popupMainGridDataSource = new DataSource({
        store: this.popupMainEntityStore
      });
      this.popupMainGrid.focusedRowKey = null;
      this.popupMainGrid.paging.pageIndex = 0;
    } else {
      return;
    }
  }

  async onPopupSubSearch(): Promise<void> {
    await this.initPopupSubGrid();

    const rowIdx = this.popupMainGrid.focusedRowIndex;
    const itemId = this.popupMainGrid.instance.cellValue(rowIdx, 'itemId');
    const soId = this.popupMainGrid.instance.cellValue(rowIdx, 'soId');
    const soDetailId = this.popupMainGrid.instance.cellValue(rowIdx, 'uid');

    if (!itemId || !soId || !soDetailId) {
      return;
    }
    const searchData = {
      tenant: this.G_TENANT,
      warehouseId: this.utilService.getCommonWarehouseId(),
      ownerId: this.utilService.getCommonOwnerId(),
      itemId,
      soId,
      soDetailId
    };

    const result = await this.service.findInvTagWhLocation(searchData);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupSubEntityStore = new ArrayStore(
        {
          data: result.data,
          key: [this.key, 'soId', 'soDetailId', 'tenant', 'totalAbleQty1']  // 유효성검사를 위한 키배열
        }
      );

      this.popupSubGridDataSource = new DataSource({
        store: this.popupSubEntityStore
      });
      this.popupSubGrid.focusedRowKey = null;
      this.popupSubGrid.paging.pageIndex = 0;
    } else {
      return;
    }
  }

  onPopupAfterClose(): void {
    if (!!this.popupMainGridDataSource) {
      this.initPopupGrid();

      this.popupMainGridDataSource.reload();
      this.popupMainGrid.instance.cancelEditData();

      this.popupSubGridDataSource.reload();
      this.popupSubGrid.instance.cancelEditData();
    }
    this.onSearch();
  }

  async onPopupSave(): Promise<void> {
    if (await this.execSave()) {
      this.onPopupClose();
    }
  }

  collectDetail(changes: any): any[] {
    const detailList = [];

    for (const rowIndex in changes) {

      if (!changes[rowIndex].data.expectQty1 || changes[rowIndex].data.expectQty1 === 0) {
        continue;
      }

      detailList.push(
        Object.assign(
          {
            operType: changes[rowIndex].type,
            uid: changes[rowIndex].key.uid,
            soId: changes[rowIndex].key.soId,
            soDetailId: changes[rowIndex].key.soDetailId
          }, changes[rowIndex].data
        )
      );
    }
    return detailList;
  }

  popupShown(): void {
    this.popupMainGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
  }

  async execSave(): Promise<boolean> {

    const changes = this.changes;
    for (const i of this.popupMainGridDataSource.items()) {

      const mainGridIdx = this.popupMainGrid.instance.getRowIndexByKey(i.uid);
      const expectQty1 = this.popupMainGrid.instance.cellValue(mainGridIdx, 'expectQty1');
      const soDetailId = this.popupMainGrid.instance.cellValue(mainGridIdx, 'uid');

      // soDetail의 예정 수량과 비교를 위한 필터
      const filteredChange = changes.filter(el => {
        return el.key.soDetailId === soDetailId;
      });

      if (filteredChange.length === 0) {
        const msg = this.utilService.convert('com_valid_required', this.utilService.convert('so_sodirectship_expectQty1'));
        this.utilService.notify_error(msg);
        // await this.setFocusRow(mainGridIdx, this.popupMainGrid);
        // await this.onPopupSubSearch();
        return;
      }

      // 예정수량과 입력수량 일치여부 체크
      let sum = 0;
      for (const change of filteredChange) {  // 입력수량 검사
        if (isNaN(parseInt(change.data.expectQty1, 0))) {
          continue;
        }
        sum += parseInt(change.data.expectQty1, 0);
      }

      if (sum !== expectQty1) {
        const msg = this.utilService.convert('not_equal_values',
          this.utilService.convert('so_so_expectQty1'), this.utilService.convert('so_sodirectship_expectQty1'));
        this.utilService.notify_error(msg);
        // await this.setFocusRow(mainGridIdx, this.popupMainGrid);
        // await this.onPopupSubSearch();
        return;
      }

      for (const change of filteredChange) {

        if (change.key.totalAbleQty1 < change.data.expectQty1) {
          const msg = this.utilService.convert1('notEnoughTotalAbleQty1', '가용총수량이 충분하지 않습니다.');
          this.utilService.notify_error(msg);
          return;
          // this.setFocusRow(mainGridIdx, this.popupMainGrid);
          // this.onPopupSubSearch();
        }
      }
    }

    try {
      let result;
      result = await this.service.procDirectShip(this.collectDetail(this.changes));

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Save success');
        this.popup.visible = false;
        this.onSearch();
      }
    } catch (e) {
      this.utilService.notify_error('There was an error!');
    }
  }

  //
  // onChangedExpectQty(rowData: any, value: any, aa: any): void {
  //   rowData.expectQty1 = value;
  // }

  initPopupGrid(): void {
    this.initPopupMainGrid();
    this.initPopupSubGrid();
  }

// 그리도 초기화 추가
  async initPopupMainGrid(): Promise<void> {
    this.popupMainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupMainGridDataSource = new DataSource({
      store: this.popupMainEntityStore
    });
  }

  async initPopupSubGrid(): Promise<void> {
    this.popupSubEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupSubGridDataSource = new DataSource({
      store: this.popupSubEntityStore
    });
  }

  initDsLocation(warehouseId: number): void {

    this.dsLocation = []; // 로케이션 코드 초기화
    if (warehouseId) {
      // 로케이션
      this.codeService.getLocation(this.G_TENANT, warehouseId).subscribe(result => {
        this.dsLocation = result.data;
      });
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }


  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === RcvCommonUtils.FLAG_TRUE;
  }

  async onSerialPopupClick(e, rowIdx: any): Promise<void> {
    this.currTenant = this.popupMainGrid.instance.cellValue(rowIdx, 'tenant');
    this.currSoId = this.popupMainGrid.instance.cellValue(rowIdx, 'soId');
    this.currSoDetailId = this.popupMainGrid.instance.cellValue(rowIdx, 'uid');
    this.currentItemAdminId = this.popupMainGrid.instance.cellValue(rowIdx, 'itemAdminId');
    this.currentItemId = this.popupMainGrid.instance.cellValue(rowIdx, 'itemId');

    if ((this.currSoDetailId === undefined) || (this.currSoDetailId === '')) {
      this.utilService.notify_error('Don\`t save data. Try after save it.');
      return;
    }

    const sendData = {tenant: this.currTenant, soId: this.currSoId, soDetailId: this.currSoDetailId};
    try {
      const result = await this.inspectService.getSerial(sendData);

      if (result.success) {
        for (const key in result.data) {
          if (result.data.hasOwnProperty(key)) {
            result.data[key].tenant = this.currTenant;
            result.data[key].rcvId = this.currSoId;
            result.data[key].rcvDetailId = this.currSoDetailId;
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

    const rowIdx = this.popupMainGrid.focusedRowIndex;
    this.currExpectQty = this.popupMainGrid.instance.cellValue(rowIdx, 'expectQty1');
    this.currentItemId = this.popupMainGrid.instance.cellValue(rowIdx, 'itemId');
    this.serialFormData.expectQty1 = this.popupMainGrid.instance.cellValue(rowIdx, 'expectQty1');
    this.serialFormData.itemId = this.popupMainGrid.instance.cellValue(rowIdx, 'itemId');

    this.serialPopupVisible = true;
    this.utilService.setPopupGridHeight(this.serialPopup, this.serialForm, this.tagGrid);
  }

  onSerialPopupClosed(e): void {
    this.serialForm.instance.resetValues();
    this.serialEntityStore.clear();
    this.serialDataSource.reload();
    this.fileUploader.instance.reset();
  }

  async onSerialDeleteClick(e): Promise<void> {
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      const result = await this.inspectService.deleteSerial({
        tenant: this.currTenant,
        soId: this.currSoId,
        soDetailId: this.currSoDetailId
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
    if ((this.serialDataSource.items() !== undefined) && (this.serialDataSource.items().length > 0)) {
      try {
        const sendData =  await this.serialEntityStore.load();

        // 예정수량 대비 체크
        if (this.currExpectQty !== sendData.length) {
          // 예정수량과 시리얼수량이 일치하지 않습니다.
          const expectedQtyMsg = this.utilService.convert('rcvDetail.expectQty1');
          const tagQtyMsg = this.utilService.convert('rcvDetail.tagQty');
          const msg = this.utilService.convert('not_equal_values', expectedQtyMsg, tagQtyMsg);
          this.utilService.notify_error(msg);
          return;
        }

        const result = await this.inspectService.saveSerial(sendData);
        if (result.success) {
          this.serialDataSource.reload();
          this.utilService.notify_success('Save success');
          this.onSerialPopupClear();
          this.serialPopupVisible = false;
          this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'receivedQty1', sendData.length);
          this.popupMainGrid.instance.cellValue(this.popupMainGrid.focusedRowIndex, 'tagQty', sendData.length);
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  onSerialCancelClick(): void {
    this.onSerialPopupClear();
    this.serialPopupVisible = false;
  }

  onSerialPopupClear(): void {
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
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
      const serialList = [];
      for (const key in Sheet1) {
        if (Sheet1.hasOwnProperty(key)) {
          if (!Sheet1[key].serial) {
            continue;
          }
          Sheet1[key].tenant = this.currTenant;
          Sheet1[key].soId = this.currSoId;
          Sheet1[key].soDetailId = this.currSoDetailId;
          Sheet1[key].itemAdminId = this.currentItemAdminId;
          Sheet1[key].itemId = this.currentItemId;
          serialList.push(Sheet1[key]);
        }
      }

      this.serialEntityStore = new ArrayStore(
        {
          data: serialList,
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

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

}
