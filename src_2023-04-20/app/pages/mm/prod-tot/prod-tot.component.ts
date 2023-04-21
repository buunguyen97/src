import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {ProdTotService, ProdTotVO} from './prod-tot.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-prod-tot',
  templateUrl: './prod-tot.component.html',
  styleUrls: ['./prod-tot.component.scss']
})
export class ProdTotComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('prodDate', {static: false}) prodDate: DxDateBoxComponent;

  @ViewChild('prodTotForm', {static: false}) prodTotForm: DxFormComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  G_TENANT: any;
  mainFormData: ProdTotVO = {} as ProdTotVO;
  prodtotFormData: ProdTotVO = {} as ProdTotVO;
  mainData: ProdTotVO = {} as ProdTotVO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'item';
  selectedRows: number[];

  // Grid State
  GRID_STATE_KEY = 'mm_prodtot';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  dsFilteredItemId = [];
  dsUser = []; // 사용자
  dsItemId = [];
  dsActFlg = [];

  // summary
  searchList = [];

  now = this.utilService.getFormatMonth(new Date());

  costYm: string;

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: ProdTotService,
              private codeService: CommonCodeService,
              private route: ActivatedRoute) {
    this.G_TENANT = this.utilService.getTenant();
    this.calculateCustomSummary = this.calculateCustomSummary.bind(this);

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

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
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
      if (this.mainFormData.pageMove === 'true') {
        this.prodDate.value = this.mainFormData.prodDate;
        this.mainFormData.pageMove = 'false';

      } else {
        // this.mainFormData.prodDate = this.prodDate.value;
        this.mainFormData.prodDate = document.getElementsByName('prodDate').item(1).getAttribute('value');
      }

      // console.log(this.firstWorkDay2017.getFullYear());
      //
      // // @ts-ignore
      // this.mainFormData.prodDate = this.firstWorkDay2017.getFullYear() + '-' + this.firstWorkDay2017.getMonth();
      // console.log(this.mainFormData);

      const result = await this.service.get(this.mainFormData);
      this.searchList = result.data;
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

  // 실적 집계
  async onProdTot(e): Promise<void> {
    // const dataList = this.mainGrid.instance.getDataSource().items();
    const costYm = document.getElementsByName('costYm').item(1).getAttribute('value');

    const saveContent = this.mainFormData as ProdTotVO;

    saveContent.costYm = costYm;

    const detailList = this.mainGrid.instance.getDataSource().items();

    saveContent.ptProdTotDetailList = detailList;

    // let totProdQty = 0;
    // if (saveContent.ptProdTotDetailList.length > 0) {
    const result = await this.service.prodTotCnt(saveContent);
    //
    if (result.success) {
      await this.mainGrid.instance.deselectAll();
      await this.onSearch();
    } else {
      this.utilService.notify_error(result.msg);
    }
    //
    // } else {
    //   const msg = this.utilService.convert1('notExistInputProdData', '실적데이터가 없습니다.');
    //   this.utilService.notify_error(msg);
    //   return;
    // }
    // if (dataList.items().length > 0) {
    //
    //   const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('prodtot_cnt', '생산실적집계'));
    //   if (!await this.utilService.confirm(confirmMsg)) {
    //     return;
    //   }
    //
    //   for (const item of dataList.items()) {
    //
    //     const mainGridIdx = this.mainGrid.instance.getRowIndexByKey(item.uid);
    //     const prodQty = this.mainGrid.instance.cellValue(mainGridIdx, 'prodQty');  // 실적수량
    //     const itemId = this.mainGrid.instance.cellValue(mainGridIdx, 'prodQty');  // 실적수량
    //
    //     if (mainGridIdx < 0) {  // 선택된 로우가 없을 때
    //       const msg = this.utilService.convert1('notExistInputProdData', '실적데이터가 없습니다.');
    //       this.utilService.notify_error(msg);
    //       return;
    //     }
    //
    //     totProdQty = totProdQty + prodQty;
    //
    //   }
    //
    //   const prodDate = document.getElementsByName('prodDate').item(1).getAttribute('value');
    //   const saveContent = this.mainData as ProdTotVO;
    //
    //   saveContent.prodDate = prodDate;
    //   saveContent.totProdQty = totProdQty;

    //     saveContent.tenant = this.G_TENANT;
    //
    //   console.log(saveContent);

  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
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

    this.route.paramMap.subscribe(params => {
      this.costYm = params.get('param');
      console.log(this.costYm);
      if (this.costYm) {
        // this.mainForm.instance.getEditor('prodDate').option('value', this.costYm);
        this.mainFormData.prodDate = this.costYm;
        this.mainFormData.tenant = this.G_TENANT;
        this.mainFormData.pageMove = 'true';

        this.onSearch();
      }
    });
  }

  onOptionChanged(e): void {
    this.gridUtil.onOptionChangedForSummary(e, this); // 합계 계산
  }

  calculateCustomSummary(options): void {
    this.gridUtil.setCustomSummary(options, this.mainGrid, this);
  }

}
