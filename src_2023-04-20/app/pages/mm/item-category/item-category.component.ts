import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {ItemCategoryService, ItemCategoryVO} from './item-category.service';

@Component({
  selector: 'app-item-category',
  templateUrl: './item-category.component.html',
  styleUrls: ['./item-category.component.scss']
})
export class ItemCategoryComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('grid1', {static: false}) grid1: DxDataGridComponent;
  @ViewChild('grid2', {static: false}) grid2: DxDataGridComponent;
  @ViewChild('grid3', {static: false}) grid3: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;

  mainFormData: ItemCategoryVO = {} as ItemCategoryVO;

  // grid
  dataSource1: DataSource;
  dataSource2: DataSource;
  dataSource3: DataSource;
  subDataSource: DataSource;

  entityStore1: ArrayStore;
  entityStore2: ArrayStore;
  entityStore3: ArrayStore;
  subEntityStore: ArrayStore;

  key = 'uid';
  changes1 = [];
  changes2 = [];
  changes3 = [];
  dsUser = []; // 사용자

  GRID_STATE_KEY = 'mm_itemCategory1';
  saveStateGrid1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_grid1');
  loadStateGrid1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_grid1');
  saveStateGrid2 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_grid2');
  loadStateGrid2 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_grid2');
  saveStateGrid3 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_grid3');
  loadStateGrid3 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_grid3');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  constructor(public utilService: CommonUtilService,
              private service: ItemCategoryService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.initGrid();

    this.entityStore1 = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.dataSource1 = new DataSource({
      store: this.entityStore1
    });

  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기

    this.mainForm.instance.focus();
    this.utilService.getGridHeight(this.subGrid, 27);
    // this.utilService.getGridHeight(this.grid2);
    // this.utilService.getGridHeight(this.grid3);
  }

  async onSearch(): Promise<void> {
    this.initGrid();

    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.getCategory1(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.grid1.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStore1 = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource1 = new DataSource({
          store: this.entityStore1
        });

        const resultAll = await this.service.getCategoryAll(this.mainFormData);

        if (!resultAll.success) {
          this.utilService.notify_error(resultAll.msg);
          return;
        } else {
          this.utilService.notify_success('search success');

          this.subEntityStore = new ArrayStore(
            {
              data: resultAll.data,
              key: this.key
            }
          );
          this.subDataSource = new DataSource({
            store: this.subEntityStore
          });

          this.grid1.focusedRowKey = null;
          this.grid1.paging.pageIndex = 0;
        }
      }
    }
  }

  async onSearch2(itemCategory1Id: number): Promise<void> {
    this.dataSource2 = this.initGridWithEntityStore(this.entityStore2);
    this.dataSource3 = this.initGridWithEntityStore(this.entityStore3);

    this.changes2 = [];
    this.changes3 = [];

    // const data = this.mainForm.instance.validate();

    if (typeof itemCategory1Id === 'number') {
      this.mainFormData.tenant = this.G_TENANT;
      this.mainFormData.itemCategory1Id = itemCategory1Id;
      const result = await this.service.getCategory2(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.grid2.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStore2 = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource2 = new DataSource({
          store: this.entityStore2
        });

        this.grid2.focusedRowKey = null;
        this.grid2.paging.pageIndex = 0;
      }
    }
  }

  async onSearch3(itemCategory2Id: number): Promise<void> {
    this.dataSource3 = this.initGridWithEntityStore(this.entityStore3);
    this.changes3 = [];

    // const data = this.mainForm.instance.validate();
    if (typeof itemCategory2Id === 'number') {
      this.mainFormData.tenant = this.G_TENANT;
      this.mainFormData.itemCategory2Id = itemCategory2Id;
      const result = await this.service.getCategory3(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.grid3.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStore3 = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource3 = new DataSource({
          store: this.entityStore3
        });

        this.grid3.focusedRowKey = null;
        this.grid3.paging.pageIndex = 0;
      }
    }
  }

  onFocusedRowChanging(e, grid): void {
    if (!e.row) {
      return;
    }
    if (grid === this.grid1) {
      this.onSearch2(e.row.data.uid);

    } else if (grid === this.grid2) {
      this.onSearch3(e.row.data.uid);
    }
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(grid, e.rowIndex);
  }

  onToolbarPreparingWithComBtn(e, grid): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));         // first

    // second
    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'add',
        onClick: this.setAddClick(grid)
      }
    });

    // third
    newToolbarItems.push({
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'minus',
        onClick: this.setDeleteClick(grid)
      }
    });

    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));        // 4th
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton')); // 5th

    e.toolbarOptions.items = newToolbarItems;
  }

  setAddClick(grid): any {
    if (grid === this.grid1) {
      return () => {
        this.grid1.instance.addRow().then(() => {
          const rowIdx = this.grid1.instance.getRowIndexByKey(this.changes1[this.changes1.length - 1].key);
          this.setFocusRow(this.grid1, rowIdx);
          this.dataSource2 = this.initGridWithEntityStore(this.entityStore2);
          this.dataSource3 = this.initGridWithEntityStore(this.entityStore3);

          this.changes2 = [];
          this.changes3 = [];
        });
      };
    } else if (grid === this.grid2) {
      return () => {
        this.grid2.instance.addRow().then(() => {
          const rowIdx = this.grid2.instance.getRowIndexByKey(this.changes2[this.changes2.length - 1].key);
          this.setFocusRow(this.grid2, rowIdx);
          this.dataSource3 = this.initGridWithEntityStore(this.entityStore3);

          this.changes3 = [];
        });
      };
    } else {
      return () => {
        this.grid3.instance.addRow().then(() => {
          const rowIdx = this.grid3.instance.getRowIndexByKey(this.changes3[this.changes3.length - 1].key);
          this.setFocusRow(this.grid3, rowIdx);
        });
      };
    }
  }

  setDeleteClick(grid): any {
    if (grid === this.grid1) {
      return () => {
        if (this.grid1.focusedRowIndex > -1) {
          this.grid1.instance.deleteRow(this.grid1.focusedRowIndex);
          this.entityStore1.push([{type: 'remove', key: this.grid1.focusedRowKey}]);

          this.dataSource2 = this.initGridWithEntityStore(this.entityStore2);
          this.dataSource3 = this.initGridWithEntityStore(this.entityStore3);

          this.changes2 = [];
          this.changes3 = [];

          // 포커스 이동
          const focusedIdx = this.grid1.focusedRowIndex;
          this.grid1.focusedRowIndex = focusedIdx - 1;
        }
      };
    } else if (grid === this.grid2) {
      return () => {
        if (this.grid2.focusedRowIndex > -1) {
          this.grid2.instance.deleteRow(this.grid2.focusedRowIndex);
          this.entityStore2.push([{type: 'remove', key: this.grid2.focusedRowKey}]);

          this.dataSource3 = this.initGridWithEntityStore(this.entityStore3);
          this.changes3 = [];

          // 포커스 이동
          const focusedIdx = this.grid2.focusedRowIndex;
          this.grid2.focusedRowIndex = focusedIdx - 1;
        }
      };
    } else {
      return () => {
        if (this.grid3.focusedRowIndex > -1) {
          this.grid3.instance.deleteRow(this.grid3.focusedRowIndex);
          this.entityStore3.push([{type: 'remove', key: this.grid3.focusedRowKey}]);

          // 포커스 이동
          const focusedIdx = this.grid3.focusedRowIndex;
          this.grid3.focusedRowIndex = focusedIdx - 1;
        }
      };
    }
  }

  setFocusRow(grid, index): void {
    grid.focusedRowIndex = index;
  }


  initGrid(): void {
    this.dataSource1 = this.initGridWithEntityStore(this.entityStore1);
    this.dataSource2 = this.initGridWithEntityStore(this.entityStore2);
    this.dataSource3 = this.initGridWithEntityStore(this.entityStore3);
    this.subDataSource = this.initGridWithEntityStore(this.subEntityStore);

    this.changes1 = [];
    this.changes2 = [];
    this.changes3 = [];
  }

  initGridWithEntityStore(entityStore: any): any {
    entityStore = new ArrayStore({data: [], key: this.key});
    return new DataSource({store: entityStore});
  }

  async onSave(): Promise<void> {
    const messages = {name: 'itemCategory.name'};
    const columns = ['display'];    // required 컬럼 dataField 정의

    const grid1Idx = this.grid1.focusedRowIndex;
    const grid2Idx = this.grid2.focusedRowIndex;

    this.grid1.instance.cellValue(grid1Idx, 'category2List', null);
    this.grid2.instance.cellValue(grid2Idx, 'category3List', null);
    if (this.changes2.length > 0) {
      this.changes2.forEach(e => {
        if (e.data) {
          e.data.name = e.data.display;
        }
      });
      const grid2Data = this.collectGridData(this.changes2);
      this.grid1.instance.cellValue(grid1Idx, 'category2List', grid2Data);
    }

    if (this.changes3.length > 0) {
      this.changes3.forEach(e => {
        if (e.data) {
          e.data.name = e.data.display;
        }
      });
      const grid3Data = this.collectGridData(this.changes3);
      this.grid2.instance.cellValue(grid2Idx, 'category3List', grid3Data);

      const grid2Data = this.collectGridData(this.changes2);
      this.grid1.instance.cellValue(grid1Idx, 'category2List', grid2Data);
    }

    const tempData = this.collectGridData(this.changes1);
    const tempData2 = this.collectGridData(this.changes2);
    const tempData3 = this.collectGridData(this.changes3);

    for (const item of tempData) {
      if (!item.key && !item.uid) {

        for (const col of columns) {

          if ((item[col] === undefined) || (item[col] === '')) {

            const msg = this.utilService.convert(messages[col]);
            this.utilService.notify_error(this.utilService.convert('com_valid_required', msg));
            return;
          }
        }
      }

      this.grid1.instance.byKey(item.key).then(
        (dataItem) => {
          for (const col of columns) {
            if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
              const msg = this.utilService.convert(messages[col]);
              this.utilService.notify_error(this.utilService.convert('com_valid_required', msg));
              return;
            }
          }
        }
      );
    }

    for (const item of tempData2) {

      if (!item.key && !item.uid) {
        for (const col of columns) {
          if ((item[col] === undefined) || (item[col] === '')) {
            const msg = this.utilService.convert(messages[col]);
            this.utilService.notify_error(this.utilService.convert('com_valid_required', msg));
            return;
          }
        }
      }

      this.grid2.instance.byKey(item.key).then(
        (dataItem) => {
          for (const col of columns) {
            if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
              const msg = this.utilService.convert(messages[col]);
              this.utilService.notify_error(this.utilService.convert('com_valid_required', msg));
              return;
            }
          }
        }
      );
    }

    for (const item of tempData3) {
      if (!item.key && !item.uid) {
        for (const col of columns) {
          if ((item[col] === undefined) || (item[col] === '')) {
            const msg = this.utilService.convert(messages[col]);
            this.utilService.notify_error(this.utilService.convert('com_valid_required', msg));
            return;
          }
        }
      }

      this.grid3.instance.byKey(item.key).then(
        (dataItem) => {
          for (const col of columns) {
            if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
              const msg = this.utilService.convert(messages[col]);
              this.utilService.notify_error(this.utilService.convert('com_valid_required', msg));
              return;
            }
          }
        }
      );
    }

    await this.grid1.instance.saveEditData();
    await this.grid2.instance.saveEditData();
    await this.grid3.instance.saveEditData();

    tempData.forEach(e => {
      e.name = e.display;
    });

    console.log(tempData);

    const result = await this.service.saveCategory(tempData);
    if (result.success) {
      this.utilService.notify_success('save success');
      await this.onSearch();
    } else {
      this.utilService.notify_error('save failed');
    }
  }

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
}
