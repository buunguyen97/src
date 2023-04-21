import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {PtProdInvStatusService, PtProdInvStatusVO} from './pt-prod-inv-status.service';

@Component({
  selector: 'app-pt-prod-inv-status',
  templateUrl: './pt-prod-inv-status.component.html',
  styleUrls: ['./pt-prod-inv-status.component.scss']
})
export class PtProdInvStatusComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  // Global
  G_TENANT: any;

// ***** main ***** //
  // Form
  mainFormData: PtProdInvStatusVO = {} as PtProdInvStatusVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainGridDataSource: DataSource;
  selectedRows: number[];
  key = 'logicalKey';

  dsUser = [];
  dsLocGroup = [];
  dsLocation = [];
  dsLocationId = [];
  dsDamageFlg = [];
  dsItemId = [];
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  locIdStorage = [];
  dsItem = [];
  dsUnitStyle = [];
  dsItemGb = [];

  searchList = [];

  // ***** main ***** //
  dxDamageFlg = [];
  dsYN = [];

  PAGE_PATH = '';

  GRID_STATE_KEY = 'mm_ptprodinvstatus';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');

  constructor(
    public utilService: CommonUtilService,
    public service: PtProdInvStatusService,
    public codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.PAGE_PATH = this.utilService.getPagePath();
  }

  ngOnInit(): void {
    // this.onValueChangedWarehouseId = this.onValueChangedWarehouseId.bind(this);
    // this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);
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
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 조회조건 로케이션
    this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.utilService.getCommonWarehouseId().toString()).subscribe(result => {
      this.dsLocation = result.data;
      // this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
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

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 품목구분
    this.codeService.getCode(this.G_TENANT, 'ITEMGB').subscribe(result => {
      this.dsItemGb = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;          // 시리얼여부
    rowData.unit = value;
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
    this.mainForm.instance.getEditor('itemTypecd').option('value', '02');

    this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    this.mainFormData.companyId = this.utilService.getCommonOwnerId();

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

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }


  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }
}
