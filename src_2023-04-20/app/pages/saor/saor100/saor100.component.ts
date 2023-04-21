import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor100Service, Saor100VO} from './saor100.service';

@Component({
  selector: 'app-saor100',
  templateUrl: './saor100.component.html',
  styleUrls: ['./saor100.component.scss']
})
export class Saor100Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: Saor100Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService) {

    this.G_TENANT = this.utilService.getTenant();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;


  // Global
  G_TENANT: any;
  mainFormData: Saor100VO = {} as Saor100VO;

  dsCOUNTRY = [];
  dsOrdGb = [];
  dsUser = [];
  dataSource: DataSource;
  entityStore: ArrayStore;

  key = ['ord_no', 'item_cd'];
  searchList = [];

  ngOnInit(): void {

    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
      {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
      {cd: '3', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')},
      {cd: '4', nm: this.utilService.convert('sales.sale_return')},
      {cd: '5', nm: this.utilService.convert('sales.rent_return')},
      {cd: '6', nm: this.utilService.convert('sales.sample_return')}];

    // 국가
    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCOUNTRY = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initCode();
    this.utilService.getGridHeight(this.mainGrid);
  }

  initCode(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;

  }

  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromOrdDate = document.getElementsByName('fromOrdDate').item(1).getAttribute('value');
      this.mainFormData.toOrdDate = document.getElementsByName('toOrdDate').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);
      this.searchList = result.data;
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore = new ArrayStore({
          data: result.data,
          key: this.key,
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

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }
}
