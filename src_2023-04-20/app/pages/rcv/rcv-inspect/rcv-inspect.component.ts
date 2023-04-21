import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {RcvCommonUtils} from '../rcvCommonUtils';
import {RcvExpectedVO} from '../rcvexpected/rcvexpected.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import * as XLSX from 'xlsx';
import {RcvInspectService} from './rcv-inspect.service';

@Component({
  selector: 'app-rcv-inspect',
  templateUrl: './rcv-inspect.component.html',
  styleUrls: ['./rcv-inspect.component.scss']
})
export class RcvInspectComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('tagGrid', {static: false}) tagGrid: DxDataGridComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('serialPopup', {static: false}) serialPopup: DxPopupComponent;

  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;
  @ViewChild('fromReceiveDate', {static: false}) fromReceiveDate: DxDateBoxComponent;
  @ViewChild('toReceiveDate', {static: false}) toReceiveDate: DxDateBoxComponent;
  // Global
  G_TENANT: any;

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvinspect1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');
  loadStateTag = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_tag');
  saveStateTag = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_tag');

  mainFormData: RcvExpectedVO = {} as RcvExpectedVO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  subDataSource: DataSource;
  subEntityStore: ArrayStore;
  key = 'uid';

  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsWarehouse = []; // 창고코드
  dsItemId = []; // 품목코드
  dsItemAdmin = []; // 품목관리사
  dsLocation = []; // 로케이션
  dsSupplier = []; // 공급처
  dsUser = []; // 사용자
  dsOwner = []; // 화주
  dsFilteredItemId = [];
  dsDamageFlg = [];

  // summary
  searchList = [];

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

  constructor(public utilService: CommonUtilService,
              private service: RcvInspectService,
              private codeService: CommonCodeService,
              private rcvUtil: RcvCommonUtils,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.onSerialCancelClick = this.onSerialCancelClick.bind(this);
    this.onSerialUploadClick = this.onSerialUploadClick.bind(this);
    this.onSerialDeleteClick = this.onSerialDeleteClick.bind(this);
    this.onSerialPopupClick = this.onSerialPopupClick.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  ngOnInit(): void {
    this.initSubGrid();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.mainDataSource = new DataSource({
      store: this.mainEntityStore
    });

    // 입고상태
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    // 입고타입
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 공급처
    this.codeService.getCompany(this.G_TENANT, null, null, null, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
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
  }


  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.subGrid);
    this.initForm();
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  onFocusedRowChanged(e): void {
    if (e.row) {
      this.onSearchSub(e.row.key);  // 상세조회
    }
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async onSearch(): Promise<void> {

    this.initSubGrid();
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromReceiveDate = document.getElementsByName('fromReceiveDate').item(1).getAttribute('value');
      this.mainFormData.toReceiveDate = document.getElementsByName('toReceiveDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;
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

  async onSearchSub(rcvId: number): Promise<void> {
    if (rcvId) {
      const result = await this.service.getRcvFull({uid: rcvId});
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.subGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.subEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.subDataSource = new DataSource({
          store: this.subEntityStore
        });
        this.subGrid.focusedRowKey = null;
        this.subGrid.paging.pageIndex = 0;
      }
    }
  }

  async initSubGrid(): Promise<void> {
    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromRcvSchDate.value = rangeDate.fromDate;
    this.toRcvSchDate.value = rangeDate.toDate;
    this.fromReceiveDate.value = '';
    this.toReceiveDate.value = '';

    // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toRcvSchDate').option('value', rangeDate.toDate);
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_RECEIVED);
    this.mainForm.instance.focus();
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === RcvCommonUtils.FLAG_TRUE;
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  /**
   *  엑셀 업로드 팝업 START
   */

  // 팝업 추가 부분
  onSerialPopupShown(e): void {
    this.tagGrid.instance.repaint();

    const rowIdx = this.subGrid.focusedRowIndex;
    this.currExpectQty = this.subGrid.instance.cellValue(rowIdx, 'expectQty1');
    this.currentItemId = this.subGrid.instance.cellValue(rowIdx, 'itemId');
    this.serialFormData.expectQty1 = this.subGrid.instance.cellValue(rowIdx, 'expectQty1');
    this.serialFormData.itemId = this.subGrid.instance.cellValue(rowIdx, 'itemId');

    this.serialPopupVisible = true;
    this.utilService.setPopupGridHeight(this.serialPopup, this.serialForm, this.tagGrid);
  }

  async onSerialPopupClick(e, rowIdx: any): Promise<void> {
    this.currTenant = this.subGrid.instance.cellValue(rowIdx, 'tenant');
    this.currRcvId = this.subGrid.instance.cellValue(rowIdx, 'rcvId');
    this.currRcvDetailId = this.subGrid.instance.cellValue(rowIdx, 'uid');

    if ((this.currRcvDetailId === undefined) || (this.currRcvDetailId === '')) {
      this.utilService.notify_error('Don\`t save data. Try after save it.');
      return;
    }

    const sendData = {tenant: this.currTenant, rcvId: this.currRcvId, rcvDetailId: this.currRcvDetailId};
    try {
      const result = await this.rcvUtil.getTag(sendData);

      if (result.success) {
        for (const key in result.data) {
          if (result.data.hasOwnProperty(key)) {
            result.data[key].tenant = this.currTenant;
            result.data[key].rcvId = this.currRcvId;
            result.data[key].rcvDetailId = this.currRcvDetailId;
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

  async onSerialUploadClick(): Promise<void> {
    this.serialDataSource.store().load().then(async (res) => {
      if (res !== undefined && res.length > 0) {
        try {
          const sendData =  await this.serialEntityStore.load();

          // 예정수량 대비 체크
          if (this.currExpectQty !== res.length) {
            // 예정수량과 시리얼수량이 일치하지 않습니다.
            const expectedQtyMsg = this.utilService.convert('rcvDetail.expectQty1');
            const tagQtyMsg = this.utilService.convert('rcvDetail.tagQty');
            const msg = this.utilService.convert('not_equal_values', expectedQtyMsg, tagQtyMsg);
            this.utilService.notify_error(msg);
            return;
          }

          const result = await this.rcvUtil.saveTag(res);
          if (result.success) {
            this.serialDataSource.reload();
            this.utilService.notify_success('Save success');
            this.onSerialPopupClear();
            this.serialPopupVisible = false;
            // this.subGrid.instance.cellValue(this.subGrid.focusedRowIndex, 'receivedQty1', sendData.length);
            this.subGrid.instance.cellValue(this.subGrid.focusedRowIndex, 'tagQty', sendData.length);
            await this.subGrid.instance.saveEditData();
          } else {
            this.utilService.notify_error(result.msg);
          }
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
          await this.serialDataSource.reload();
          this.subGrid.instance.cellValue(this.subGrid.focusedRowIndex, 'tagQty', 0);
          this.subGrid.instance.saveEditData();
          this.utilService.notify_success('Delete success');
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
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
          Sheet1[key].rcvId = this.currRcvId;
          Sheet1[key].rcvDetailId = this.currRcvDetailId;
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

  onSerialPopupClosed(e): void {
    this.serialForm.instance.resetValues();
    this.serialEntityStore.clear();
    this.serialDataSource.reload();
    this.fileUploader.instance.reset();
  }

  // 그리드 툴바
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
   *  엑셀 업로드 팝업 END
   */
}
