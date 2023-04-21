import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {CostStatementService, CostStatementVO} from './cost-statement.service';

@Component({
  selector: 'app-cost-statement',
  templateUrl: './cost-statement.component.html',
  styleUrls: ['./cost-statement.component.scss']
})
export class CostStatementComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('mainCostYm', {static: false}) mainCostYm: DxDateBoxComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  G_TENANT: any;
  mainFormData: CostStatementVO = {} as CostStatementVO;
  mainData: CostStatementVO = {} as CostStatementVO;
  subFormDate: CostStatementVO = {} as CostStatementVO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';
  selectedRows: number[];

  // Grid State
  GRID_STATE_KEY = 'mm_coststatement1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  dsFilteredItemId = [];
  dsUser = []; // 사용자
  dsItemId = [];
  dsSpec = [];
  dsActFlg = [];
  dsUnitStyle = []; // 단위123유형

  now = this.utilService.getFormatMonth(new Date());


  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: CostStatementService,
              private codeService: CommonCodeService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    // // 전체 품목
    // this.codeService.getItem(this.G_TENANT).subscribe(result => {
    //   this.dsItemId = result.data;
    //   this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    // });

    // 품목
    this.codeService.getItemByRoute(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });


    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      this.mainFormData.costYm = document.getElementsByName('costYm').item(1).getAttribute('value');

      this.mainFormData.itemId = this.mainForm.instance.getEditor('itemId').option('value');

      console.log(this.mainFormData);
      // console.log(this.firstWorkDay2017.getFullYear());
      //
      // // @ts-ignore
      // this.mainFormData.prodDate = this.firstWorkDay2017.getFullYear() + '-' + this.firstWorkDay2017.getMonth();
      // console.log(this.mainFormData);

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

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    // this.mainForm.instance.getEditor('prodDate').option('value', this.utilService.getFormatMonth(this.firstWorkDay2017));
    // this.prodTotForm.instance.getEditor('costYm').option('value', rangeDate.fromDate);
    this.mainForm.instance.focus();
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

}
