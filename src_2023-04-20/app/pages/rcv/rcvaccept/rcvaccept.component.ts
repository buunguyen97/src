import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvAcceptSaveVO, RcvacceptService, RcvVO} from './rcvaccept.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../rcvCommonUtils';

@Component({
  selector: 'app-rcvaccept',
  templateUrl: './rcvaccept.component.html',
  styleUrls: ['./rcvaccept.component.scss']
})
export class RcvacceptComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('saveForm', {static: false}) saveForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromRcvSchDate', {static: false}) fromRcvSchDate: DxDateBoxComponent;
  @ViewChild('toRcvSchDate', {static: false}) toRcvSchDate: DxDateBoxComponent;

  ALLOWED_STS_CODE = RcvCommonUtils.STS_IDLE;  // 유요한 입고상태
  dsRcvStatus = []; // 입고상태
  dsRcvType = []; // 입고타입
  dsCountry = []; // 국가
  dsWarehouse = []; // 센터(창고마스터)
  dsPort = []; // 항구
  dsSupplier = []; // 공급처
  dsItemAdmin = []; // 품목관리사
  dsItemId = []; // 품목
  dsUser = []; // 사용자
  dsAcceptUser = []; // 접수담당자
  dsOwner = []; // 화주
  dsAcceptTypecd = []; // 접수타입
  dsAcceptGroupcd = []; // 접수그룹

  // Global
  G_TENANT: any;

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvaccept1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  mainFormData: RcvVO = {} as RcvVO;
  saveFormData: RcvVO = {} as RcvVO;

  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupData: RcvVO;

  // summary
  searchList = [];
  dsDamageFlg = [];

  // grid
  mainDataSource: DataSource;
  subDataSource: DataSource;
  mainEntityStore: ArrayStore;
  subEntityStore: ArrayStore;
  selectedRows: number[];
  deleteRowList = [];
  key = 'uid';

  constructor(public utilService: CommonUtilService,
              private service: RcvacceptService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.onSelectionChangedWarehouse = this.onSelectionChangedWarehouse.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
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

    // 입고상태
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    // 블량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 입고타입
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 공급처
    this.codeService.getCompany(this.G_TENANT, null, true, null, true, null, null, null).subscribe(result => {
      this.dsSupplier = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
      this.dsAcceptUser = result.data.filter(el => el.companyId === this.utilService.getUserCompanyId());
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
    this.initForm();
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  // 조회
  async onSearch(): Promise<void> {
    this.subEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });

    const data = this.mainForm.instance.validate();

    // 값이 모두 있을 경우 조회 호출
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

  // 조회
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
            data: result.data.rcvDetailList,
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

  onSelectionChangedWarehouse(e): void {  // 거래처 코드
    const findValue = this.dsWarehouse.filter(code => code.uid === e.value);
    this.popupData.companyId = findValue.length > 0 ? findValue[0].logisticsId : null;
    this.popupData.logisticsId = findValue.length > 0 ? findValue[0].logisticsId : null;
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
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

  // 접수 실행
  async procRcvAccept(): Promise<void> {

    const data = this.saveForm.instance.validate();
    if (!data.isValid) {
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert('rcvAcceptInfo'));
      this.utilService.notify_error(msg);
      return;
    }

    const rcvList = this.mainGrid.instance.getSelectedRowsData();
    if (rcvList.length > 0) {

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('rcvAccept', '입고접수'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const tenant = this.G_TENANT;
      const warehouseId = this.mainFormData.warehouseId;  // 창고 코드
      const filtered = this.dsWarehouse.filter(el => el.uid === warehouseId);
      const logisticsId = filtered != null ? filtered[0].logisticsId : null;
      const receiveDate = this.saveFormData.receiveDate;
      const acceptUserId = this.saveFormData.acceptUserId;
      const acceptTypecd = this.saveFormData.acceptTypecd;
      const acceptGroupcd = this.saveFormData.acceptGroupcd;
      const remarks = this.saveFormData.remarks;
      const saveData = {
        tenant,
        warehouseId,  // 창고코드
        logisticsId,
        receiveDate,
        acceptUserId,
        acceptTypecd,
        acceptGroupcd,
        remarks,
        rcvList
      } as RcvAcceptSaveVO;

      if (!warehouseId) {
        // 창고 코드를 선택하세요.
        const msg = this.utilService.convert('com_select_obj', this.utilService.convert('rcv.warehouseId'));
        this.utilService.notify_error(msg);
        return;
      }
      await this.service.procRcvAccept(saveData);
    } else {

      // 입고 목록을 선택하세요.
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert('rcvExpectList'));
      this.utilService.notify_error(msg);
      return;
    }

    // 화면 정보 초기화
    this.saveForm.instance.getEditor('receiveDate').option('value', this.gridUtil.getToday());
    this.saveForm.instance.getEditor('acceptUserId').option('value', Number(this.utilService.getUserUid()));
    this.saveForm.instance.getEditor('acceptTypecd').option('value', 'STD');
    this.saveForm.instance.getEditor('acceptGroupcd').option('value', 'STD');
    this.saveForm.instance.getEditor('remarks').option('value', '');
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

    this.mainForm.instance.getEditor('sts').option('value', RcvCommonUtils.STS_IDLE);

    this.saveForm.instance.getEditor('receiveDate').option('value', this.gridUtil.getToday());
    this.saveForm.instance.getEditor('acceptUserId').option('value', Number(this.utilService.getUserUid()));
    this.saveForm.instance.getEditor('acceptTypecd').option('value', 'STD');
    this.saveForm.instance.getEditor('acceptGroupcd').option('value', 'STD');
    this.mainForm.instance.focus();
  }
}
