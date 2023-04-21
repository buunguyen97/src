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
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {PtProdRelCutForm2, PtProdRelService, PtProdRelVO} from './pt-prod-rel.service';
import _ from 'lodash';

@Component({
  selector: 'app-pt-prod-rel',
  templateUrl: './pt-prod-rel.component.html',
  styleUrls: ['./pt-prod-rel.component.scss']
})
export class PtProdRelComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupGridSub', {static: false}) popupGridSub: DxDataGridComponent;

  @ViewChild('popupCut', {static: false}) popupCut: DxPopupComponent;
  @ViewChild('popupFormCut', {static: false}) popupFormCut: DxFormComponent;
  @ViewChild('popupFormCut2', {static: false}) popupFormCut2: DxFormComponent;
  @ViewChild('popupGridCut', {static: false}) popupGridCut: DxDataGridComponent;
  @ViewChild('popupGridStock', {static: false}) popupGridStock: DxDataGridComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('fromWorkDate', {static: false}) fromWorkDate: DxDateBoxComponent;
  @ViewChild('toWorkDate', {static: false}) toWorkDate: DxDateBoxComponent;

  // Global
  G_TENANT: any;
// ***** main ***** //
  // Form
  mainFormData: PtProdRelVO = {} as PtProdRelVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: PtProdRelVO = {} as PtProdRelVO;
  popupDataSource: DataSource;
  popupDataSourceSub: DataSource;
  popupEntityStore: ArrayStore;
  popupEntityStoreSub: ArrayStore;

  popupStockDataSource: DataSource;
  popupStockEntityStore: ArrayStore;

  key = 'uid';
  popupKey = 'popupKey';

  selectedRows: number[];

  dsUser = [];
  dsProdKey = [];
  dsItemId = [];
  dsFilteredItemId = [];
  dsWarehouseId = [];
  dsCutYn = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  dsRout = [];
  dsRoutGb = [];
  dsInpType = [];
  dsProdGb = [];
  dsNonGb = [];
  dsUnitStyle = [];
  dsYN = [];
  dsLotId = [];
  dsFilteredLotId = [];
  dsFullItemId = [];
  dsSpec = [];
  dsRawItemId = [];

  searchList = [];

  // Grid Popup
  changes = [];
  stockChanges = [];
  popupVisible = false;
  popupCutVisible = false;
  popupMode = 'Add';
  popupData: PtProdRelVO = {} as PtProdRelVO;
  popupData2: PtProdRelVO = {} as PtProdRelVO;

  PAGE_PATH = '';
  reQty = 0;
  totalProdQty = 0;

  compareDataSet: PtProdRelVO[];

  GRID_STATE_KEY = 'mm_ptprodrel1';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popupCut');
  saveStatePopup2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popupCut');


  loadStateStock = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_stock');
  saveStateStock = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_stock');


  constructor(
    public utilService: CommonUtilService,
    public service: PtProdRelService,
    public codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.PAGE_PATH = this.utilService.getPagePath();
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCutSaveClick = this.popupCutSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.onPopupAfterClose = this.onPopupAfterClose.bind(this);
    this.setItemValue = this.setItemValue.bind(this);
    this.setRoutValue = this.setRoutValue.bind(this);
    this.getFilteredItemId2 = this.getFilteredItemId2.bind(this);
    this.onChangedProdQty = this.onChangedProdQty.bind(this);
    this.setLotValue = this.setLotValue.bind(this);
    this.onSearchPopupCut = this.onSearchPopupCut.bind(this);
    this.setProdQtyValue = this.setProdQtyValue.bind(this);
    this.setHeightValue = this.setHeightValue.bind(this);
    this.setItemValue2 = this.setItemValue2.bind(this);
    this.popupShown = this.popupShown.bind(this);
    this.setRecommendInpQty = this.setRecommendInpQty.bind(this);
    this.onChangedQty = this.onChangedQty.bind(this);
  }


  ngOnInit(): void {
    this.initCode();
  }

  ngAfterViewInit(): void {
    // 팝업 그리드 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [], key: this.popupKey
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);

    this.initForm();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.fromWorkDate = document.getElementsByName('fromWorkDate').item(1).getAttribute('value');
      this.mainFormData.toWorkDate = document.getElementsByName('toWorkDate').item(1).getAttribute('value');

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

  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 절단여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsCutYn = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsFullItemId = result.data;

      this.dsFilteredItemId = this.dsFullItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
      this.dsRawItemId = this.dsFullItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId() && el.itemTypecd === '01');   // 원자재만 조회
      // this.dsRawItemId = this.dsFullItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId() && el.itemTypecd === '01' && el.otherRefNo1 === 'Y');   // 원자재만 조회
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });


    // 공정ID
    this.codeService.getRoute(this.G_TENANT).subscribe(result => {

      this.dsRout = result.data;
    });

    // 지시번호
    this.codeService.getProdKey(this.G_TENANT).subscribe(result => {
      this.dsProdKey = result.data;
    });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnitStyle = result.data;
    });

    // 생산품목사유(불량사유)
    this.codeService.getCode(this.G_TENANT, 'DAMAGEREASON').subscribe(result => {
      this.dsNonGb = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 로트
    this.codeService.getLotId(this.G_TENANT, this.utilService.getCommonItemAdminId()
      , this.utilService.getCommonOwnerId()).subscribe(result => {
      this.dsLotId = result.data;
      this.dsFilteredLotId = this.dsLotId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromWorkDate.value = rangeDate.fromDate;
    this.toWorkDate.value = rangeDate.toDate;

    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
    this.mainForm.instance.focus();
  }

  showPopup(popupMode, data): void {

    this.changes = [];  // 초기화
    const selectList = this.mainGrid.instance.getSelectedRowsData();

    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.popupKey
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    this.popupEntityStoreSub = new ArrayStore(
      {
        data: [],
        key: this.popupKey
      }
    );

    this.popupDataSourceSub = new DataSource({
      store: this.popupEntityStoreSub
    });

    if (popupMode === 'Edit') {
      this.popupData = data;
      this.popupData = {tenant: this.G_TENANT, ...this.popupData};
      this.popupMode = popupMode;
    }

    if (selectList[0].cutYn === 'Y') {
      this.popupCut.visible = true;
    } else {
      this.popup.visible = true;
    }
  }

  // 팝업 그리드 조회 (절단x)
  async onSearchPopup(data): Promise<void> {

    if (this.popupData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getFull(this.popupData);
      console.log(result);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        let maxProdSeq = 1;
        const findMaxProdSeq = await this.service.getMaxProdSeq(this.popupData);
        if (findMaxProdSeq.success) {
          maxProdSeq = findMaxProdSeq.data;
        }

        this.popupForm.instance.getEditor('prodSeq').option('value', maxProdSeq);
        this.popupForm.instance.getEditor('prodDate').option('value', this.gridUtil.getToday());

        for (const obj of result.data) {
          const filtered = this.dsLotId.filter(el => {
            return el.damageFlg === 'N' && el.itemAdminId === this.utilService.getCommonItemAdminId()
              && el.itemId === obj.childItemId;

            // return el.lot1 === this.popupForm.instance.getEditor('prodKey').option('value')
            //   && el.damageFlg === 'N' && el.itemAdminId === this.utilService.getCommonItemAdminId()
            //   && el.itemId === obj.childItemId;
          });

          filtered.sort((a, b) => {
            return a.whInDate - b.whInDate;
          });

          obj.lotNo = filtered.length > 0 ? filtered[0].lotId : null;
          obj.qty1 = filtered.length > 0 ? filtered[0].qty1 : null;
          obj.prodGb = 'Y';

          if (obj.qty1 >= obj.reQty * this.popupForm.instance.getEditor('prodQty').option('value')) {
            obj.inpQty = obj.reQty * this.popupForm.instance.getEditor('prodQty').option('value');
          } else {
            obj.inpQty = null;
          }
        }

        this.utilService.notify_success('search success');

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.popupKey
          }
        );
        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });

        this.compareDataSet = _.cloneDeep(result.data);
        this.dsItemId = _.cloneDeep(result.data);


        // this.popupForm.instance.getEditor('itemId').option('value', data.childItemId);
        // this.popupGrid.editing.allowUpdating = true;

        // 횡스크롤 제거
        // this.gridUtil.fnScrollOptionHoriz(this.popup);
        // await this.popupGrid.instance.deselectAll();
      }
    }
  }

  // 팝업 그리드 조회 (절단)
  async onSearchPopupCut(data): Promise<void> {

    this.stockChanges = [];
    if (this.popupData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getFull(this.popupData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        this.popupFormCut.instance.getEditor('prodDate').option('value', this.gridUtil.getToday());
        this.utilService.notify_success('search success');

        if (result.data) {
          this.popupData2 = result.data.pop() || {} as PtProdRelVO;

        } else {
        }

        // this.popupForm.instance.getEditor('itemId').option('value', data.childItemId);
        // this.popupGrid.editing.allowUpdating = true;

        // this.popupData2.reQty = this.popupData.reQty;
        // this.popupFormCut2.instance.getEditor('lossRate').option('value', this.popupData.lossRate);
        this.popupData2.lossRate = this.popupData.lossRate;

        this.onChangedProdQty();
        // 횡스크롤 제거
        // this.gridUtil.fnScrollOptionHoriz(this.popup);
        // await this.popupGrid.instance.deselectAll();
      }
    }
  }

  // 그리드 Lookup filter 품목
  async getFilteredItemId(e): Promise<any> {

    if (e.value) {
      const selectedItem = this.dsFullItemId.find(el => el.uid === e.value);
      this.popupData2.height3 = selectedItem.height3;

      // 로트
      await this.codeService.getLotId(this.G_TENANT, this.utilService.getCommonItemAdminId()
        , this.utilService.getCommonOwnerId()).subscribe(result => {
        this.dsLotId = result.data;
      });

      this.dsFilteredLotId = this.dsLotId.filter(el => el.itemId === e.value);

      const filtered = this.dsLotId.filter(el => {

        return el.itemId === e.value;
      });

      const itemHeight = Math.floor(this.popupFormCut.instance.getEditor('height3').option('value'));
      const reQty = this.popupFormCut.instance.getEditor('reQty').option('value');
      const childItemHeight = Math.floor(this.popupData2.height3);

      const recommendInpQty = Math.floor(childItemHeight / itemHeight);

      this.popupData2.recommendInpQty = Math.ceil(reQty / recommendInpQty);
      // if (reQty % recommendInpQty === 0) {
      //   this.popupData2.recommendInpQty = Math.floor(reQty / recommendInpQty);
      // } else {
      //   this.popupData2.recommendInpQty = Math.floor(reQty / recommendInpQty) + 1;
      // }


      // 투입량 자동 생성
      // const idx = this.popupGridStock.focusedRowIndex;
      //
      // for (const popupData of this.popupGridStock.instance.getVisibleRows()) {
      //   const prodQty = this.popupFormCut.instance.getEditor('prodQty').option('value');
      //   const reQty = this.popupGridStock.instance.cellValue(idx, 'reQty');
      //   const qty1 = this.popupGridStock.instance.cellValue(idx, 'qty1');
      //
      //   if (qty1 >= (this.popupData2.width3 / this.popupData.width3) * prodQty) {
      //     popupData.data.inpQty = reQty * prodQty;
      //     console.log(popupData.data.inpQty);
      //     console.log(1);
      //   }
      // }

      this.popupStockEntityStore = new ArrayStore(
        {
          data: filtered,
          key: 'uid'
        }
      );
      this.popupStockDataSource = new DataSource({
        store: this.popupStockEntityStore
      });
    }
  }

  async setRecommendInpQty(e): Promise<any> {
    const itemHeight = Math.floor(this.popupFormCut.instance.getEditor('height3').option('value'));
    const childItemHeight = Math.floor(this.popupData2.height3);

    const recommendInpQty = Math.floor(childItemHeight / itemHeight);

    if (e.value) {
      this.popupData2.recommendInpQty = Math.ceil(e.value / Number(recommendInpQty));
    }

  }

  async onChangedQty(): Promise<void> {
    const prodQty = this.popupData.prodQty;
    const checkList = this.popupGrid.instance.getVisibleRows().filter(row => row.rowType === 'data');

    if (prodQty) {
      for (const checkRow of checkList) {
        if (checkRow.data.reQty && checkRow.data.lotNo) {
          checkRow.data.inpQty = prodQty * checkRow.data.reQty;
        }
      }

      this.popupGrid.instance.refresh();
    }
  }

  async onChangedProdQty(): Promise<void> {
    const height3 = this.popupData2.height3;  // 길이
    const inpQty = this.popupData2.inpQty;  // 투입량
    const length = this.popupData2.length;  // 절단길이
    const lossRate = this.popupData2.lossRate;  // LOSS길이

    if (!lossRate) {
      this.popupData2.lossRate = 0;
    }

    this.popupData2.prodQty = Math.floor(Number(Math.floor(height3 / length) * inpQty));
    this.popupData2.remainLength = (height3 * inpQty) - (length * this.popupData2.prodQty) - (inpQty * this.popupData2.lossRate);
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = false;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupCut.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();

    this.onSearch();
  }

  onPopupCutAfterClose(): void {
    this.popupFormCut.instance.resetValues();
    this.popupFormCut2.instance.resetValues();

    if (this.popupStockDataSource) {
      this.popupStockEntityStore.clear();
      this.popupStockDataSource.reload();
      this.popupGridStock.instance.cancelEditData();
    }

    this.onSearch();
  }

  popupShown(e): void {
    this.utilService.getPopupGridHeight(this.popupGrid, this.popup, -68);

    // 횡스크롤 제거
    this.gridUtil.fnScrollOption(this.popupGrid);
    this.popupForm.instance.getEditor('prodKey').option('disabled', true);
    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가

    // 로트
    this.codeService.getLotId(this.G_TENANT, this.utilService.getCommonItemAdminId()
      , this.utilService.getCommonOwnerId()).subscribe(result => {
      this.dsLotId = result.data;
      this.dsFilteredLotId = this.dsLotId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    if (this.popupMode === 'Add') { // 신규

    } else if (this.popupMode === 'Edit') { // 수정
      this.popupForm.instance.getEditor('workDate').option('disabled', true);
    }

    // (지시수량 - 실적수량 ) 표시
    this.popupForm.instance.getEditor('prodQty').option('value', Number(this.popupData.ordQty) - Number(this.popupData.prodQty));

    this.onSearchPopup(this.popupData);
  }

  popupShownCut(e): void {
    this.stockChanges = [];
    this.popupGridStock.instance.cancelEditData();

    this.utilService.getCalcGridHeight(this.popupGridCut);
    // 횡스크롤 제거
    this.gridUtil.fnScrollOption(this.popupGridCut);

    this.popupFormCut.instance.getEditor('prodKey').option('disabled', true);

    this.popupGridCut.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가

    if (this.popupMode === 'Add') { // 신규
      // this.popupForm.instance.getEditor('actFlg').option('value', 'Y');

    } else if (this.popupMode === 'Edit') { // 수정
      this.popupFormCut.instance.getEditor('workDate').option('disabled', true);
    }

    this.onSearchPopupCut(this.popupData);
  }


  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {
    // await this.mainGrid1.instance.saveEditData();
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      try {
        let result;
        const warehouseId = this.mainForm.instance.getEditor('warehouseId').option('value');
        const ownerId = this.mainForm.instance.getEditor('ownerId').option('value');
        const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const itemId = this.popupForm.instance.getEditor('itemId').option('value');
        // const prodKey = this.popupForm.instance.getEditor('prodKey').option('value');

        const saveContent = this.popupData as PtProdRelVO;

        // if (Number(saveContent.prodQty) <= 0) {
        //   const validMsg = this.utilService.convert('com_valid_required', this.utilService.convert('mm_ptprodrel_prodQty'));
        //   this.utilService.notify_error(validMsg);
        //   return;
        // }

        await this.popupGrid.instance.saveEditData();

        const changes = this.collectGridData(this.changes);
        const insertChanges = changes.filter(el => el.operType === 'insert');

        const detailList = this.popupGrid.instance.getDataSource().items();

        saveContent.ptProdRelDetailList = detailList.concat(insertChanges);

        console.log(saveContent);

        // saveContent.ptProdRelDetailList = detailList;
        // saveContent.ptProdRelDetailList = this.popupGrid.instance.getDataSource().items();

        // 투입량 입력 체크
        for (const relDetail of saveContent.ptProdRelDetailList) {
          let idx = 0;
          if (!relDetail.lotNo) {
            const validMsg = this.utilService.convert('com_valid_required', this.utilService.convert('mm_ptprodrel_lotNo'));
            this.utilService.notify_error(validMsg);
            return;
          }

          if (!relDetail.inpQty) {
            const validMsg = this.utilService.convert('com_valid_required', this.utilService.convert('mm_ptprodrel_inpQty'));
            this.utilService.notify_error(validMsg);
            return;
          }

          const filtered = this.dsLotId.find(el => {
            return el.damageFlg === 'N' && el.itemAdminId === this.utilService.getCommonItemAdminId()
              && el.itemId === relDetail.childItemId && el.lotId === relDetail.lotNo;
          });

          if (filtered) {
            if (relDetail.inpQty > filtered.qty1) {
              const validMsg = this.utilService.convert1('ptprodrelQtyError', '투입량이 가용재고 수량보다 많습니다.');
              this.utilService.notify_error(validMsg);
              return;
            }
          }

          // const prodQty = this.popupData.prodQty;  // 실적수량
          // let inpQty = 0;
          // this.reQty = relDetail.reQty;  // 소요량
          //
          // for (const relDetail2 of saveContent.ptProdRelDetailList) {
          //   const childItemId = relDetail2.childItemId;
          //
          //   if (childItemId === relDetail2.childItemId && relDetail2.prodGb === 'Y') {
          //     inpQty = inpQty + relDetail2.inpQty;   // 투입량
          //   }
          // }
          // console.log(prodQty);
          // console.log(this.reQty);
          // console.log(inpQty);
          // if (prodQty * this.reQty !== inpQty) {
          //   const validMsg = this.utilService.convert1('com_valid_requiredInpQty', '투입량을 확인해 주세요.');
          //   // const childitem = this.popupGrid.instance.cellValue(idx, 'childItemId');
          //   const childitem = this.popupGrid.instance.getCellElement(idx, 'childItemId').innerText;
          //   // const childitem = this.popupGrid.instance.getVisibleRows();
          //
          //   // console.log(childitem);
          //   this.utilService.notify_error(childitem + ' ' + validMsg);
          //   return;
          // }
          //
          idx++;
        }

        // 비교군을 복사하여 소요량 X 실적수량 값 저장
        const compareDataSetCopy = _.cloneDeep(this.compareDataSet);
        compareDataSetCopy.forEach(row => {
          if (row.prodGb === 'Y') {
            console.log(row);
            row.inpQty = row.reQty * this.popupData.prodQty;
          }
        });
        console.log(compareDataSetCopy);

        // 비교군의 투입량의 값 차감
        for (const relDetail of saveContent.ptProdRelDetailList) {
          const pickedItem = compareDataSetCopy.find(el => el.childItemId === relDetail.childItemId);
          if (relDetail.prodGb === 'Y' && pickedItem) {
            pickedItem.inpQty = pickedItem.inpQty - relDetail.inpQty;
          }

        }

        // 비교군 조회해서 모두 0이면 정상, 아닌 것이 하나라도 있으면 메세지 처리 후 저장 취소
        let rtnVal = false;
        compareDataSetCopy.forEach(row => {
          if (row.inpQty !== 0) {
            const msg = this.utilService.convert('compareDataError', '투입량이 부족합니다.');
            this.utilService.notify_error(msg);
            rtnVal = true;
            return false;
          }
        });

        if (rtnVal) {
          return;
        }

        const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('ptprodrel', '생산실적'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        saveContent.itemAdminId = itemAdminId;
        saveContent.warehouseId = warehouseId;
        saveContent.ownerId = ownerId;
        saveContent.companyId = ownerId;
        saveContent.itemId = itemId;
        saveContent.logisticsId = this.utilService.getCommonWarehouseVO().logisticsId;

        console.log(saveContent);

        result = await this.service.save(saveContent);

        // if (this.popupMode === 'Add') {
        // } else {
        //   result = await this.service.update(saveContent);
        // }

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 저장버튼 이벤트
  async popupCutSaveClick(e): Promise<void> {
    const reQty = this.popupFormCut.instance.getEditor('reQty').option('value'); // 소요량

    const lossRate = this.popupFormCut2.instance.getEditor('lossRate').option('value');  // LOSS길이
    const height = this.popupFormCut.instance.getEditor('height3').option('value');
    const height3 = this.popupFormCut2.instance.getEditor('height3').option('value');
    this.popupData2.reQty = this.popupData.reQty;

    let inpQty = 0;
    let prodQty = 0;
    let totalNonQty = 0;
    this.totalProdQty = 0;

    await this.popupGridStock.instance.saveEditData();

    const stockChangeList = this.popupGridStock.instance.getDataSource().items();

    for (const sto of stockChangeList) {
      inpQty += Number(sto.inpQty);
      prodQty = Math.floor(height3 / height) * (Number(sto.inpQty) || 0);

      this.totalProdQty = this.totalProdQty + prodQty;
    }

    for (const change of this.changes) {
      totalNonQty += Number(change.data.nonQty);
    }

    prodQty = Math.floor(height3 / height) * (inpQty || 0);
    this.popupData2.remainLength = (height3 * inpQty) - (height * prodQty) - (inpQty * lossRate);

    if ((!this.popupFormCut.instance.getEditor('reQty').option('value'))) {
      this.utilService.notify_error(this.utilService.convert1('mm_ptprodrq_validationmessage', '필수값을 입력하세요.'));
      return;
    }

    if (this.popupFormCut2.instance.getEditor('remainLength').option('value') < 0) {
      this.utilService.notify_error(this.utilService.convert1('remainLengtherror', '잔량(길이)는 0 이상이어야 합니다.'));
      return;
    }

    // 소요량과 투입량이 일치하지 않으면
    if (Number(this.popupData.ordQty) !== Number(reQty)) {
      this.utilService.notify_error(this.utilService.convert1('notMatchWithInpAndRe', '지시수량과 실적수량이 일치하지 않습니다.'));
      return;
    }

    // 절단량 / 실적수량 비교
    if (Number(this.totalProdQty) < Number(reQty)) {
      this.utilService.notify_error(this.utilService.convert1('notMatchWithProdAndRe', '실적수량이 생산수량보다 클 수 없습니다.'));
      return;
    }

    if (Number(this.totalProdQty) !== (this.popupFormCut.instance.getEditor('reQty').option('value') + Number(totalNonQty))) {
      this.utilService.notify_error(this.utilService.convert1('mm_ptprodrel_prodqtyErrormessage', '전체 등록 수량이 생성수량과 일치하지 않습니다.'));
      return;
    }

    const confirmMsg = this.utilService.convert1('saveptprodrelCut', '생산실적(절단)을 저장하시겠습니까?');
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    // await this.mainGrid1.instance.saveEditData();
    const popData = this.popupFormCut2.instance.validate();
    if (popData.isValid) {
      try {
        let result;
        const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const itemId = this.popupFormCut.instance.getEditor('itemId').option('value');
        // const prodKey = this.popupForm.instance.getEditor('prodKey').option('value');

        const saveContent = this.popupData as PtProdRelVO;

        saveContent.ownerId = this.utilService.getCommonOwnerId();
        saveContent.warehouseId = this.utilService.getCommonWarehouseId();
        saveContent.companyId = Number(this.utilService.getCompanyId());

        const detailList = this.collectGridData(this.changes);
        saveContent.ptProdRelDetailList = detailList;

        this.popupData2.inpQty = inpQty;
        this.popupData2.prodQty = prodQty;

        // @ts-ignore
        saveContent.ptProdRelCutForm2 = this.popupData2 as PtProdRelCutForm2;
        saveContent.itemAdminId = itemAdminId;
        saveContent.itemId = itemId;

        // await this.popupGridStock.instance.saveEditData();
        // const stockList = this.popupGridStock.instance.getDataSource().items();
        saveContent.stockList = stockChangeList;

        console.log(saveContent);
        result = await this.service.saveCut(saveContent);

        // if (this.popupMode === 'Add') {
        // } else {
        //   result = await this.service.update(saveContent);
        // }

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          // this.popupForm.instance.resetValues();

          this.popupCutVisible = false;
          await this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('ptprodrel', '생산실적'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      this.popupData.ptProdRelDetailList = this.popupGrid.instance.getDataSource().items();

      const deleteContent = this.popupData as PtProdRelVO;

      const result = await this.service.delete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  onInitNewRowCut(e): void {
    // e.data.itemAdminId = this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : null;
    e.data.remainLength = 0;
    e.data.childItemId = this.popupData.itemId;
    e.data.unit = this.popupData.itemId;

    e.data.unit = this.dsFullItemId.filter(el => el.uid === e.data.childItemId)[0].unit3Stylecd;
    e.data.spec = this.dsFullItemId.filter(el => el.uid === e.data.childItemId)[0].spec;
    e.data.reQty = this.dsFullItemId.filter(el => el.uid === e.data.childItemId)[0].reQty;

    // e.data.damageFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.noShippingFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.foreignCargoFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.customsReleaseFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.taxFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.expectQty1 = 0;
    // e.data.receivedQty1 = 0;
    // e.data.adjustQty1 = 0;
    // e.data.whInDate = this.gridUtil.getToday();
  }

  // 추가버튼 이벤트
  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);

    });
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  // 추가버튼 이벤트
  addClickCut(): void {
    this.popupGridCut.instance.addRow().then(r => {
      const rowIdx = this.popupGridCut.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGridCut);

    });
  }

  // 삭제버튼 이벤트
  async deleteClickCut(): Promise<void> {
    if (this.popupGridCut.focusedRowIndex > -1) {
      const focusedIdx = this.popupGridCut.focusedRowIndex;

      this.popupGridCut.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGridCut.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGridCut.focusedRowIndex = focusedIdx - 1;
    }
  }

  // changes -> savedata 변환
  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  // 그리드 Lookup filter 품목
  // 품목에 따른 lot번호 필터
  getFilteredItemId2(options): any {
    const filter = [];
    const idx = this.popupGrid.focusedRowIndex;
    filter.push(['itemAdminId', '=', this.utilService.getCommonItemAdminId()]);
    filter.push(['itemId', '=', this.popupGrid.instance.cellValue(idx, 'childItemId')]);


    return {
      store: this.dsLotId,
      filter: options.data ? filter : null
    };
  }

  // 그리드 공정id 선택시
  setLotValue(rowData: any, value: any): void {

    // const filtered = this.dsLotId.filter(el => {
    //   return el.lot1 === this.popupForm.instance.getEditor('prodKey').option('value')
    //     && el.damageFlg === 'N' && el.itemAdminId === this.utilService.getCommonItemAdminId()
    //     && el.itemId === rowData.childItemId;
    // });
    //
    // filtered.sort((a, b) => {
    //   return a.whInDate - b.whInDate;
    // });
    // rowData.lotNo = filtered.length > 0 ? filtered[0].lotId : null;
    // rowData.routGb = this.dsRout.filter(el => el.uid === value)[0].routGb;    // 공정유형 가져오기
    // rowData.lossRate = this.dsRout.filter(el => el.uid === value)[0].lossRate;    // 손실율 가져오기

    rowData.lotNo = value;

    const idx = this.popupGrid.focusedRowIndex;
    const childItemId = this.popupGrid.instance.cellValue(idx, 'childItemId');

    const filtered = this.dsLotId.filter(el => {
      return el.damageFlg === 'N' && el.itemAdminId === this.utilService.getCommonItemAdminId()
        && el.itemId === childItemId && el.lotId === value;
    });

    rowData.qty1 = filtered[0].qty1;

    for (const popupData of this.popupGrid.instance.getVisibleRows()) {
      const prodQty = this.popupForm.instance.getEditor('prodQty').option('value');
      const reQty = this.popupGrid.instance.cellValue(idx, 'reQty');

      if (rowData.qty1 >= reQty * prodQty) {
        rowData.inpQty = reQty * prodQty;
      } else {
        rowData.inpQty = '';
      }
      // if (rowData.lotNo === popupData.data.lotNo) {
      //   const msg = this.utilService.convert('sameRout', '등록된 공정이 있습니다.');
      //   this.utilService.notify_error(msg);
      //   return;
      // }
    }
  }

  // 그리드 품목 선택시
  setItemValue(rowData: any, value: any): void {
    rowData.childItemId = value;

    rowData.unit = this.dsItemId.filter(el => el.childItemId === value)[0].unit;
    rowData.spec = this.dsItemId.filter(el => el.childItemId === value)[0].spec;
    rowData.reQty = this.dsItemId.filter(el => el.childItemId === value)[0].reQty;

  }

  // 그리드 품목 선택시
  setItemValue2(rowData: any, value: any): void {
    rowData.childItemId = value;

    rowData.unit = this.dsFullItemId.filter(el => el.uid === value)[0].unit3Stylecd;
    rowData.spec = this.dsFullItemId.filter(el => el.uid === value)[0].spec;
    rowData.reQty = this.dsFullItemId.filter(el => el.uid === value)[0].reQty;
  }


  // 절단량 계산
  setProdQtyValue(rowData: any): number {
    const height = this.popupFormCut.instance.getEditor('height3').option('value');
    const height2 = this.popupFormCut2.instance.getEditor('height3').option('value');

    // (길이 / 절단길이) * 투입량
    return Math.floor(height2 / height) * (rowData.inpQty || 0);


  }

  setHeightValue(rowData: any): number {
    return this.popupFormCut2.instance.getEditor('height3').option('value');
  }

  // 그리드 공정id 선택시
  setRoutValue(rowData: any, value: any): void {
    rowData.routId = value;
    rowData.workCt = this.dsRout.filter(el => el.uid === value)[0].workCt;        // 작업내용 가져오기
    rowData.routGb = this.dsRout.filter(el => el.uid === value)[0].routGb;    // 공정유형 가져오기
  }


  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 수량 입력시 입력수량 갱신
  onUpdateInputQty(e): void {

    if (e.fullName === 'editing.changes') {
      const lossRate = this.popupFormCut2.instance.getEditor('lossRate').option('value');

      const height = this.popupFormCut.instance.getEditor('height3').option('value');
      const height2 = this.popupFormCut2.instance.getEditor('height3').option('value');

      let inpQty = 0;
      let prodQty = 0;
      for (const sto of this.stockChanges) {
        const idx = this.popupGridStock.instance.getRowIndexByKey(sto.key);
        const qty1 = this.popupGridStock.instance.cellValue(idx, 'qty1');

        // 가용재고 / 투입량 비교
        if (Number(qty1) < Number(sto.data.inpQty)) {
          this.utilService.notify_error(this.utilService.convert('so_valid_qtylt',
            this.utilService.convert('mm_ptprodrel_inpQty'),
            this.utilService.convert('mm_ptprodrel_qty1Allocated'))
          );

          sto.data.inpQty = '';
          this.setFocusRow(sto.rowIndex, this.popupGridStock);
          return;
        }

        inpQty += Number(sto.data.inpQty);
      }

      prodQty = Math.floor(height2 / height) * (inpQty || 0);

      this.popupFormCut2.instance.getEditor('remainLength').option('value', (height2 * inpQty) - (height * prodQty) - (inpQty * lossRate));

    }
  }

  onInitNewRow(e): void {
    e.data.prodGb = 'Y';
  }

}
