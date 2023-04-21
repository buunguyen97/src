import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {ItemService} from './item.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../../rcv/rcvCommonUtils';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('grid1', {static: false}) grid1: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  // Global
  G_TENANT: any;    // 테넌트
  // G_ITEMADMIN: any; // 품목관리사

  // SearchPanel
  mainFormData = {};

  // Grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  selectedRows: number[];
  key = 'uid';

  // Popup Data
  popupVisible = false;
  popupMode = 'Add';
  popupData = {} as any;

  // dataSet
  dsActFlg = [];     // 사용여부
  dsItemType = [];   // 품목유형
  dsInvType = []; // 재고단위
  dsSetItemFlg = []; // 세트상품여부
  dsQtyLv = []; // 재고단위
  dsUnitStyle = []; // 단위123유형
  dsItemAdmin = []; // 품목관리사
  dsUser = [];
  dsItemCategory1Id = [];
  dsItemCategory2Id = [];
  dsItemCategory3Id = [];

  dsSearchItemCategory2Id = [];
  dsSearchItemCategory3Id = [];
  dsPopupItemCategory2Id = [];
  dsPopupItemCategory3Id = [];

  categoryChangeFlg = true;

  GRID_STATE_KEY = 'mm_item';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private service: ItemService) {
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.onSearchCategory1Changed = this.onSearchCategory1Changed.bind(this);
    this.onSearchCategory2Changed = this.onSearchCategory2Changed.bind(this);
    this.onPopupCategory1Changed = this.onPopupCategory1Changed.bind(this);
    this.onPopupCategory2Changed = this.onPopupCategory2Changed.bind(this);
    this.onQtyLvCdChanged = this.onQtyLvCdChanged.bind(this);
    this.popupShowing = this.popupShowing.bind(this);

    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.dataSource = new DataSource({
      store: this.entityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.initCode();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.grid1);
    this.initForm();
  }

  initCode(): void {
    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 품목유형
    this.codeService.getCode(this.G_TENANT, 'ITEMTYPE').subscribe(result => {
      this.dsItemType = result.data;
    });

    // 재고단위
    this.codeService.getCode(this.G_TENANT, 'INVTYPE').subscribe(result => {
      this.dsInvType = result.data;
    });

    // 세트상품여부
    this.codeService.getCode(this.G_TENANT, 'SETITEMFLG').subscribe(result => {
      this.dsSetItemFlg = result.data;
    });

    // 재고단위
    this.codeService.getCode(this.G_TENANT, 'QTYLV').subscribe(result => {
      this.dsQtyLv = result.data;
    });

    // 단위123유형
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnitStyle = result.data;
    });

    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
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

  // 이벤트 메소드
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const ITEMADMINID = 'itemAdminId';
      this.mainFormData[ITEMADMINID] = this.utilService.getCommonItemAdminId();

      const result = await this.service.get(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.grid1.instance.cancelEditData();
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
        this.grid1.focusedRowKey = null;
        this.grid1.paging.pageIndex = 0;
      }
    } else {
      alert('not allowed');
    }
  }

  async newClick(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
    // this.showPopup('Add', null);
  }

  onToolbarPreparing(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));
    const searchPanelTemp = toolbarItems.find(item => item.name === 'searchPanel');
    searchPanelTemp.location = 'after';

    newToolbarItems.push(searchPanelTemp);
    e.toolbarOptions.items = newToolbarItems;
  }

  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);
  }

  setFocusRow(index): void {
    this.grid1.focusedRowIndex = index;
  }

  rowDblClick(e): void {

    this.categoryChangeFlg = false;
    this.dsPopupItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.data.itemCategory1Id);
    this.dsPopupItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.data.itemCategory2Id);

    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  showPopup(popupMode, data): void {
    data.itemSetFlg = (data.itemSetFlg || {}).toString();
    this.popupData = {tenant: this.G_TENANT, ...data};
    this.popupMode = popupMode;
    this.popupVisible = true;
  }

  popupShowing(e): void {
    if (this.popupMode === 'Add') {
      this.changeQtyLvCd('1');
    } else {
      this.changeQtyLvCd(this.popupData.qtyLvcd);
    }
  }

  popupShown(e): void {
    if (this.popupMode === 'Add') {

      this.popupForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
      this.popupForm.instance.getEditor('item').option('disabled', false);  // ID

      this.popupForm.instance.getEditor('actFlg').option('value', 'Y');

      this.popupForm.instance.getEditor('invType').option('value', 'INV');
      this.popupForm.instance.getEditor('itemSetFlg').option('value', 'N');
      this.popupForm.instance.getEditor('qtyLvcd').option('value', '1');

      this.popupData.isSerial = RcvCommonUtils.FLAG_FALSE; // 시리얼여부

      this.initUnit1();
      this.initUnit2();
      this.popupData.unit3 = 1;
      this.popupData.unit3Stylecd = 'PC'; // 단위 유형3 - PC
      this.popupData.length3 = 0;
      this.popupData.width3 = 0;
      this.popupData.height3 = 0;
      this.popupData.grossWeight3 = 0;
      this.popupData.netWeight3 = 0;
      this.popupData.cube3 = 0;
      this.popupData.liter3 = 0;

      this.popupData.p_Qty = 0;
      this.popupData.p_Height = 0;
      this.popupData.p_Odd = 99999;

      // this.popupForm.instance.getEditor('p_Qty').option('value', 0);
      // this.popupForm.instance.getEditor('p_Height').option('value', 0);
      // this.popupForm.instance.getEditor('p_Odd').option('value', 99999);
      this.popupForm.instance.getEditor('item').focus();
      // this.popupForm.instance.getEditor('itemAdminId').option('disabled', false);
    } else if (this.popupMode === 'Edit') {


      // this.popupForm.instance.getEditor('itemAdminId').option('disabled', true);
      this.popupForm.instance.getEditor('item').option('disabled', true);
      this.popupForm.instance.getEditor('name').focus();
    }

    this.categoryChangeFlg = true;
  }


  async popupSaveClick(e): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;
        if (this.popupMode === 'Add') {
          result = await this.service.save(this.popupData);
        } else {
          result = await this.service.update(this.popupData);
        }

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');

          this.popupVisible = false;
          this.onSearch();
          this.popupForm.instance.resetValues();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  popupCancelClick(e): void {
    // this.popupForm.instance.resetValues();
    this.popupVisible = false;
    this.onSearch(); // 재조회
  }

  popupHidden(e): void {
    // this.popupData.qtyLvcd = null;
  }

  async popupDeleteClick(e): Promise<void> {
    try {
      const result = await this.service.delete(this.popupData);
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

  onSearchCategory1Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory2Id').option('value', null);
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);

    this.dsSearchItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.value);
  }

  onSearchCategory2Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);
    this.dsSearchItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.value);
  }

  onPopupCategory1Changed(e): void {
    if (!this.categoryChangeFlg) {
      return;
    }
    this.popupForm.instance.getEditor('itemCategory2Id').option('value', null);
    this.popupForm.instance.getEditor('itemCategory3Id').option('value', null);

    this.dsPopupItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.value);
  }

  onPopupCategory2Changed(e): void {
    if (!this.categoryChangeFlg) {
      return;
    }
    this.popupForm.instance.getEditor('itemCategory3Id').option('value', null);
    this.dsPopupItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.value);
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    this.mainForm.instance.getEditor('actFlg').option('value', 'Y');
    this.mainForm.instance.focus();
  }

  onQtyLvCdChanged(e): void {
    this.changeQtyLvCd(e.value);
  }

  changeQtyLvCd(selectedValue: string): void {

    const styleStr = ' visibility: hidden; height: 0px; padding: 0px; margin: 0px;';
    // 단위1 그룹
    const unit1a = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > div:nth-child(2)');
    const unit1b = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > div:nth-child(3)');
    const unit1c = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > div:nth-child(4)');

    // 단위2 그룹
    const unit2a = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > div:nth-child(5)');
    const unit2b = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > div:nth-child(6)');
    const unit2c = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div:nth-child(2) > div > div > div > div > div > div > div > div > div:nth-child(7)');

    this.removeStyle(unit1a, styleStr);
    this.removeStyle(unit1b, styleStr);
    this.removeStyle(unit1c, styleStr);

    this.removeStyle(unit2a, styleStr);
    this.removeStyle(unit2b, styleStr);
    this.removeStyle(unit2c, styleStr);

    if (selectedValue === '1' || !selectedValue) {  // 낱개
      // 1, 2 초기화
      this.initUnit1();
      this.initUnit2();

      // 1, 2 숨김
      this.setStyle(unit1a, styleStr);
      this.setStyle(unit1b, styleStr);
      this.setStyle(unit1c, styleStr);

      this.setStyle(unit2a, styleStr);
      this.setStyle(unit2b, styleStr);
      this.setStyle(unit2c, styleStr);

    } else if (selectedValue === '2') { // 케이스 + 낱개
      // 1 초기화
      this.initUnit1();

      // 1 숨김
      this.setStyle(unit1a, styleStr);
      this.setStyle(unit1b, styleStr);
      this.setStyle(unit1c, styleStr);

      // 2 보임
      // this.removeStyle(unit2a, styleStr);
      // this.removeStyle(unit2b, styleStr);
      // this.removeStyle(unit2c, styleStr);

    } else if (selectedValue === '3') { // 케이스 + 볼 + 낱개
      // 1, 2 보임
      // this.removeStyle(unit1a, styleStr);
      // this.removeStyle(unit1b, styleStr);
      // this.removeStyle(unit1c, styleStr);
      //
      // this.removeStyle(unit2a, styleStr);
      // this.removeStyle(unit2b, styleStr);
      // this.removeStyle(unit2c, styleStr);
    }
  }

  setStyle(tag, styleStr): void {
    try {
      const str = tag.getAttribute('style');
      if (!str.includes(styleStr)) {
        tag.setAttribute('style', tag.getAttribute('style') + styleStr);
      }
    } catch {
    }

  }

  removeStyle(tag, styleStr): void {
    try {
      const s = tag.getAttribute('style');
      tag.setAttribute('style', s.replace(new RegExp(styleStr, 'g'), ''));
    } catch {
    }
  }

  initUnit1(): void {
    this.popupData.unit1 = 1;
    this.popupData.unit1Stylecd = 'PC'; // 단위 유형1 - PC
    this.popupData.length1 = 0;
    this.popupData.width1 = 0;
    this.popupData.height1 = 0;
    this.popupData.grossWeight1 = 0;
    this.popupData.netWeight1 = 0;
    this.popupData.cube1 = 0;
    this.popupData.liter1 = 0;
  }

  initUnit2(): void {
    this.popupData.unit2 = 1;
    this.popupData.unit2Stylecd = 'PC'; // 단위 유형2 - PC
    this.popupData.length2 = 0;
    this.popupData.width2 = 0;
    this.popupData.height2 = 0;
    this.popupData.grossWeight2 = 0;
    this.popupData.netWeight2 = 0;
    this.popupData.cube2 = 0;
    this.popupData.liter2 = 0;
  }
}
