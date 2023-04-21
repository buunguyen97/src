import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RiInstructCancelService, RiInstructCancelVO} from './ri-instruct-cancel.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-ri-instruct-cancel',
  templateUrl: './ri-instruct-cancel.component.html',
  styleUrls: ['./ri-instruct-cancel.component.scss']
})
export class RiInstructCancelComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;


  mainFormData: RiInstructCancelVO = {} as RiInstructCancelVO;

  // Global
  G_TENANT: any;
  changes = [];
  dsUser = [];

// ***** main ***** //
  // Form
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsLocationId = [];
  dsLocId = [];
  dsOwnerId = [];
  dsSts = [];
  dsRelocateSts = [];
  dsItemAdminId = [];
  dsItemId = [];
  dsDamageFlg = [];
  locIdStorage = [];
  dsLocation = [];
  dsItem = [];

  // Grid
  mainGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  key = 'uid';
  dsActFlg = [];
  dsInstructQty = [];

  PAGE_PATH = '';


  constructor(
    public utilService: CommonUtilService,
    private service: RiInstructCancelService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
    this.G_TENANT = this.utilService.getTenant();
    this.onValueChangedWarehouseId = this.onValueChangedWarehouseId.bind(this);
    // this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);
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
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
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
      this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 로케이션코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      // this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 상태
    this.codeService.getCode(this.G_TENANT, 'RELOCATESTATUS').subscribe(result => {
      this.dsRelocateSts = result.data;
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

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  // search Form 초기화
  initForm(): void {

    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    // this.mainForm.instance.getEditor('relocateSts').option('value', '100');
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.initCode();
    this.mainForm.instance.focus();
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.isSerial = this.dsItemId.filter(el => el.uid === value)[0].isSerial;          // 시리얼여부
    rowData.unit = value;
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.mainFormData.warehouseId.toString()).subscribe(locationResult => {
          // this.toLocId = locationResult.data;
        });
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

  onValueChangedWarehouseId(e): void {
    if (e.value === null) {
      this.dsWarehouseId = null;
      return;
    }
    const findValue = this.dsWarehouseId.filter(code => code.uid === e.value);

    this.codeService.getLocation(this.G_TENANT, findValue[0].uid).subscribe(result => {
      this.dsLocation = result.data;
    });
  }

  // onValueChangedItemAdminId(e): void {
  //   if (!e.value) {
  //     this.dsItem = null;
  //     this.mainFormData.itemId = null;
  //     return;
  //   }
  //   const findValue = this.dsItemAdminId.filter(code => code.uid === e.value);
  //
  //   this.codeService.getItemWithItemAdminId(this.G_TENANT, findValue[0].uid).subscribe(result => {
  //     this.dsItem = result.data;
  //   });
  // }

  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('wi_riInstructCancel', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_riInstructCancel');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);

    // this.riInstructForm.instance.getEditor('relocateKey').option('value', '');

  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

  async onExcute(): Promise<void> {

    if (this.mainGrid.selectedRowKeys.length > 0) {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('ExcuteRiInstructCancel', '이동지시 취소'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      const result = await this.service.save(this.mainGrid.selectedRowKeys);

      if (this.resultMsgCallback(result, this.utilService.notify_error(this.utilService.convert1('inv_riinstructcancel_cancel', '지시취소')))) {
        this.onSearch();
      } else {
        return;
      }
    } else {
      this.utilService.notify_error(this.utilService.convert1('inv_riinstructcancel_cancelmessage', '취소할 데이터가 없습니다'));
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }

  // // 로케이션 이동 지시
  // async onExcute(e): Promise<void> {
  //
  //   this.riInstructForm.instance.getEditor('relocateKey').option('value', '');
  //   // const idx = this.mainGrid.focusedRowIndex;
  //   const dataList = this.mainGrid.instance.getSelectedRowsData();
  //   const changes = this.collectGridData(this.changes);
  //
  //   for (const data of dataList) {
  //     const filteredData = changes.filter(el => {
  //       return el.uid === data.uid;
  //     });
  //     // console.log(filteredData);
  //     if (filteredData.length > 0) {
  //       data.toLocId = filteredData[0].toLocId;
  //       data.qty1 = filteredData[0].qty1;
  //     }
  //     data.remarks = this.riInstructForm.instance.getEditor('relocateKey').option('value');
  //   }
  //
  //   console.log(dataList);
  //
  //   if (dataList.length > 0) {
  //     const result = await this.service.executeInstruct(dataList);
  //     if (result.data) {
  //       this.riInstructForm.instance.getEditor('relocateKey').option('value', result.data.relocateBatchKey);
  //     }
  //   } else {
  //     this.utilService.notify_error('로케이션 이동지시 목록을 입력하세요.');
  //     return;
  //   }
  //   await this.mainGrid.instance.deselectAll();
  //   await this.onSearch();

}

