import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {PtProdCostService, PtProdCostVO} from './pt-prod-cost.service';

@Component({
  selector: 'app-pt-prod-cost',
  templateUrl: './pt-prod-cost.component.html',
  styleUrls: ['./pt-prod-cost.component.scss']
})

export class PtProdCostComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  G_TENANT: any;
  mainFormData: PtProdCostVO = {} as PtProdCostVO;

  // grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';
  popupKey = 'uid';

  popupFormData: PtProdCostVO = {} as PtProdCostVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  // Grid Popup
  changes = [];
  popupVisible = false;
  popupMode = 'Add';
  popupData: PtProdCostVO = {} as PtProdCostVO;

  PAGE_PATH = '';


  // Grid State
  GRID_STATE_KEY = 'mm_ptprodcost';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  dsUser = []; // 사용자
  dsActFlg = [];
  dsCostGb = [];

  now = this.utilService.getFormatMonth(new Date());
  reqDateNow = '';


  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private service: PtProdCostService,
              private codeService: CommonCodeService) {
    this.G_TENANT = this.utilService.getTenant();
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.setCostGb = this.setCostGb.bind(this);
  }

  ngOnInit(): void {

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 비용구분
    this.codeService.getCode(this.G_TENANT, 'COSTGB').subscribe(result => {
      this.dsCostGb = result.data;
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

  // onValueChanged(e): void {
  //   console.log(e.value);
  //
  //   const prodDate = this.utilService.getFormatMonth(e.value);
  //
  //   // this.mainForm.instance.getEditor('prodDate').option('value', prodDate);
  // }

  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }

  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    if (popupMode === 'Edit') {
      this.popupData = data;
      this.popupData = {tenant: this.G_TENANT, ...this.popupData};
      this.popupMode = popupMode;

      this.onSearchPopup(data);

    } else {
      this.reqDateNow = this.utilService.getFormatMonth(new Date());
    }
    this.popupVisible = true;
  }

  // 팝업 그리드 조회
  async onSearchPopup(data): Promise<void> {
    if (this.popupData.uid) {
      const result = await this.service.getFull(this.popupData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
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

        // this.popupForm.instance.getEditor('itemId').option('value', data.childItemId);
        // this.popupGrid.editing.allowUpdating = true;
        await this.popupGrid.instance.deselectAll();
        this.reqDateNow = data.reqDate;

      }
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
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
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.onSearch();
  }

  popupShown(e): void {
    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
    this.utilService.getPopupGridHeight(this.popupGrid, this.popup);

    this.deleteBtn.visible = this.popupMode === 'Edit'; // 삭제버튼

    if (this.popupMode === 'Add') { // 신규
      // this.popupForm.instance.getEditor('actFlg').option('value', 'Y');

    } else if (this.popupMode === 'Edit') { // 수정

    }
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {

    const detailList = this.collectGridData(this.changes);

    console.log(detailList);

    // await this.popupGrid.instance.saveEditData();

    const popData = this.popupForm.instance.validate();
    const gridList = this.popupGrid.instance.getDataSource().items();

    if (popData.isValid && detailList.length > 0) {

      try {
        let result;
        // const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const saveContent = this.popupData as PtProdCostVO;
        const reqDate = document.getElementsByName('reqDate').item(1).getAttribute('value');

        for (const detail of detailList) {
          if (!detail.costGb) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert('mm_ptprodcost_costGb'));
            this.utilService.notify_error(msg);
            return;
          }
          if (detail.amt < 0) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert('prodcost_amt'));
            this.utilService.notify_error(msg);
            return;
          }
          if (!detail.divdYn) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert('prodcost_divdYn'));
            this.utilService.notify_error(msg);
            return;
          }
        }

        const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('/pp/prodcost', '항목별비용관리'));
        if (!await this.utilService.confirm(confirmMsg)) {
          const msg = this.utilService.convert('com_valid_required', this.utilService.convert('mm_ptprodcost_costGb'));
          this.utilService.notify_error(msg);
          return;
        }

        // saveContent.ptProdCostDetailList = this.popupGrid.instance.getDataSource().items();
        // saveContent.ptProdCostDetailList = this.popupGrid.instance.getVisibleRows().map(el => el.data);

        saveContent.ptProdCostDetailList = detailList;

        // saveContent.itemAdminId = itemAdminId;
        saveContent.tenant = this.G_TENANT;
        saveContent.reqDate = reqDate;

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
      } catch (e) {
        console.log(e);
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('ptprodcost_delete', '행복별 비용관리'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      this.popupData.ptProdCostDetailList = this.popupGrid.instance.getDataSource().items();

      const deleteContent = this.popupData as PtProdCostVO;

      console.log(deleteContent);

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

  // 추가버튼 이벤트
  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
      this.popupGrid.instance.cellValue(rowIdx, 'amt', 0);
      this.popupGrid.instance.cellValue(rowIdx, 'divdYn', 'Y');
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

  // 그리드 비용구분 선택시
  setCostGb(rowData: any, value: any): void {

    console.log(value);

    if (value) {
      for (const popupData of this.popupGrid.instance.getVisibleRows()) {
        console.log(this.popupGrid.instance.getVisibleRows());
        console.log(popupData.data);
        if (value === popupData.data.costGb) {
          const msg = this.utilService.convert('sameCostGb', '등록된 비용이 있습니다.');
          this.utilService.notify_error(msg);
          return;
        }
      }
    }
    rowData.costGb = value;
  }

  // changes -> savedata 변환
  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
      // Insert일 경우 UID가 들어가 있기 떄문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT,
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
            }, changes[rowIndex].data)
        );
      } else {
        console.log(changes[rowIndex].data);
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
            }, changes[rowIndex].data)
        );
      }
    }
    return gridList;
  }

}

