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
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvCommonUtils} from '../rcvCommonUtils';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvproducestatusService, RcvProduceStatusVO} from './rcv-produce-status.service';

@Component({
  selector: 'app-rcv-produce-status',
  templateUrl: './rcv-produce-status.component.html',
  styleUrls: ['./rcv-produce-status.component.scss']
})
export class RcvProduceStatusComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('tagGrid', {static: false}) tagGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('serialPopup', {static: false}) serialPopup: DxPopupComponent;
  @ViewChild('fromRelocateDate', {static: false}) fromRelocateDate: DxDateBoxComponent;
  @ViewChild('toRelocateDate', {static: false}) toRelocateDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: RcvProduceStatusVO = {} as RcvProduceStatusVO;
  dsItemId = [];
  dsWarehouseId = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  dsItem = [];
  dsOwner = [];
  dsUser = [];
  dsLocation = [];
  dsRelocateSts = [];
  dsRelocateType = [];
  dsFilteredItemId = [];


  // Grid
  mainGridDataSource: DataSource;
  subGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  subEntityStore: ArrayStore;
  key = 'uid';


  // serial
  serialPopupVisible = false;
  serialDataSource: DataSource;
  serialEntityStore: ArrayStore;
  serialFormData: any;

  currTenant: any;
  currentItemId: any;

  // ***** main ***** //

  GRID_STATE_KEY = 'rcv_rcvproducestatus';
  saveStateMainGrid = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_mainGrid');
  loadStateMainGrid = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_mainGrid');

  saveStateSubGrid = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_subGrid');
  loadStateSubGrid = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_subGrid');

  loadStateTag = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_tag');
  saveStateTag = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_tag');

  constructor(public utilService: CommonUtilService,
              private service: RcvproducestatusService,
              private codeService: CommonCodeService,
              private rcvUtil: RcvCommonUtils,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.onSerialCancelClick = this.onSerialCancelClick.bind(this);
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

    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.subGridDataSource = new DataSource({
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
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.subGrid);
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

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
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

    this.codeService.getCode(this.G_TENANT, 'RELOCATESTATUS').subscribe(result => {
      this.dsRelocateSts = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'RELOCATETYPE').subscribe(result => {
      this.dsRelocateType = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  async onSearch(): Promise<void> {

    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.subGridDataSource = new DataSource({
      store: this.subEntityStore
    });
    this.subGrid.focusedRowKey = null;
    this.subGrid.paging.pageIndex = 0;

    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromRelocateDate = document.getElementsByName('fromRelocateDate').item(1).getAttribute('value');
      this.mainFormData.toRelocateDate = document.getElementsByName('toRelocateDate').item(1).getAttribute('value');

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

  async onSearchSub(): Promise<void> {
    const relocateBatchId = this.mainGrid.instance.cellValue(this.mainGrid.focusedRowIndex, 'uid');

    if (!relocateBatchId) {
      return;
    }
    const result = await this.service.getDetail({relocateBatchId});

    if (this.resultMsgCallback(result, 'Search')) {
      this.subEntityStore = new ArrayStore(
        {
          data: result.data,
          key: this.key
        }
      );
      this.subGridDataSource = new DataSource({
        store: this.subEntityStore
      });

      this.subGrid.focusedRowKey = null;
      this.subGrid.paging.pageIndex = 0;
    } else {
      return;
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

  onFocusedRowChanged(e, grid): void {
    this.setFocusRow(grid, e.rowIndex);
    if (grid === this.mainGrid) {
      this.onSearchSub();
    }
  }

  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());

    const rangeDate = this.utilService.getDateRange();

    this.fromRelocateDate.value = rangeDate.fromDate;
    this.toRelocateDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('fromRelocateDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toRelocateDate').option('value', rangeDate.toDate);
    this.mainForm.instance.focus();
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === RcvCommonUtils.FLAG_TRUE;
  }

  async onSerialPopupClick(): Promise<void> {
    const subGridIdx = this.subGrid.focusedRowIndex;
    const relocateBatchId = this.subGrid.instance.cellValue(subGridIdx, 'relocateBatchId');
    const uid = this.subGrid.instance.cellValue(subGridIdx, 'uid');
    const result = await this.service.getSerial({tenant: this.G_TENANT, relocateBatchId, uid});

    if (this.resultMsgCallback(result, 'Search')) {
      this.serialEntityStore = new ArrayStore(
        {
          data: result.data,
          key: 'serial'
        }
      );

      this.serialDataSource = new DataSource({
        store: this.serialEntityStore
      });

      this.serialPopupVisible = true;
    } else {
      return;
    }
  }

  // 팝업 추가 부분
  onSerialPopupShown(e): void {
    this.serialPopupVisible = true;
    this.utilService.getPopupGridHeight(this.tagGrid, this.serialPopup);
  }

  onSerialPopupClosed(e): void {
    this.serialForm.instance.resetValues();
    this.serialEntityStore.clear();
    this.serialDataSource.reload();
  }

  onSerialCancelClick(): void {
    this.onSerialPopupClear();
    this.serialPopupVisible = false;
  }

  onSerialPopupClear(): void {
  }

  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    e.toolbarOptions.items = newToolbarItems;
  }
}
