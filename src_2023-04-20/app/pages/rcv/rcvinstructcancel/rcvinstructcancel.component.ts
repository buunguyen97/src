import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvinstructcancelService} from './rcvinstructcancel.service';
import {RcvAcceptVO} from '../rcvinstruct/rcvinstruct.service';
import {RcvExpectedVO} from '../rcvexpected/rcvexpected.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-rcvinstructcancel',
  templateUrl: './rcvinstructcancel.component.html',
  styleUrls: ['./rcvinstructcancel.component.scss']
})
export class RcvinstructcancelComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;

  mainFormData: RcvExpectedVO = {} as RcvExpectedVO;

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  key = 'uid';

  dsWarehouse = []; // 센터(창고마스터)
  dsItemAdmin = []; // 품목관리사
  dsItemId = []; // 품목
  dsCompany = []; // 거래처코드
  dsRcvStatus = []; // 입고상태
  dsUser = []; // 사용자
  dsSupplier = []; // 공급처
  dsRcvType = []; // 입고타입
  dsOwner = []; // 화주
  dsAcceptType = []; // 접수타입
  dsAcceptGroup = []; // 접수그룹

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvinstructcancel1';
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              private service: RcvinstructcancelService,
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

    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    this.codeService.getCompany(this.G_TENANT, null, null, null, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'ACCEPTTYPE').subscribe(result => {
      this.dsAcceptType = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'ACCEPTGROUP').subscribe(result => {
      this.dsAcceptGroup = result.data;
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

  async executeCancelInstruct(e): Promise<void> {

    const idx = this.mainGrid.focusedRowIndex;
    if (idx > -1) {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('executeCancelInstruct'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const uid = this.mainGrid.instance.cellValue(idx, 'uid');
      const data = {uid} as RcvAcceptVO;
      await this.service.executeCancelInstruct(data);
    } else {
      // 입고접수완료 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcvInstructList'));
      this.utilService.notify_error(msg);
      return;
    }

    await this.onSearch();
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
    // from입고예정일자 setter
    // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', this.gridUtil.getToday());
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.focus();
  }
}
