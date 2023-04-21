import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {PtProdMatCostProcessService, PtProdMatCostProcessVO} from './pt-prod-mat-cost-process.service';
import {ProdTotService, ProdTotVO} from '../prod-tot/prod-tot.service';
import {Router} from '@angular/router';
import {ProdMatCostVO, PtProdMatCostService} from '../pt-prod-mat-cost/pt-prod-mat-cost.service';
import {PtItemCostService} from '../pt-item-cost/pt-item-cost.service';
import {PtProdMatTotService} from '../pt-prod-mat-tot/pt-prod-mat-tot.service';
import {COMMONINITSTR} from '../../../shared/constants/commoninitstr';

@Component({
  selector: 'app-pt-prod-mat-cost-process',
  templateUrl: './pt-prod-mat-cost-process.component.html',
  styleUrls: ['./pt-prod-mat-cost-process.component.scss']
})
export class PtProdMatCostProcessComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('mainCostYm', {static: false}) mainCostYm: DxDateBoxComponent;
  @ViewChild('subCostYm', {static: false}) subCostYm: DxDateBoxComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  G_TENANT: any;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  mainKey = 'uid';
  selectedRows: number[];

  key = 'uid';

  popupFormData: any = {};
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;
  itemFormData: any;

  mainFormData: any = {};

  searchList = [];

  // Grid Popup
  changes = [];
  popupVisible = false;
  popupMode = 'Add';
  popupData: any;
  matCost = '원 가 산 정';

  GRID_STATE_KEY = 'mm_prodmatcostprocess';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  dsFilteredItemId = [];
  dsUser = []; // 사용자
  dsItemId = [];
  dsActFlg = [];

  now = this.utilService.getFormatMonth(new Date());

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: PtProdMatCostProcessService,
              private prodTotService: ProdTotService,
              private ptProdMatTotService: PtProdMatTotService,
              private ptProdMatCostService: PtProdMatCostService,
              private ptItemCostService: PtItemCostService,
              private router: Router) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.inputDataSource([], 'main');
  }

  ngAfterViewInit(): void {

    this.mainGrid.instance.cancelEditData();

    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);

    this.mainFormData.costYm = this.mainCostYm.value;

    const arr = [
      {uid: 1, workName: '생산실적 집계', process: false, progress: ''},
      {uid: 2, workName: '비 용 배 부', process: false, progress: ''},
      {uid: 3, workName: this.matCost, process: false, progress: ''}];

    // this.service.checkProgress(this.mainFormData);

    const result = this.service.checkProgress(this.mainFormData);

    // tslint:disable-next-line:no-shadowed-variable
    result.then((result) => {
      console.log(result);

      for (const obj of result.data) {
        if (obj.progress.hasOwnProperty('ptProdTot')) {
          // @ts-ignore
          arr[0].progress = obj.progress.ptProdTot;
        }
        if (obj.progress.hasOwnProperty('ptItemCost')) {
          // @ts-ignore
          arr[1].progress = obj.progress.ptItemCost;
        }

        // 원가 산정 완료
        if (obj.progress.hasOwnProperty('costOut')) {
          // @ts-ignore
          arr[2].progress = obj.progress.costOut;
        }
      }
    });

    this.inputDataSource(arr, 'main');
  }

  async onResultSearch(e, rowIdx: any): Promise<void> {
    if (rowIdx === 0) {
      const path = '/pp/prodtot/';
      const param = this.mainCostYm.instance.option('value');

      await this.router.navigate([path + param], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
    } else if (rowIdx === 1) {
      const path = '/pp/ptitemcost/';
      const param = this.mainCostYm.instance.option('value');

      await this.router.navigate([path + param], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
    } else if (rowIdx === 2) {
      // 원가 산정
    }
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

  // async onSearch(): Promise<void> {
  //   const data = this.mainForm.instance.validate();
  //   this.mainFormData.costYm = this.mainCostYm.value;
  //
  //   if (data.isValid) {
  //     const result = await this.service.get(this.mainFormData);
  //
  //     if (this.resultMsgCallback(result, 'Search')) {
  //       await this.inputDataSource(result.data, 'main');
  //       this.mainGrid.focusedRowKey = null;
  //       this.mainGrid.paging.pageIndex = 0;
  //     } else {
  //       await this.inputDataSource([], 'main');
  //     }
  //   }
  // }

  async costStatement(e): Promise<void> {
    const visibleRows = this.mainGrid.instance.getVisibleRows();
    const costYm = document.getElementsByName('costYm').item(1).getAttribute('value');

    for (const row of visibleRows) {
      let result;

      // 실적 집계
      if (row.rowIndex === 0 && row.data.process === true) {

        const saveContent = this.mainFormData as ProdTotVO;
        saveContent.costYm = costYm;

        result = await this.prodTotService.prodTotCnt(saveContent);

        if (result.success) {
          this.utilService.notify_success(result.msg);
        } else {
          this.utilService.notify_error(result.msg);
        }
      }

      // 비용배부
      if (row.rowIndex === 1 && row.data.process === true) {
        const saveContent = this.mainFormData as ProdMatCostVO;
        saveContent.costYm = costYm;

        result = await this.ptItemCostService.proc(saveContent);

        if (result.success) {
          this.utilService.notify_success(result.msg);
        } else {
          this.utilService.notify_error(result.msg);
        }
      }
      if (row.rowIndex === 2 && row.data.process === true) {
        // 원가 산정
        const saveContent = this.mainFormData as PtProdMatCostProcessVO;
        saveContent.costYm = costYm;
        console.log('aaa');
        result = await this.service.costOut(saveContent);

        if (result.success) {
          this.utilService.notify_success(result.msg);
        } else {
          this.utilService.notify_error(result.msg);
        }
      }

      this.ngAfterViewInit();
    }
  }

  onCostYmChanged(e): void {
    if (e.value) {
      this.ngAfterViewInit();

    }
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.workName !== '원 가 산 정';
  }

}
