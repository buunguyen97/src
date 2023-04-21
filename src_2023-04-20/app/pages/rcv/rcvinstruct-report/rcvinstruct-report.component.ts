import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvAcceptVO, RcvinstructReportService, RcvTagDetailVO} from './rcvinstruct-report.service';

@Component({
  selector: 'app-rcvinstruct-report',
  templateUrl: './rcvinstruct-report.component.html',
  styleUrls: ['./rcvinstruct-report.component.scss']
})
export class RcvinstructReportComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  // Global
  G_TENANT: any;

  mainFormData: RcvAcceptVO = {} as RcvAcceptVO;

  // grid
  mainDataSource: DataSource;
  subDataSource: DataSource;
  mainEntityStore: ArrayStore;
  subEntityStore: ArrayStore;
  key = 'uid';

  dsWarehouse = []; // 창고
  dsItemAdmin = []; // 품목관리사
  dsCompany = []; // 거래처코드
  dsLocation = []; // 로케이션
  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsSupplier = []; // 공급처
  dsUser = []; // 사용자
  dsItem = []; // 품목
  dsOwner = []; // 화주
  dsAcceptType = []; // 접수타입
  dsAcceptGroup = []; // 접수그룹
  dsDamageFlg = [];

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvinstructReport';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  constructor(
    public utilService: CommonUtilService,
    private service: RcvinstructReportService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.G_TENANT = this.utilService.getTenant();
  }


  ngOnInit(): void {
    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.mainDataSource = new DataSource({
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

    // 센터(창고)
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    this.codeService.getCompany(this.G_TENANT, false, false, false, true, false, false, false).subscribe(result => {
      this.dsSupplier = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItem = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'ACCEPTTYPE').subscribe(result => {
      this.dsAcceptType = result.data;
      console.log(this.dsAcceptType);
    });

    this.codeService.getCode(this.G_TENANT, 'ACCEPTGROUP').subscribe(result => {
      this.dsAcceptGroup = result.data;
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
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);
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

  async onSearchSub(rcvAcceptId: number): Promise<void> {
    if (rcvAcceptId) {
      const searchData = {uid: rcvAcceptId} as RcvTagDetailVO;
      const result = await this.service.getInstructed(searchData);

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

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    // from입고예정일자 setter
    // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', this.gridUtil.getToday());
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    // this.mainForm.instance.getEditor('rcvStatus').option('value', '400');
    this.mainForm.instance.focus();
  }

  async onViewReport(): Promise<void> {
    const selectList = await this.mainGrid.instance.getSelectedRowsData();

    for (const item of this.subGrid.instance.getVisibleRows()) {

      if (!item.data.toLocId) {
        const msg = this.utilService.convert('rcvinstruct_tolocId', '지시로케이션이 없어 출력이 불가능합니다.');
        this.utilService.notify_error(msg);
        return;
      }
    }

    const reportFile = 'file=RcvInstructReport.jrf';
    const reportOption = [
      {
        dataSet: 'DataSet0',
        node: 'data',
        path: '/report-service/report/rcvInstructReportHeader',
        apiParam: {
          acceptId: selectList[0].uid,
          tenant: this.G_TENANT
        }
      },
      {
        dataSet: 'DataSet1',
        node: 'data',
        path: '/report-service/report/rcvInstructReportData',
        apiParam: {
          acceptId: selectList[0].uid,
          tenant: this.G_TENANT
        }
      }
    ];

    this.utilService.openViewReport(reportFile, reportOption);
  }
}
