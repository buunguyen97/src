import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {CostStatusService, CostStatusVO} from './cost-status.service';

@Component({
  selector: 'app-cost-status',
  templateUrl: './cost-status.component.html',
  styleUrls: ['./cost-status.component.scss']
})
export class CostStatusComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  G_TENANT: any;
  mainFormData: CostStatusVO = {} as CostStatusVO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';

  PAGE_PATH = '';


  // Grid State
  GRID_STATE_KEY = 'mm_coststatus';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  dsUser = []; // 사용자
  dsCostGb = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsItemId = [];

  now = this.utilService.getFormatMonth(new Date());

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: CostStatusService,
              private codeService: CommonCodeService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    // 전체 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 비용구분
    this.codeService.getCode(this.G_TENANT, 'COSTGB').subscribe(result => {
      this.dsCostGb = result.data;
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

  }

  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      this.mainFormData.fromReqDate = document.getElementsByName('fromReqDate').item(1).getAttribute('value');
      this.mainFormData.toReqDate = document.getElementsByName('toReqDate').item(1).getAttribute('value');


      console.log(this.mainFormData);
      // console.log(this.firstWorkDay2017.getFullYear());


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

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    // this.mainForm.instance.getEditor('reqDate').option('value', rangeDate.fromDate);
    this.mainForm.instance.focus();
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }

  setMatCost(rowData: any): number {
    console.log(rowData);
    const unitMat = rowData.unitMat;
    const unitSaly = rowData.unitSaly;
    const unitAmt = rowData.unitAmt;

    return unitMat + unitSaly + unitAmt;
  }

}
