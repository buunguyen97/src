import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {PtProdProgStatusService, PtProdProgStatusVO} from './pt-prod-prog-status.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';

@Component({
  selector: 'app-pt-prod-prog-status',
  templateUrl: './pt-prod-prog-status.component.html',
  styleUrls: ['./pt-prod-prog-status.component.scss']
})
export class PtProdProgStatusComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromWorkDate', {static: false}) fromWorkDate: DxDateBoxComponent;
  @ViewChild('toWorkDate', {static: false}) toWorkDate: DxDateBoxComponent;

  G_TENANT: any;
  mainFormData: PtProdProgStatusVO = {} as PtProdProgStatusVO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'mm_ptprodprogstatus1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  dsFilteredItemId = [];
  dsUser = []; // 사용자
  dsItemId = [];

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: PtProdProgStatusService,
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
      this.mainFormData.fromWorkDate = document.getElementsByName('fromWorkDate').item(1).getAttribute('value');
      this.mainFormData.toWorkDate = document.getElementsByName('toWorkDate').item(1).getAttribute('value');

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

    this.fromWorkDate.value = rangeDate.fromDate;
    this.toWorkDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('fromWorkDate').option('value', rangeDate.fromDate);
    // this.mainForm.instance.getEditor('toWorkDate').option('value', rangeDate.toDate);
    this.mainForm.instance.focus();
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

}
