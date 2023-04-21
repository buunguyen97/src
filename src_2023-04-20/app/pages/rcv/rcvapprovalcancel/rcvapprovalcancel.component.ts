import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {RcvTagDetailVO} from '../rcvperformregistration/rcvperformregistration.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvapprovalcancelService} from './rcvapprovalcancel.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../rcvCommonUtils';

@Component({
  selector: 'app-rcvapprovalcancel',
  templateUrl: './rcvapprovalcancel.component.html',
  styleUrls: ['./rcvapprovalcancel.component.scss']
})
export class RcvapprovalcancelComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;
  ACT_FLG_SEARCH_VALUE = 'Y';
  ALLOWED_STS_CODE = RcvCommonUtils.STS_COMPLETED;   // 유요한 입고상태

  mainFormData: RcvTagDetailVO = {} as RcvTagDetailVO;

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  key = 'uid';
  changes = [];

  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsItemId = []; // 품목코드
  dsLocation = []; // 로케이션
  dsSupplier = []; // 공급처
  dsUser = []; // 사용자
  dsWarehouse = []; // 창고
  dsOwner = []; // 화주

  // summary
  searchList = [];

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvapprovalcancel1';
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              private service: RcvapprovalcancelService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
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

    // 공급처
    this.codeService.getCompany(this.G_TENANT, null, true, null, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    // 사요자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });
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

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;
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

  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex, this.mainGrid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async executeConfirmReceiveCancel(): Promise<void> {
    const dataList = this.mainGrid.instance.getSelectedRowsData();

    if (dataList.length > 0) {

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('cancelApproval'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const result = await this.service.executeConfirmReceiveCancel(dataList);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      }
    } else {
      // 적치 완료 수량을 입력하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcvApprovalList'));
      this.utilService.notify_error(msg);
      return;
    }
    await this.mainGrid.instance.deselectAll();
    await this.onSearch();
  }

  onSelectionChanged(e): void {
    const selectedRowKey = e.currentSelectedRowKeys;
    // 유효한 입고상태가 아닐 경우
    this.mainGrid.instance.byKey(selectedRowKey).then(val => {
      const sts = val.sts;
      if (sts !== this.ALLOWED_STS_CODE) {
        this.mainGrid.instance.deselectRows(selectedRowKey);
        return;
      }
    });

    const dataList = e.selectedRowsData;
    dataList.forEach(el => {
      if (el.sts !== this.ALLOWED_STS_CODE) {
        this.mainGrid.instance.deselectAll();
        return;
      }
    });
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromRcvSchDate.value = rangeDate.fromDate;
    this.toRcvSchDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toRcvSchDate').option('value', rangeDate.toDate);
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_COMPLETED);
    this.mainForm.instance.focus();
  }
}
