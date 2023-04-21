import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacs070Service, Sacs070VO} from './sacs070.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Component({
  selector: 'app-sacs070',
  templateUrl: './sacs070.component.html',
  styleUrls: ['./sacs070.component.scss']
})
export class Sacs070Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  TYPE_DEPT = 'TYPE_DEPT';
  TYPE_USER = 'TYPE_USER';

  dsWhCd = []; // 창고코드
  dsPtrn = []; // 파트너코드
  dsYn = []; // 사용자
  dsDept = []; // 부서
  dsUser = []; // 유저

  dsTarget = []; // 부서/유져
  changes = [];

  // Global
  G_TENANT: any;
  rowData: any;
  sessionUserId: any;

  // Main
  mainFormData = {};
  mainCount: any;
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;

  selectedRows: number[];

  saveData: Sacs070VO;

  // Sub
  subGridDataSource: DataSource;
  subGridEntityStore: ArrayStore;

  key = ['ptrn_cd', 'sa_wh_cd'];
  key2 = ['sa_wh_cd', 'ptrn_cd', 'dept_yn', 'target_id', 'wh_aut'];

  constructor(public utilService: CommonUtilService
    ,         public gridUtil: GridUtilService
    ,         private service: Sacs070Service
    ,         private bizService: BizCodeService
    ,         private codeService: CommonCodeService
  ) {
    this.sessionUserId = this.utilService.getUserUid();
    this.G_TENANT = this.utilService.getTenant();
    this.onFocusedRowChanging = this.onFocusedRowChanging.bind(this);
    // this.onValueChangedDept = this.onValueChangedDept.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.onSave = this.onSave.bind(this);
    this.getLookUpList = this.getLookUpList.bind(this);
    this.onValueChangedDeptYN = this.onValueChangedDeptYN.bind(this);
    this.onValueChangedTarget = this.onValueChangedTarget.bind(this);
    this.onvalueChangedPtrnCd = this.onvalueChangedPtrnCd.bind(this);
  }

  // Grid State
  GRID_STATE_KEY = 'sacs070_sacl070_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');

  alporterDept = [];
  alporterUser = [];
  ngOnInit(): void {

    this.service.deptSearch('O1000').subscribe(result => {
       this.alporterDept = result.data.map(el => {
        el.type = this.TYPE_DEPT;
        el.display = 'ALPORTER-' + el.display;
        return el;
      });
      // {cd: '1000', display: '(1000-정보화전략팀)', nm: '정보화전략팀', type: 'TYPE_DEPT'}
    });
    this.service.getUser('O1000', '').subscribe(result => {
      this.alporterUser = result.data.map(el => {
        el.type = this.TYPE_USER;
        el.display = 'ALPORTER-' + el.display;
        return el;
      });
      // {cd: 52, display: '(52-esoh)', nm: 'esoh', type: 'TYPE_USER'}
    });
    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

    // 파트너
    // this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
    //   this.dsPtrn = result.data;
    // });

    if (this.utilService.getCompany() === 'O1000') {
      // 알포터면 모든 파트너사
      this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
        this.dsPtrn = result.data;
      });
    } else {
      const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
      this.codeService.getRelatedCompany(this.utilService.getTenant(), Number(data.companyId)).subscribe(r => {
        this.dsPtrn = r.data.map(el => {
          // @ts-ignore
          el.cd = el.company;
          return el;
        });
      });
    }

    // YN
    this.dsYn = [{cd: 'Y', nm: 'Y'}, {cd: 'N', nm: 'N'}];

  }

  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getGridHeight(this.subGrid);

    // @ts-ignore
    this.mainFormData.ptrn_cd = this.utilService.getCompany();
  }

  onvalueChangedPtrnCd(e): void {
    // console.log(e);

    this.changes = [];
    // this.onSubSearch(null);

    this.subGridEntityStore = new ArrayStore({
      data: [],
      key: this.key2
    });

    this.subGridDataSource = new DataSource({
      store: this.subGridEntityStore
    });
  }

  async onSave(): Promise<void> {
    let result;

    this.saveData = {tenant: this.G_TENANT, ...this.saveData};

    const saveContent = this.saveData as Sacs070VO;

    // const detailList  = this.bizService.collectGridData(this.changes, this.subGrid, this.G_TENANT);
    const detailList = this.collectGridData(this.changes);

    // 필수값 체크
    for (const detail of detailList) {
      if (detail.operType !== 'insert') {
        continue;
      }
      if (!detail.ptrn_cd) {
        this.utilService.notify_error('필수 항목을 입력해주세요.');
        return;
      }

      if (!detail.dept_yn) {
        this.utilService.notify_error('필수 항목을 입력해주세요.');
        return;
      }

      if (!detail.target_id) {
        this.utilService.notify_error('필수 항목을 입력해주세요.');
        return;
      }

      if (!detail.target_id) {
        this.utilService.notify_error('필수 항목을 입력해주세요.');
        return;
      }

      if (!detail.wh_aut) {
        this.utilService.notify_error('필수 항목을 입력해주세요.');
        return;
      }
    }

    saveContent.gridList = detailList;
    saveContent.sa_wh_cd = this.rowData.sa_wh_cd;
    saveContent.ptrn_cd = this.rowData.ptrn_cd;
    saveContent.pwh_cd = this.rowData.pwh_cd;
    // @ts-ignore
    saveContent.createdby = this.sessionUserId;
    // @ts-ignore
    saveContent.modifiedby = this.sessionUserId;

    result = await this.service.insert(saveContent);

    if (result.success) {
      // await this.subGrid.instance.saveEditData();
      this.utilService.notify_success('save success');
      this.onSubSearch(this.rowData);
    } else {
      this.utilService.notify_error('save failed');
    }
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    const grid = this.subGrid.instance.getVisibleRows();
    for (const rowIndex in changes) {
      // Insert일 경우 UID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT,
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key
            }, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
              dept_yn: changes[rowIndex].dept_yn,
              dept_id: changes[rowIndex].dept_id,
              user_id: changes[rowIndex].user_id,
              wh_aut: changes[rowIndex].wh_aut,
            }, changes[rowIndex].data
          )
        );
      }
    }
    console.log('gridList', gridList);
    return gridList;
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.list(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });

        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        /*var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);*/
      }
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  initGrid() {
  }

  onInitNewRow(e): void {
    e.data.tenant = this.G_TENANT;
    e.data.sa_wh_cd = this.rowData.sa_wh_cd;
    e.data.ptrn_cd = this.rowData.ptrn_cd;
    e.data.pwh_cd = this.rowData.pwh_cd;
  }

  // main grid event
  async onFocusedRowChanging(e): Promise<void> {
    this.dsTarget = []; // 데이터셋 초기화
    this.initGrid();
    if (e.rowIndex < 0 || !e.row) {
      return;
    } else {
      this.rowData = e.row.data;

      this.service.deptSearch(this.rowData.ptrn_cd).subscribe(result => {
        const dept = result.data.map(el => {
          el.type = this.TYPE_DEPT;

          return el;
        });
        // 부서 병합
        this.dsTarget.push(...dept);

        this.service.getUser(this.rowData.ptrn_cd, '').subscribe(result => {
          const user = result.data.map(el => {
            el.type = this.TYPE_USER;
            return el;
          });
          // 사용자 병합
          this.dsTarget.push(...user);

          // 알포터가 아니면 알포터 부사 / 사원 추가
          if (this.rowData.ptrn_cd !== 'O1000') {
            this.dsTarget.push(...this.alporterDept);
            this.dsTarget.push(...this.alporterUser);
          }

          this.onSubSearch(this.rowData);
        });
      });
    }
  }

  /**
   * 부서여부 변경시
   */
  onValueChangedDeptYN(newData, value, currentData): void {
    newData.dept_yn = value;
    newData.target_id = null; // 초기화
  }

  /**
   * 부서 / 사용자 선택시
   */
  onValueChangedTarget(newData, value, currentData): void {
    if (currentData.dept_yn === 'Y') {
      newData.dept_id = value;
      newData.user_id = null;
    } else {
      newData.user_id = value;
      newData.dept_id = null;
    }
    newData.target_id = value;
  }


  onFocusedCellChanging(e) {
    this.setFocusRow(this.mainGrid, e.rowIndex);
  }

  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  // sub grid event
  onFocusedSubRowChanging(e): void {
    this.initGrid();
    if (e.rowIndex < 0 || !e.row) {
      return;
    } else {
      this.rowData = e.row.data;
    }
  }

  onFocusedSubCellChanging(e) {
    this.setFocusSubRow(this.subGrid, e.rowIndex);
  }

  setFocusSubRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  // Add Row
  onAddRow(): void {
    this.subGrid.instance.addRow().then(() => {
      this.setFocusSubRow(this.subGrid, this.subGrid.instance.getVisibleRows().length - 1);
    });
  }

  // Delete Row
  async onDeleteRow(): Promise<void> {
    if (this.subGrid.focusedRowIndex > -1) {
      this.subGrid.instance.deleteRow(this.subGrid.focusedRowIndex);
      this.subGridEntityStore.push([{type: 'remove', key: this.subGrid.focusedRowKey}]);
      this.setFocusSubRow(this.subGrid, this.subGrid.focusedRowIndex - 1);
    }
  }

  // 거래처정보 셀 클릭 시 계약정보 조회
  async onSubSearch(sacsVO): Promise<void> {
    const result = await this.service.subList(sacsVO);

    if (!result.success) {
      return;
    } else {

      this.subGrid.instance.cancelEditData();

      this.subGridEntityStore = new ArrayStore({
        data: result.data,
        key: this.key2
      });

      this.subGridDataSource = new DataSource({
        store: this.subGridEntityStore
      });

      this.subGrid.focusedRowKey = null;
      this.subGrid.paging.pageIndex = 0;

      const keys = this.subGrid.instance.getSelectedRowKeys();
      this.subGrid.instance.deselectRows(keys);

    }
  }

  // grid edit 제어
  allowEditing(e): boolean {
    console.log(e);
    return true;
  }

  /**
   * 부서 / 사용자 lookup 스위칭
   */
  getLookUpList(options): any {
    let type = '';
    if (options && options.data) {
      if (options.data.dept_yn === 'Y') {
        // 부서 Y 선택시 부서 필터
        type = this.TYPE_DEPT;
      } else if (options.data.dept_yn === 'N') {
        // 부서 N 선택시 사용자 필터
        type = this.TYPE_USER;
      }
    }

    return {
      store: this.dsTarget,
      filter: options.data ? ['type', '=', type] : null
    };
  }
}
