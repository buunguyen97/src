import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {PtItemCostService} from './pt-item-cost.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-pt-item-cost',
  templateUrl: './pt-item-cost.component.html',
  styleUrls: ['./pt-item-cost.component.scss']
})
export class PtItemCostComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('subForm', {static: false}) subForm: DxFormComponent;

  @ViewChild('mainCostYm', {static: false}) mainCostYm: DxDateBoxComponent;
  @ViewChild('subCostYm', {static: false}) subCostYm: DxDateBoxComponent;

  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  G_TENANT: any;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainKey = 'uid';
  selectedRows: number[];

  mainFormData: any = {};
  subFormData: any = {};

  // Grid State
  GRID_STATE_KEY = 'mm_itemcost';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  dsCostGb = [];

  now = this.utilService.getFormatMonth(new Date());
  costYm: string;


  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: PtItemCostService,
              private route: ActivatedRoute) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.initCode();
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
    this.mainForm.instance.focus();

    this.route.paramMap.subscribe(params => {
      this.costYm = params.get('param');
      if (this.costYm) {
        this.mainFormData.costYm = this.costYm;
        this.mainFormData.tenant = this.G_TENANT;
        this.mainFormData.pageMove = 'true';

        this.onSearch();
      }
    });
  }

  initCode(): void {
    // 비용구분
    this.codeService.getCode(this.G_TENANT, 'COSTGB').subscribe(result => {
      this.dsCostGb = result.data;
    });
  }

  inputDataSource(inputData, type): void {

    this[type + 'EntityStore'] = new ArrayStore({
        data: inputData,
        key: this[type + 'Key']
      }
    );

    this[type + 'DataSource'] = new DataSource({
      store: this[type + 'EntityStore']
    });
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (this.mainFormData.pageMove === 'true') {
      this.mainCostYm.value = this.mainFormData.costYm;
      this.mainFormData.pageMove = 'false';
    } else {
      this.mainFormData.costYm = this.mainCostYm.value;
    }

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        await this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      } else {
        await this.inputDataSource([], 'main');
      }
    }
  }

  async procItemCost(e): Promise<void> {
    const data = this.subForm.instance.validate();
    this.subFormData.costYm = this.subCostYm.value;

    if (data.isValid) {
      const result = await this.service.proc(this.subFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        await this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }
}
