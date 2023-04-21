import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {SoconfirmedcancelService} from './soconfirmedcancel.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {SoCommonUtils} from '../soCommonUtils';
import {SoVO} from "../so/so.service";

@Component({
  selector: 'app-soconfirmedcancel',
  templateUrl: './soconfirmedcancel.component.html',
  styleUrls: ['./soconfirmedcancel.component.scss']
})
export class SoconfirmedcancelComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('fromShipSchDate', {static: false}) fromShipSchDate: DxDateBoxComponent;
  @ViewChild('toShipSchDate', {static: false}) toShipSchDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: SoVO = {} as SoVO;
  // Grid
  mainDataSource: DataSource;
  mainKey = 'uid';

  // DataSet
  dsSoType = [];
  dsSoStatus = [];
  dsItemAdmin = [];
  // dsItem = [];
  dsCompany = [];
  dsShipTo = [];
  dsCountry = [];
  // dsPort = [];
  // dsCustomerPort = [];
  dsUser = [];

  dsOwner = [];
  dsWarehouse = [];

  // summary
  searchList = [];

  GRID_STATE_KEY = 'so_soconfirmedcancel';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: SoconfirmedcancelService
  ) {
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  // 화면 생성 된 후 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
    this.inputDataSource([], 'main');
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initData(this.mainForm);
  }

  initCode(): void {

    // 화주
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, true, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 납품처
    this.codeService.getCompany(this.G_TENANT, null, null, true, null, null, null, null).subscribe(result => {
      this.dsShipTo = result.data;
    });

    // 출고유형
    this.codeService.getCode(this.G_TENANT, 'SOTYPE').subscribe(result => {
      this.dsSoType = result.data;
    });

    // 출고상태
    this.codeService.getCode(this.G_TENANT, 'SOSTATUS').subscribe(result => {
      this.dsSoStatus = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 물품
    // this.codeService.getItem(this.G_TENANT).subscribe(result => {
    //   this.dsItem = result.data;
    // });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 항구
    // this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => {
    //   this.dsPort = result.data;
    //   this.dsCustomerPort = _.cloneDeep(this.dsPort);
    // });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  inputDataSource(inputData, type): void {

    this[type + 'DataSource'] = new DataSource({
      store: new ArrayStore({
        data: inputData,
        key: this[type + 'Key']
      })
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    this.codeService.getCompany(this.G_TENANT, null, true, null, true, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    if (data.isValid) {
      this.mainFormData.fromShipSchDate = document.getElementsByName('fromShipSchDate').item(1).getAttribute('value');
      this.mainFormData.toShipSchDate = document.getElementsByName('toShipSchDate').item(1).getAttribute('value');

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;

      if (this.resultMsgCallback(result, 'Search')) {
        this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async onExcute(): Promise<void> {
    const msgStr = this.utilService.convert('so_soconfirmedcancel_title');
    const selectRowKeys = this.mainGrid.selectedRowKeys;

    if (selectRowKeys.length > 0) {
      const confirmMsg = this.utilService.convert('confirmExecute', msgStr);

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const result = await this.service.save(selectRowKeys);

      if (this.resultMsgCallback(result, msgStr)) {
        await this.onSearch();
      }
    } else {
      this.utilService.notify_error(this.utilService.convert('com_msg_noselectData', msgStr));
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

  onReset(): void {
    this.mainForm.instance.resetValues();
    this.initData(this.mainForm);
  }

  initData(form): void {
    const rangeDate = this.utilService.getDateRange();
    this.fromShipSchDate.value = rangeDate.fromDate;
    this.toShipSchDate.value = rangeDate.toDate;

    form.formData = {
      tenant: this.G_TENANT,
      sts: SoCommonUtils.STS_SHIPPED,
      // fromShipSchDate: rangeDate.fromDate,
      // toShipSchDate: rangeDate.toDate,
      warehouseId: this.utilService.getCommonWarehouseId(),
      ownerId: this.utilService.getCommonOwnerId()
    };
    form.instance.focus();
  }

  onSelectionChanged(e): void {
    const selectedRowKey = e.currentSelectedRowKeys;

    this.mainGrid.instance.byKey(selectedRowKey).then(val => {
      const sts = val.sts;

      if (sts !== SoCommonUtils.STS_SHIPPED) {
        this.mainGrid.instance.deselectRows(selectedRowKey);
        return;
      }
    });
    const dataList = e.selectedRowsData;

    dataList.forEach(el => {

      if (el.sts !== SoCommonUtils.STS_SHIPPED) {
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
}

