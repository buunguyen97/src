import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {PhyInstructSaveVO, PhyinstructService, PhyInstructVO} from './phyinstruct.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {DxTreeViewComponent} from 'devextreme-angular/ui/tree-view';

@Component({
  selector: 'app-phyinstruct',
  templateUrl: './phyinstruct.component.html',
  styleUrls: ['./phyinstruct.component.scss']
})
export class PhyinstructComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('resultForm', {static: false}) resultForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('itemTree', {static: false}) itemTree: DxTreeViewComponent;
  @ViewChild('locTree', {static: false}) locTree: DxTreeViewComponent;
  @ViewChild('fromActualdate', {static: false}) fromActualdate: DxDateBoxComponent;
  @ViewChild('toActualdate', {static: false}) toActualdate: DxDateBoxComponent;

  // Global
  G_TENANT: any;

  // Grid State
  GRID_STATE_KEY = 'inv_phyinstruct1';

  mainFormData: PhyInstructVO = {} as PhyInstructVO;
  resultFormData: PhyInstructVO = {} as PhyInstructVO;

  dataSource: DataSource;
  entityStore: ArrayStore;
  changes = [];
  key = 'logicalKey';

  dsWarehouse = []; // 창고
  dsCompany = []; // 화주
  dsItemAdmin = []; // 품목관리사
  dsItemGrid = []; // 품목(그리드)
  dsDamageFlg = [];
  dsFilteredItemId = [];
  dsYN = []; // 지시수량표기여부
  dsLocation = []; // 로케이션
  dsPhyInstructStatus = []; // 재고조사지시상태
  dsUser = [];
  dsOwner = [];

  dsItemCategory1Id = [];
  dsItemCategory2Id = [];
  dsItemCategory3Id = [];

  dsSearchItemCategory2Id = [];
  dsSearchItemCategory3Id = [];

  itemValueList = [];
  locValueList = [];

  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              private service: PhyinstructService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.executePhyInsctruct = this.executePhyInsctruct.bind(this);
    this.onSearchCategory1Changed = this.onSearchCategory1Changed.bind(this);
    this.onSearchCategory2Changed = this.onSearchCategory2Changed.bind(this);
  }

  ngOnInit(): void {

    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.dataSource = new DataSource({
      store: this.entityStore
    });

    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });

    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 지시수량표기여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, this.utilService.getCommonWarehouseId()).subscribe(result => {
      this.dsLocation = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 품목(그리드)
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemGrid = result.data;
      this.dsFilteredItemId = this.dsItemGrid.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());

    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'PHYINSTRUCTSTATUS').subscribe(result => {
      this.dsPhyInstructStatus = result.data;
    });

    this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => {
      this.dsItemCategory1Id = result.data;
    });
    this.codeService.getItemCategory2(this.G_TENANT).subscribe(result => {
      this.dsItemCategory2Id = result.data;
    });
    this.codeService.getItemCategory3(this.G_TENANT).subscribe(result => {
      this.dsItemCategory3Id = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initForm();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.fromActualdate.value = '';
    this.toActualdate.value = '';
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('visibleInstQty').option('value', 'N');
    // this.mainForm.instance.getEditor('logisticsId').option('value', this.utilService.getCommonWarehouseVO().logisticsId);
    this.mainFormData.logisticsId = this.utilService.getCommonWarehouseVO().logisticsId;
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {

    this.resultForm.instance.resetValues();
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      this.mainFormData.itemList = this.itemValueList;
      this.mainFormData.locList = this.locValueList;

      this.mainFormData.fromActualdate = document.getElementsByName('fromActualdate').item(1).getAttribute('value');
      this.mainFormData.toActualdate = document.getElementsByName('toActualdate').item(1).getAttribute('value');

      console.log(this.mainFormData);

      const result = await this.service.get(this.mainFormData);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async executePhyInsctruct(): Promise<void> {
    // const items = this.mainGrid.instance.getDataSource().items();
    const items = this.mainGrid.instance.getSelectedRowsData();

    if (items.length === 0) {
      const errorMsg = this.utilService.convert1('재고리스트를 선택하세요.', '재고리스트를 선택하세요.');
      this.utilService.notify_error(errorMsg);
      return;
    }

    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('/inv/phyinstruct'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }
    this.mainFormData.itemList = this.itemValueList;
    const saveData = {phyInstructVO: this.mainFormData, phyInstructVOList: items} as PhyInstructSaveVO;

    const result = await this.service.executePhyInstruct(saveData);
    if (!result.success) {
      this.utilService.notify_error(result.msg);
      return;
    } else {
      await this.mainGrid.instance.deselectAll();
      this.resultFormData = result.data;
      this.utilService.notify_success('save success');
    }
  }

  updateSelection(treeView, tree): void {
    if (!treeView) {
      return;
    }

    treeView.unselectAll();

    if (tree === this.itemTree && this.itemValueList) {
      this.itemValueList.forEach(((value) => {
        treeView.selectItem(value);
      }));
    }

    if (tree === this.locTree && this.locValueList) {
      this.locValueList.forEach(((value) => {
        treeView.selectItem(value);
      }));
    }
  }

  onDropDownBoxValueChanged(e, tree): void {
    if (tree === this.itemTree) {
      this.updateSelection(this.itemTree && this.itemTree.instance, tree);
    }

    if (tree === this.locTree) {
      this.updateSelection(this.locTree && this.locTree.instance, tree);
    }
  }

  onTreeViewReady(e): void {
    this.updateSelection(e.component, null);
  }

  onTreeViewSelectionChanged(e, tree): void {
    if (tree === this.itemTree) {
      this.itemValueList = e.component.getSelectedNodeKeys();
    }

    if (tree === this.locTree) {
      this.locValueList = e.component.getSelectedNodeKeys();
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  onSearchCategory1Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory2Id').option('value', null);
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);

    this.dsSearchItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.value);
  }

  onSearchCategory2Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);
    this.dsSearchItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.value);
  }

}
