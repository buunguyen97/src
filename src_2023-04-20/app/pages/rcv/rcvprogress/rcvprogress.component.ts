import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvDetailVO, RcvprogressService} from './rcvprogress.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-rcvprogress',
  templateUrl: './rcvprogress.component.html',
  styleUrls: ['./rcvprogress.component.scss']
})
export class RcvprogressComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;
  @ViewChild('fromReceiveDate', {static: false}) fromReceiveDate: DxDateBoxComponent;
  @ViewChild('toReceiveDate', {static: false}) toReceiveDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;
  mainFormData: RcvDetailVO = {} as RcvDetailVO;

  // mainFormData: {
  //   ownerId: number,
  //   warehouseId: number;
  // } = {ownerId: -1, warehouseId: -1};

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  key = 'uid';

  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsWarehouse = []; // 창고코드
  dsItemId = []; // 품목코드
  dsItemAdmin = []; // 품목관리사
  dsSupplier = []; // 공급처
  dsUser = []; // 사용자
  dsOwner = []; // 화주
  dsFilteredItemId = [];

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvprogress1';
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  constructor(
    public utilService: CommonUtilService,
    private service: RcvprogressService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
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

    // 입고상태
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    // 입고타입
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 거래처
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
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.fromReceiveDate = document.getElementsByName('fromReceiveDate').item(1).getAttribute('value');
      this.mainFormData.toReceiveDate = document.getElementsByName('toReceiveDate').item(1).getAttribute('value');

      console.log(this.mainFormData);
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
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex, this.mainGrid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
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
    this.mainForm.instance.focus();
  }
}
