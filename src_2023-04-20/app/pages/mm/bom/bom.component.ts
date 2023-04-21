import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxTreeListComponent} from 'devextreme-angular';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {BomService} from './bom.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';


@Component({
  selector: 'app-bom',
  templateUrl: './bom.component.html',
  styleUrls: ['./bom.component.scss']
})
export class BomComponent implements OnInit, AfterViewInit {

  @ViewChild('mainGrid1', {static: false}) mainGrid1: DxTreeListComponent;
  @ViewChild('mainGrid2', {static: false}) mainGrid2: DxDataGridComponent;
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;


  // Global
  G_TENANT: any;
  ITEMADMINID: any;
  ITEMID: any;

  mainFormData = {};
  dataSource: DataSource;
  dataSource2: DataSource;
  selectedRows: number[];

  dsItemAdminId = [];
  dsItemId = [];
  dsSubItemId = [];
  dsUser = [];

  pageSizeFilter = [];

  GRID_STATE_KEY = 'mm_bom';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  entityStore1: ArrayStore;
  entityStore2: ArrayStore;

  changes = [];
  treeKey = 'uid';
  key = 'uid';

  constructor(public gridUtil: GridUtilService,
              public utilService: CommonUtilService,
              private service: BomService,
              private codeService: CommonCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.calcTotalAmount = this.calcTotalAmount.bind(this);
  }

  ngOnInit(): void {
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 페이징 필터
    this.pageSizeFilter = this.gridUtil.getAllowedPageSize();
    this.pageSizeFilter = this.pageSizeFilter.filter(el => el !== 'all');

    // // 품목관리사
    // this.codeService.getCode(this.G_TENANT, 'itemAdminId').subscribe(result => {
    //   this.dsItemAdminId = result.data;
    // });

    this.entityStore1 = new ArrayStore(
      {
        data: [],
        key: this.treeKey
      }
    );

    // ArrayStore - DataSource와 바인딩
    // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음
    this.dataSource = new DataSource({
      store: this.entityStore1
    });

    this.entityStore2 = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.dataSource2 = new DataSource({
      store: this.entityStore2
    });
  }

  ngAfterViewInit(): void {
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.utilService.getGridHeight(this.mainGrid2);
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
    // 아코디언 모두 펼치기
    this.mainForm.instance.focus();
  }

  // 조회
  async onSearch(): Promise<void> {
    // 조회패널에 필수컬럼에 값 있는지 체크
    const data = this.mainForm.instance.validate();
    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {
      // Service의 get 함수 생성
      const result = await this.service.get(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid1.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore1 = new ArrayStore(
          {
            data: result.data,
            key: this.treeKey
          }
        );

        // ArrayStore - DataSource와 바인딩
        // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음
        this.dataSource = new DataSource({
          store: this.entityStore1
        });
        await this.mainGrid1.instance.deselectAll();
        this.mainGrid1.focusedRowKey = null;
        this.mainGrid1.paging.pageIndex = 0;
      }
    }
  }

  async onSave(): Promise<void> {
    // await this.mainGrid1.instance.saveEditData();
    const tempData = this.collectGridData(this.changes);

    const messages = {
      subItemId: 'mm_bom_subItemId',
      qty1: 'mm_bom_qty1',
      lossQty1: 'mm_bom_lossQty1',
      lossQty2: 'mm_bom_lossQty2'
    };
    const columns = ['subItemId', 'qty1', 'lossQty1', 'lossQty2'];
    if (tempData.length > 0) {
      for (const item of tempData) {
        if (!item.key && !item.uid) {
          for (const col of columns) {
            if ((item[col] === undefined) || (item[col] === '')) {
              this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(messages[col])));
              return;
            }
          }
        }

        this.mainGrid2.instance.byKey(item.key).then(
          (dataItem) => {
            for (const col of columns) {
              if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
                this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(messages[col])));
                return;
              }
            }
          }
        );

        if (item.qty1 <= 0) {
          // '수량을 1개 이상 입력하세요.'
          const msg = this.utilService.convert1('bom_custom_qty1', '수량을 1개 이상 입력하세요.');
          this.utilService.notify_error(msg);
          return;
        }
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
    }

    const result = await this.service.save(tempData);

    if (result.success) {
      await this.mainGrid1.instance.saveEditData();
      this.utilService.notify_success('save success');
      this.onSearch();
    } else {
      this.utilService.notify_error('save failed');
    }
  }

  onInitNewRow(e): void {
    e.data.tenant = this.G_TENANT;
    e.data.itemAdminId = this.ITEMADMINID ? this.ITEMADMINID : this.mainForm.instance.getEditor('itemAdminId').option('value');
    e.data.qty1 = 0;
    e.data.lossQty1 = 0;
    e.data.lossQty2 = 0;
  }

  calcTotalAmount(rowData): number {
    const node = this.mainGrid1.instance.getNodeByKey(rowData.uid);
    let calcValue = 1;
    if (node) {
      if (node.parent.data) {
        calcValue = node.parent.data.qty1;
      }
    }

    // const rowIdx = this.mainGrid1.instance.getRowIndexByKey(rowData.uid);
    // this.mainGrid1.instance.cellValue(rowIdx, 'totalAmount', rowData.qty1 * calcValue);
    return rowData.qty1 * calcValue;
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
      // Insert일 경우 UID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT,
          // totalAmount: this.getParentQty(changes[rowIndex].key)
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key
            }, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
              itemAdminId: changes[rowIndex].itemAdminId,
              itemId: changes[rowIndex].itemId,
              subItemId: changes[rowIndex].subItemId,
              unit: changes[rowIndex].unit,
              qty1: changes[rowIndex].qty1,
              lossQty1: changes[rowIndex].lossQty1,
              lossQty2: changes[rowIndex].lossQty2,
              // totalAmount: this.getParentQty(changes[rowIndex].key)
            }, changes[rowIndex].data
          )
        );
      }


    }
    return gridList;
  }

  addClick(): void {
    const parentId = this.mainGrid1.focusedRowKey ? this.mainGrid1.focusedRowKey : 0;
    this.mainGrid1.instance.addRow(parentId).then(r => {
    });
  }

  async deleteClick(e): Promise<void> {

    if (this.mainGrid1.focusedRowIndex > -1) {
      this.mainGrid1.instance.deleteRow(this.mainGrid1.focusedRowIndex);
      this.entityStore1.push([{type: 'remove', key: this.mainGrid1.focusedRowKey}]);
    }
  }

  setItemAdminValue(rowData: any, value: any): void {
    rowData.itemAdminId = value;
    rowData.itemId = null;
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.subItemId = value;
    rowData.unit = value;
  }

  getFilteredItemId(options): any {
    return {
      store: this.dsItemId,
      filter: options.data ? ['itemAdminId', '=', options.data.itemAdminId] : null
    };
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

}

