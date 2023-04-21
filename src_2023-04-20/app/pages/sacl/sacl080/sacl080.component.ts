import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {BizCodeService} from '../../../shared/services/biz-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {Sacl080Service, Sacl080VO} from './sacl080.service';

@Component({
  selector: 'app-sacl080',
  templateUrl: './sacl080.component.html',
  styleUrls: ['./sacl080.component.scss']
})
export class Sacl080Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  // @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromDate', {static: false}) fromDate: DxDateBoxComponent;
  @ViewChild('toDate', {static: false}) toDate: DxDateBoxComponent;

  constructor(public utilService: CommonUtilService,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              private service: Sacl080Service,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  G_TENANT: any;

  // Grid State
  GRID_STATE_KEY = 'sacl_sacl080';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  mainFormData: Sacl080VO = {} as Sacl080VO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = ['cal_date', 'cust_cd', 'item_cd', 'ord_gb', 'ord_no', 'ord_seq'];

  dsPtrnCd = [];  // 파트너사
  dsItemCd = [];  // 품목
  dsCalcGb = [];  // 정산구분
  dsCalcType = [];  // 정산타입
  dsTotalSum = []; // 합계조건

  ngOnInit(): void {
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'CALCGB').subscribe(result => {
      this.dsCalcGb = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'CALCTYPE').subscribe(result => {
      this.dsCalcType = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'TOTALSUM').subscribe(result => {
      this.dsTotalSum = result.data;
    });
  }

  ngAfterViewInit(): void {
    // this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    // 공통 조회 조건 set
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // this.fromDate.value = this.gridUtil.addDate(this.gridUtil.getToday(), -7);
    this.fromDate.value = firstDay;
    this.toDate.value = this.gridUtil.getToday();

    this.mainForm.instance.focus();
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

      this.mainFormData.fromDate = document.getElementsByName('fromDate').item(1).getAttribute('value');
      this.mainFormData.toDate = document.getElementsByName('toDate').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);

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

  getSelectBoxOption(dataset, valueExpr, displayExpr): any {
    return {
      items: dataset,
      displayExpr,
      valueExpr,
      searchMode: 'contains',
      searchEnabled: true,
      showClearButton: true,
      openOnFieldClick: false,
      minSearchLength: 0,
      placeholder: '',
      noDataText: this.utilService.convert('com_txt_noDataText')
    };
  }
}
