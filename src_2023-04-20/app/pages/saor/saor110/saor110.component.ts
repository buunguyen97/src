import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor110Service, Saor110VO} from './saor110.service';

@Component({
  selector: 'app-saor110',
  templateUrl: './saor110.component.html',
  styleUrls: ['./saor110.component.scss']
})
export class Saor110Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: Saor110Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService) {
    this.G_TENANT = this.utilService.getTenant();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('fromOrdDt', {static: false}) fromOrdDt: DxDateBoxComponent;
  @ViewChild('toOrdDt', {static: false}) toOrdDt: DxDateBoxComponent;

  // Global
  G_TENANT: any;
  rowData: any;
  mainFormData: Saor110VO = {} as Saor110VO;
  searchFormData: any;

  dataSource: DataSource;
  entityStore: ArrayStore;

  subDataSource: DataSource;
  subEntityStore: ArrayStore;

  key = ['itemcategory1id', 'item_cd'];

  dsItemCategory1Id = [];
  dsUnitStyle = []; // 단위
  dsUser = []; // 사용자
  searchList = [];

  ngOnInit(): void {
    // 폼목카테고리1
    this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => {
      this.dsItemCategory1Id = result.data;
    });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnitStyle = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  initGrid(): void {

    this.subEntityStore = new ArrayStore({
      data: [],
      key: this.key
    });

    this.subDataSource = new DataSource({
      store: this.subEntityStore
    });

  }

  ngAfterViewInit(): void {
    this.initCode();
    this.utilService.getGridHeight(this.subGrid);
  }

  initCode(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDt.value = rangeDate.fromDate;
    this.toOrdDt.value = rangeDate.toDate;
  }

  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    this.initGrid();

    if (data.isValid) {
      this.mainFormData.fromOrdDt = document.getElementsByName('fromOrdDt').item(1).getAttribute('value');
      this.mainFormData.toOrdDt = document.getElementsByName('toOrdDt').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);
      this.searchList = result.data;
      this.searchFormData = this.mainFormData;
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore = new ArrayStore({
          data: result.data,
          key: this.key
        });
        this.dataSource = new DataSource({
          store: this.entityStore
        });

        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  onFocusedRowChanging(e): void {
    if (e.rowIndex < 0 || !e.row) {
      return;
    } else {
      this.rowData = e.row.data;
      console.log(this.rowData);
      this.onSubSearch(this.rowData.itemcategory1id, this.searchFormData.fromOrdDt, this.searchFormData.toOrdDt);
      console.log(this.mainFormData);
    }
  }

  // 거래처정보 셀 클릭 시 계약정보 조회
  async onSubSearch(itemcategory1id: string, fromOrdDt: string, toOrdDt: string): Promise<void> {

    const result = await this.service.subList({
      itemcategory1id: itemcategory1id,
      fromOrdDt: fromOrdDt,
      toOrdDt: toOrdDt
    });

    if (!result.success) {
      return;
    } else {

      this.subGrid.instance.cancelEditData();

      this.subEntityStore = new ArrayStore({
        data: result.data,
        key: this.key
      });

      this.subDataSource = new DataSource({
        store: this.subEntityStore
      });

      this.subGrid.focusedRowKey = null;
      this.subGrid.paging.pageIndex = 0;

      const keys = this.subGrid.instance.getSelectedRowKeys();
      this.subGrid.instance.deselectRows(keys);
    }
  }

  // 그리드 포커스
  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(this.mainGrid, e.rowIndex);
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }
}
