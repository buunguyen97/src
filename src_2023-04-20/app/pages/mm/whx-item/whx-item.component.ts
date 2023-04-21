import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {WhxItemService, WhxItemVO} from './whx-item.service';

@Component({
  selector: 'app-whx-item',
  templateUrl: './whx-item.component.html',
  styleUrls: ['./whx-item.component.scss']
})
export class WhxItemComponent implements OnInit, AfterViewInit {


  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  mainFormData: WhxItemVO = {} as WhxItemVO;

  // Global
  G_TENANT: any;
  changes = [];
  dsUser = [];

// ***** main ***** //
  GRID_STATE_KEY = 'mm_whxitem';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');

  // Form
  dsWarehouseId = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsLocId = [];
  dsOwnerId = [];
  dsItemAdminId = [];
  dsItem = [];
  dsItemId = [];
  locIdStorage = [];

  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';
  dsActFlg = [];
  dsInstructQty = [];

  constructor(
    public utilService: CommonUtilService,
    private service: WhxItemService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initCode(): void {
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });

    // 로케이션코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwnerId = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
      this.dsFilteredItemId = this.dsItemId.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    // this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);
      if (this.resultMsgCallback(result, 'Search')) {
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });

        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      } else {
        return;
      }
    }
  }

  async onSave(): Promise<void> {
    // const columns = ['warehouse', 'owner', 'itemAdmin', 'item'];
    const tempData = this.collectGridData(this.changes);

    console.log(tempData);
    if (tempData.length > 0) {
      for (const item of tempData) {
        // if (!item.key && !item.uid) {
        //   for (const col of columns) {
        //     if ((item[col] === undefined) || (item[col] === '')) {
        //       this.utilService.notify_error(this.utilService.convert('An empty value exists'));
        //       return;
        //     }
        //   }
        // }
        //
        // this.mainGrid.instance.byKey(item.key).then(
        //   (dataItem) => {
        //     for (const col of columns) {
        //       if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
        //         this.utilService.notify_error(this.utilService.convert('An empty value exists'));
        //         return;
        //       }
        //     }
        //   }
        // );
        //
        // if (item.minQty <= 0) {
        //   // '수량을 1개 이상 입력하세요.'
        //   const msg = this.utilService.convert1('whxitem_minqty', '안전재고수량을 1개 이상 입력하세요.');
        //   this.utilService.notify_error(msg);
        //   return;
        // }
      }
    } else {
      const msg = this.utilService.convert1('whxitem_minqty', '안전재고수량을 1개 이상 입력하세요.');
      this.utilService.notify_error(msg);
      return;
    }

    this.mainGrid.instance.saveEditData();
    // const saveData = changeData;
    const result = await this.service.save(tempData);
    // const result = await this.service.save(this.mainGrid.instance.getSelectedRowsData());

    if (result.success) {
      this.utilService.notify_success('save success');
    } else {
      this.utilService.notify_success('save failed');
    }
    this.onSearch();

  }

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

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.mainForm.instance.focus();
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  async onSync(): Promise<void> {
    const tempData = {
      tenant: this.G_TENANT,
      warehouseId: this.utilService.getCommonWarehouseId(),
      ownerId: this.utilService.getCommonOwnerId(),
      itemAdminId: this.utilService.getCommonItemAdminId()
    };


    const result = await this.service.sync(tempData);

    if (result.success) {
      this.utilService.notify_success('save success');

      this.onSearch();
    } else {
      this.utilService.notify_error('save failed');
    }
  }
}
