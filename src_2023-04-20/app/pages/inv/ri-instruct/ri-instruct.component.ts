import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RiInstructExcuteVO, RiInstructService, RiInstructVO} from './ri-instruct.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-ri-instruct',
  templateUrl: './ri-instruct.component.html',
  styleUrls: ['./ri-instruct.component.scss']
})
export class RiInstructComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('riInstructForm', {static: false}) riInstructForm: DxFormComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;


  mainFormData: RiInstructVO = {} as RiInstructVO;
  riInstructFormData: RiInstructVO = {} as RiInstructVO;
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
  dsOwnerId = [];
  dsItemAdminId = [];
  dsItemId = [];
  dsDamageFlg = [];
  locIdStorage = [];

  dsRelocateGroup = [];
  dsRelocateKey = [];
  dsRemarks = [];
  dsItem = [];


  // Grid
  mainGridDataSource: DataSource;
  selectedRows: number[];
  mainEntityStore: ArrayStore;
  key = 'logicalKey';


  // ***** main ***** //
  dsActFlg = [];
  dsLocId = [];
  dsSubLocationId = [];

  PAGE_PATH = '';


  constructor(
    public utilService: CommonUtilService,
    private service: RiInstructService,
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
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
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
      this.dsLocationId = result.data;
      this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 로케이션 코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      // this.dsLocId = result.data;
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
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

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 로케이션 그룹
    this.codeService.getCode(this.G_TENANT, 'LOCGROUP').subscribe(result => {
      this.dsRelocateGroup = result.data;
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
    // this.mainFormData.ownerId = this.utilService.getCommonOwnerId();
    // this.mainFormData.warehouseId = this.utilService.getCommonWarehouseId();
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
    this.initCode();
    this.mainForm.instance.focus();
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.mainFormData.warehouseId.toString()).subscribe(locationResult => {
          this.dsSubLocationId = locationResult.data;
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
        // 횡스크롤 제거
        // this.gridUtil.fnScrollOption(this.mainGrid);
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
    this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
      this.dsLocationId = result.data;
    });
  }

  // onValueChangedItemAdminId(e): void {
  //     if (!e.value) {
  //         this.dsItem = null;
  //         this.mainFormData.itemId = null;
  //         return;
  //     }
  //     const findValue = this.dsItemAdminId.filter(code => code.uid === e.value);
  //
  //     this.codeService.getItemWithItemAdminId(this.G_TENANT, findValue[0].uid).subscribe(result => {
  //         this.dsItem = result.data;
  //     });
  // }

  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('wi_riInstruct', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('wi_riInstruct');
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

    this.riInstructFormData.relocateKey = '';
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

  // 로케이션 이동 지시
  async onExcute(e): Promise<void> {

    this.riInstructFormData.relocateKey = '';
    const changes = this.collectGridData(this.changes);

    if (changes.length > 0) {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('ExcuteRiInstruct', '이동지시'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      this.mainGrid.instance.saveEditData();

      const excuteList = this.mainGrid.instance.getSelectedRowsData();
      const tenant = this.G_TENANT;
      const relocateGroup = this.riInstructFormData.relocateGroup;
      const relocateBatchKey = null;
      const remarks = this.riInstructFormData.remarks;

      const excuteData = {
        tenant,
        relocateGroup,
        remarks,
        excuteList,
        relocateBatchKey
      } as RiInstructExcuteVO;

      const result = await this.service.executeInstruct(excuteData);

      console.log(result);
      if (result.data) {
        this.riInstructFormData.relocateKey = result.data.relocateBatchKey;
      }
    } else {
      this.utilService.notify_error(this.utilService.convert1('inv_riinstruct_inputlist', '로케이션 이동지시 목록을 입력하세요.'));
      return;
    }
    await this.mainGrid.instance.deselectAll();
    await this.onSearch();
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    // tslint:disable-next-line:forin
    for (const rowIndex in changes) {
      // tslint:disable-next-line:radix
      const idx = this.mainGrid.instance.getRowIndexByKey(changes[rowIndex].key);
      const uid = this.mainGrid.instance.cellValue(idx, 'uid');

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
            {operType: changes[rowIndex].type, uid, tenant: this.G_TENANT}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid, tenant: this.G_TENANT}, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.riInstructForm.instance.resetValues();
    await this.initForm();
  }
}
