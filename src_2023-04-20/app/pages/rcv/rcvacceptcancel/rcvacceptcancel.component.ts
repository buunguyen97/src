import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvacceptcancelService, RcvAcceptVO} from './rcvacceptcancel.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../rcvCommonUtils';

@Component({
  selector: 'app-rcvacceptcancel',
  templateUrl: './rcvacceptcancel.component.html',
  styleUrls: ['./rcvacceptcancel.component.scss']
})
export class RcvacceptcancelComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('saveForm', {static: false}) saveForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;

  // ALLOWED_STS_CODE = '300'; // 유요한 입고상태
  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsSupplier = []; // 화주
  dsWarehouse = []; // 창고코드
  dsLocation = []; // 로케이션
  dsUser = []; // 사용자
  dsOwner = []; // 화주
  dsAcceptTypecd = []; // 접수타입
  dsAcceptGroupcd = []; // 접수그룹

  // Global
  G_TENANT: any;

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvacceptcancel1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  mainFormData: RcvAcceptVO = {} as RcvAcceptVO;

  // grid
  dataSource: DataSource;
  dataSource2: DataSource;
  entityStore: ArrayStore;
  entityStore2: ArrayStore;
  selectedRows: number[];
  selectedRows2: number[];
  deleteRowList = [];
  mainChanges = [];
  subChanges = [];
  key = 'uid';
  // summary
  searchList = [];

  constructor(public utilService: CommonUtilService,
              private service: RcvacceptcancelService,
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

    this.entityStore2 = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.dataSource2 = new DataSource({
      store: this.entityStore2
    });

    // 입고상태
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    // 입고타입
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    // 화주
    this.codeService.getCompany(this.G_TENANT, null, true, null, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'ACCEPTTYPE').subscribe(result => {
      this.dsAcceptTypecd = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'ACCEPTGROUP').subscribe(result => {
      this.dsAcceptGroupcd = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.subGrid);
    this.initForm();
  }

  // 조회
  async onSearch(): Promise<void> {
    this.entityStore2 = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.dataSource2 = new DataSource({
      store: this.entityStore2
    });

    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromRcvSchDate = document.getElementsByName('fromRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.toRcvSchDate = document.getElementsByName('toRcvSchDate').item(1).getAttribute('value');
      this.mainFormData.sts = RcvCommonUtils.STS_ACCEPTED;  // 입고접수상태 조회
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
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // 조회
  async onSearchSub(rcvAcceptId: number, tenant: string): Promise<void> {

    if (rcvAcceptId) {
      const result = await this.service.getRcv({uid: rcvAcceptId, tenant});
      this.searchList = result.data;
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.subGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore2 = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource2 = new DataSource({
          store: this.entityStore2
        });
        this.subGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
        this.subGrid.focusedRowKey = null;
        this.subGrid.paging.pageIndex = 0;
      }
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
          tenant: this.G_TENANT
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
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
  }

  onFocusedRowChanged(e, grid): void {
    if (e.row) {
      this.onSearchSub(e.row.key, e.row.data.tenant);  // 상세조회
    }
  }

  async cancelRcvAccept(): Promise<void> {
    const rcvAcceptList = this.mainGrid.instance.getSelectedRowsData();
    if (rcvAcceptList.length > 0) {

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('cancelRcvAccept', '입고접수취소'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      await this.service.cancelRcvAccept(rcvAcceptList);
    } else {

      // 입고접수 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcvAcceptList'));
      this.utilService.notify_error(msg);
      return;
    }

    await this.mainGrid.instance.deselectAll();
    await this.onSearch();
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.subGrid, this);
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
    // this.mainForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_ACCEPTED);
    this.mainForm.instance.focus();
  }
}
