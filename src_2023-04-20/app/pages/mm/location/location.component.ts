import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {LocationService, LocationVO} from './location.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RcvCommonUtils} from '../../rcv/rcvCommonUtils';

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainKey = 'uid';
  // ***** main ***** //

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: LocationVO;
  // ***** popup ***** //

  // DataSet

  // DataSets
  dsWarehouse = [];
  dsCompany = [];
  dsYN = [];
  dsLocGroup = [];
  dsLocType = [];
  dsVirtualFlg = [];
  dsRestrictedAlloc = [];
  dsItemAdmin = [];
  dsItem = [];
  dsSlotType = [];
  dsPickType = [];
  dsUser = [];

  GRID_STATE_KEY = 'mm_location';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService,
              private service: LocationService
  ) {
    this.onValueChangedItemAdminId = this.onValueChangedItemAdminId.bind(this);
    this.onChangedOneOwnerOnlyFlg = this.onChangedOneOwnerOnlyFlg.bind(this);
    this.onChangedOneOnlyItemFlg = this.onChangedOneOnlyItemFlg.bind(this);
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
    this.inputDataSource([], 'main');
  }

  ngAfterViewInit(): void {
    // this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initForm(): void {
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('actFlg').option('value', 'Y');
    this.mainForm.instance.focus();
  }

  initCode(): void {
    // 창고(로그인 사용자가 선택가능한 창고 목록)
    // this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouse = result.data;
    });
    // 회사
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });
    // 사용여부, Virtual Flag, Restricted Flag, sameLotFlg, oneOwnerOnlyFlg, itemOnlyFlg
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });
    // 로케이션그룹-Location Group
    this.codeService.getCode(this.G_TENANT, 'LOCGROUP').subscribe(result => {
      this.dsLocGroup = result.data;
    });
    // 로케이션타입-Location Type
    this.codeService.getCode(this.G_TENANT, 'LOCTYPE').subscribe(result => {
      this.dsLocType = result.data;
    });
    // 적치형태-SlotType
    this.codeService.getCode(this.G_TENANT, 'SLOTTYPE').subscribe(result => {
      this.dsSlotType = result.data;
    });
    // 피킹형태-PickType
    this.codeService.getCode(this.G_TENANT, 'PICKTYPE').subscribe(result => {
      this.dsPickType = result.data;
    });
    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });
    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItem = result.data;
    });
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  inputDataSource(inputData, inputType): void {
    this[inputType + 'EntityStore'] = new ArrayStore({
        data: inputData,
        key: this[inputType + 'Key']
      }
    );

    this[inputType + 'DataSource'] = new DataSource({
      store: this[inputType + 'EntityStore']
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        await this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // disabledValue(): boolean {
  //   return this.popup.visible === true && this.popupMode === 'Edit';
  // }

  // 팝업 열기
  async onPopupOpen(e): Promise<void> {

    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      await this.onPopupSearch(e.data);
    }
    this.popup.visible = true;
  }

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData =
      Object.assign({
        tenant: this.G_TENANT,
        location: '',
        name: '',
        weightCapacity: 99999999,
        capacity: 99999999,
        palleteCapacity: 99999999
      });
  }

  onPopupAfterOpen(): void {
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
      this.popupForm.instance.getEditor('actFlg').option('value', 'Y');
      this.popupForm.instance.getEditor('virtualFlg').option('value', 'N');
      this.popupForm.instance.getEditor('restrictedAlloc').option('value', 'N');
      this.popupForm.instance.getEditor('slotType').option('value', 'PIECE');
      this.popupForm.instance.getEditor('pickType').option('value', 'PIECE');
      this.popupForm.instance.getEditor('sameLotFlg').option('value', 'N');
      this.popupForm.instance.getEditor('oneOwnerOnlyFlg').option('value', 'N');
      this.popupForm.instance.getEditor('oneItemOnlyFlg').option('value', 'N');
      this.popupForm.instance.getEditor('damageFlg').option('value', 'N');

    }
    this.changedOneOwnerOnlyFlg(this.popupFormData.oneOwnerOnlyFlg);
    this.changedOneOnlyItemFlg(this.popupFormData.oneItemOnlyFlg);
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.onSearch().then(() => this.popupForm.instance.resetValues());
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
    } else {
      return;
    }
  }

  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;
        if (this.popupMode === 'Add') {
          result = await this.service.save(this.popupFormData);
        } else {
          result = await this.service.update(this.popupFormData);
        }
        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.onPopupClose();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  async onPopupDelete(): Promise<void> {

    try {
      const result = await this.service.delete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
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

  onValueChangedItemAdminId(e): void {
    this.popupFormData.itemId = null;
    if (!e.value) {
      this.dsItem = [];
      return;
    }
    const findValue = this.dsItemAdmin.filter(code => code.uid === e.value);

    this.codeService.getItemWithItemAdminId(this.G_TENANT, findValue[0].uid).subscribe(result => {
      this.dsItem = result.data;
    });
  }

  // 특정화주여부 선택시
  onChangedOneOwnerOnlyFlg(e): void {
    this.changedOneOwnerOnlyFlg(e.value);
  }

  changedOneOwnerOnlyFlg(flg: string): void {
    const styleStr = ' visibility: hidden;';
    const companyComp = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(10) > div > div:nth-child(3) > div');

    if (flg === RcvCommonUtils.FLAG_FALSE) {
      // 초기화
      this.popupFormData.companyId = null;
      this.setStyle(companyComp, styleStr);
    } else {
      this.removeStyle(companyComp, styleStr);
    }
  }

  // 특정품목여부 선택시
  async onChangedOneOnlyItemFlg(e): Promise<void> {
    await this.changedOneOnlyItemFlg(e.value);
  }

  changedOneOnlyItemFlg(flg: string): void {
    const styleStr = ' visibility: hidden;';
    const itemAdminComp = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(11) > div > div:nth-child(2) > div');
    const itemComp = document.querySelector('body > div > div > div.dx-popup-content > div > dx-form > div > div > div.dx-scrollable-content > div > div > div > div > div > div > div > div > div > div > div > div > div:nth-child(11) > div > div:nth-child(3) > div');

    if (flg === RcvCommonUtils.FLAG_FALSE) {
      // 초기화
      this.popupForm.instance.getEditor('itemAdminId').option('value', null);
      this.setStyle(itemAdminComp, styleStr);
      this.setStyle(itemComp, styleStr);
    } else {
      this.removeStyle(itemAdminComp, styleStr);
      this.removeStyle(itemComp, styleStr);
    }
  }

  setStyle(tag, styleStr): void {
    const str = tag.getAttribute('style');
    if (!str.includes(styleStr)) {
      tag.setAttribute('style', tag.getAttribute('style') + styleStr);
    }
  }

  removeStyle(tag, styleStr): void {
    if (!tag) {
      return;
    }
    const s = tag.getAttribute('style');
    tag.setAttribute('style', s.replace(new RegExp(styleStr, 'g'), ''));
  }

}
