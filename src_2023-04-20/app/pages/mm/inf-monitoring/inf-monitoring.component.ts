import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {InfMonitoringService, InfMonitoringVO} from './inf-monitoring.service';
import {BizCodeService} from '../../../shared/services/biz-code.service';

@Component({
  selector: 'app-inf-monitoring',
  templateUrl: './inf-monitoring.component.html',
  styleUrls: ['./inf-monitoring.component.scss']
})
export class InfMonitoringComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('tagGrid', {static: false}) tagGrid: DxDataGridComponent;

  @ViewChild('fromLogDateTime', {static: false}) fromLogDateTime: DxDateBoxComponent;
  @ViewChild('toLogDateTime', {static: false}) toLogDateTime: DxDateBoxComponent;
  @ViewChild('fromResDateTime', {static: false}) fromResDateTime: DxDateBoxComponent;
  @ViewChild('toResDateTime', {static: false}) toResDateTime: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // Grid State
  GRID_STATE_KEY = 'mm_infmonitoring';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  mainFormData: any = {tenant: 1000};

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  subDataSource: DataSource;
  subEntityStore: ArrayStore;
  key = 'uid';

  dsApiType = [];
  dsSystemType = []; // 입고상태
  dsYN = [];
  dsWarehouse = []; // 창고코드
  dsItemId = []; // 품목코드
  dsItemAdmin = []; // 품목관리사
  dsLocation = []; // 로케이션
  dsSupplier = []; // 공급처
  dsUser = []; // 사용자
  dsOwner = []; // 화주
  dsFilteredItemId = [];
  dsDamageFlg = [];

  ownerId: any;

  selectedRows: number[];

  constructor(public utilService: CommonUtilService,
              private service: InfMonitoringService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              public bizService: BizCodeService) {
    this.G_TENANT = this.utilService.getTenant();
    // this.onReTransmission = this.onReTransmission.bind(this);
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

    // api유형
    this.codeService.getCode(this.G_TENANT, 'APITYPE').subscribe(result => {
      this.dsApiType = result.data;
    });

    // 시스템타입
    this.codeService.getCode(this.G_TENANT, 'IFSYSTEMTYPE').subscribe(result => {
      this.dsSystemType = result.data;
    });

    // 성공여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      console.log(result.data);
      this.ownerId = result.data[0]["company"];
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

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async onSearch(): Promise<void> {

    this.initSubGrid();
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromLogDateTime = document.getElementsByName('fromLogDateTime').item(1).getAttribute('value');
      this.mainFormData.toLogDateTime = document.getElementsByName('toLogDateTime').item(1).getAttribute('value');
      // this.mainFormData.fromResDateTime = document.getElementsByName('fromResDateTime').item(1).getAttribute('value');
      // this.mainFormData.toResDateTime = document.getElementsByName('toResDateTime').item(1).getAttribute('value');

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

  async onSearchSub(e): Promise<void> {

    if (e) {

      console.log(e);
      const result = await this.service.getFull(e);
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

    this.fromLogDateTime.value = rangeDate.fromDate;
    this.toLogDateTime.value = rangeDate.toDate;
    // this.fromResDateTime.value = rangeDate.toDate;
    // this.toResDateTime.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('successYN').option('value', 'Y');
    this.mainForm.instance.focus();
  }

  onSelectionClick(e): void {

    let successYN;
    if (e.column.caption === '성공건수') {
      successYN = 'Y';
    } else if (e.column.caption === '실패건수') {
      successYN = 'N';
    } else if (e.column.caption === '전체건수') {
      successYN = null;
    } else {
      return;
    }

    const apiType = e.data.apiType;
    const systemType = e.data.systemType;
    const fromLogDateTime = this.mainFormData.fromLogDateTime;
    const toLogDateTime = this.mainFormData.toLogDateTime;

    const mainData = {
      apiType,
      systemType,
      successYN,
      fromLogDateTime,
      toLogDateTime
    } as InfMonitoringVO;

    this.onSearchSub(mainData);

  }


  async onReTransmission(e): Promise<void> {

    const ifList = this.subGrid.instance.getSelectedRowsData();
    // const ifList = this.subGrid.instance.();
    const ifKeyList = this.subGrid.selectedRowKeys;
    let result = null;

    console.log(ifKeyList);

    console.log(ifList);

    if (ifList.length > 0) {
      let chk = true;
      ifList.forEach(el => {
        if (el.successYN !== 'N') {
          chk = false;
          return;
        }

      });

      if (!chk) {
        this.subGrid.instance.deselectAll();
        const msg = this.utilService.convert1('confirmSuccessYN', '실패한 인터페이스만 재전송이 가능합니다.');
        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('reTransmission', '인터페이스 재전송'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      if (ifList[0].systemType === 'SL') {
        const vo = {
          apiType: ifList[0].apiType,
          uid: ifList[0].uid,
          requestData: ifList[0].requestData,
          logKey: ifList[0].logKey,
          ownerId: this.ownerId
        };
        console.log(vo);
        result = await this.bizService.sendApi(vo);

      } else if (ifList[0].systemType === 'WM') {
        const vo = {
          apiType: ifList[0].apiType,
          uid: ifList[0].uid,
          requestData: ifList[0].requestData,
          logKey: ifList[0].logKey,
          ownerId: this.ownerId
        };

        console.log(vo);
        result = await this.service.onReTransmission(vo);
      }

      if (this.resultMsgCallback(result, this.utilService.convert('reTransmission'))) {
        await this.subGrid.instance.deselectAll();
        this.onSearch();
      } else {
        return;
      }
    } else {
      const msg = this.utilService.convert1('inf-monitoring_checkFlg', '재전송할 데이터를 선택해주세요.');
      this.utilService.notify_error(msg);
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
}
