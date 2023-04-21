import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor090Service, Saor090VO} from './saor090.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';

@Component({
  selector: 'app-saor090',
  templateUrl: './saor090.component.html',
  styleUrls: ['./saor090.component.scss']
})
export class Saor090Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: Saor090Service,
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
  mainFormData: Saor090VO = {} as Saor090VO;

  dsITEM = [];
  dsOrdGb = [];
  dsUnitStyle = []; // 단위
  dsUser = []; // 사용자

  dataSource: DataSource;
  entityStore: ArrayStore;

  key = ['item_nm', 'ord_no'];
  searchList = [];

  ngOnInit(): void {
    // this.dsORDGB = [{cd: '1', nm: this.utilService.convert('sales.sale')},
    //   {cd: '2', nm: this.utilService.convert('sales.rent')},
    //   {cd: '3', nm: this.utilService.convert('sales.ord_sample')}];

    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
      {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
      {cd: '3', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')},
      {cd: '4', nm: this.utilService.convert('sales.sale_return')},
      {cd: '5', nm: this.utilService.convert('sales.rent_return')},
      {cd: '6', nm: this.utilService.convert('sales.sample_return')}];

    this.bizService.getItem(this.G_TENANT, '', '', '', '', '').subscribe(result => {
      this.dsITEM = result.data;
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
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        var keys = this.mainGrid.instance.getSelectedRowKeys();
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
