import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacs060Service, Sacs060VO} from './sacs060.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Component({
  selector: 'app-sacs060',
  templateUrl: './sacs060.component.html',
  styleUrls: ['./sacs060.component.scss']
})
export class Sacs060Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  // @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  dsYn = []; // 사용여부
  dsWhCd = []; // 창고코드
  dsPtrn = []; // 파트너코드
  dsUser = []; // 유저
  dsOrdGb = []; // 주문구분
  dsCustGb = []; // 거래처구분
  // Global
  G_TENANT: any;
  sessionUserId: any;

  // Main
  mainFormData = {};
  mainCount: any;
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: Sacs060VO;
  key = ['ptrn_cd', 'sales_wh_cd'];

  changes = [];

  custGB = {
    expt: '2',
    ptrn: '3',
    impt: '4',
  };

  // Grid State
  GRID_STATE_KEY = 'sacs_sacs060';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  constructor(public utilService: CommonUtilService
            , public gridUtil: GridUtilService
            , private codeService: CommonCodeService
            , private service: Sacs060Service
            , private bizService: BizCodeService) {
    this.G_TENANT = this.utilService.getTenant();

    this.sessionUserId = this.utilService.getUserUid();
    this.onPopupSave = this.onPopupSave.bind(this);
    this.onPopupClose = this.onPopupClose.bind(this);
    this.onPopupDelete = this.onPopupDelete.bind(this);

    // this.onValueChangedCustGb = this.onValueChangedCustGb.bind(this);
    this.onValueChangedStdYn = this.onValueChangedStdYn.bind(this);

    this.onPwhChange = this.onPwhChange.bind(this);
    this.onValueChangedPtrnCd = this.onValueChangedPtrnCd.bind(this);
    this.onEditingStart = this.onEditingStart.bind(this);
    this.setCustGbValue = this.setCustGbValue.bind(this);
  }

  ngOnInit(): void {
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert('sales.sale')},
      {cd: '2', nm: this.utilService.convert('sales.rent')},
      {cd: '3', nm: this.utilService.convert('sales.ord_sample')}];

    this.dsCustGb = [{cd: '2', nm: this.utilService.convert('sales.expt_cd')}
      , {cd: '4', nm: this.utilService.convert('sales.impt_cd')}
      , {cd: '3', nm: this.utilService.convert('sales.ptrn_cd')}];

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 작업상태
    this.dsYn = [{cd: 'Y', nm: 'Y'}, {cd: 'N', nm: 'N'}];
    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsWhCd = result.data;
    });

    // // 파트너
    // this.bizService.getCust(this.G_TENANT, '', '', '', '', '', '').subscribe(result => {
    //   this.dsPtrn = result.data;
    // });

    if (this.utilService.getCompany() === 'O1000') {
      // 알포터면 모든 파트너사
      this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
        this.dsPtrn = result.data;
      });
    } else {
      const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
      this.codeService.getRelatedCompany(this.utilService.getTenant(), Number(data.companyId)).subscribe(r => {
        this.dsPtrn = r.data.map(el => {
          // @ts-ignore
          el.cd = el.company;
          return el;
        });
      });
    }
    // 사용여부
    // this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {this.dsYn = result.data;});
  }

  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getGridHeight(this.mainGrid);

    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

    // @ts-ignore
    this.mainFormData.ptrn_cd = this.utilService.getCompany();
  }

  // main stage
  // main grid search
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.list(this.mainFormData);
      console.log(result);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // main grid reset
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
  }

  // popup stage
  // popup close validation
  onPopupAfterClose(): void {
    this.changes = [];
    this.popupForm.instance.resetValues();

    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });

  }

  // popup open validation
  onPopupAfterOpen(): void {
    // this.popupForm.instance.getEditor('std_yn').option('disabled', true);
    // this.popupForm.instance.getEditor('sales_wh_cd').option('disabled', true);

    if (this.utilService.getCompany() === 'O1000') {
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', false);
    } else {
      this.popupFormData.ptrn_cd = this.utilService.getCompany();
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
    }
    if (this.popupMode === 'Add') {
    } else {
      this.popupForm.instance.getEditor('ptrn_cd').option('disabled', true);
    }

    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
  }

  // popup open
  onPopupOpen(e): void {
    this.popup.visible = true;
    // this.deleteBtn.visible = true;
    this.saveBtn.visible = true;

    if (e.element.id === 'Add') {
      // this.deleteBtn.visible = false;
      this.popupMode = 'Add';
    } else {
      this.popupMode = 'Edit';
      this.onPopupSearch({ptrn_cd: e.data.ptrn_cd}).then();
    }

    this.popupVisible = true;
  }

  // Popup Close
  onPopupClose(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

  // Save OnClick Event
  async onPopupSave(e): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) {
      return;
    }

    const detailList = this.collectGridData(this.changes);
    for (const detail of detailList) {

      let data = null;

      if (detail.operType === 'remove') {
        continue;
      } else if (detail.operType === 'update') {
        data = await this.popupGrid.instance.byKey({ptrn_cd: detail.uid.ptrn_cd, sales_wh_cd: detail.uid.sales_wh_cd});
        detail.cust_gb = detail.cust_gb || data.cust_gb;
        detail.pwh_cd = detail.pwh_cd || data.pwh_cd;
        detail.sales_wh_nm = detail.sales_wh_nm || data.sales_wh_nm;
      }


      if (!detail.cust_gb) {
        const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('sales.cust_cla', '거래처구분', 'Customer Classification'));
        this.utilService.notify_error(msg);
        return;
      }

      // if ((detail.cust_gb === '3' && !detail.pwh_cd)) {
      //   const msg = this.utilService.convert('com_valid_required', this.utilService.convert('rcv.warehouseCd'));
      //   this.utilService.notify_error(msg);
      //   return;
      // }

      if (!detail.sales_wh_nm) {
        const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.sales_wh_nm'));
        this.utilService.notify_error(msg);
        return;
      }

      // if (detail.operType === 'insert' && !detail.sales_wh_cd) {
      //   const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.sales_wh_cd'));
      //   this.utilService.notify_error(msg);
      //   return;
      // }
    }

    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));

    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    console.log(detailList);

    const result = await this.service.insert(detailList);

    if (!result.success) {
      this.utilService.notify_error(this.utilService.convert(result.msg));
      return;
    } else {
      this.utilService.notify_success('Save success');
      this.popupForm.instance.resetValues();
      this.popup.visible = false;
      this.onSearch();
    }

    // if (popData.isValid) {
    //   let result;
    //   let countSales;
    //   let countStd;
    //
    //   const saveContent = this.popupFormData as Sacs060VO;
    //
    //
    //
    //
    //   return;
    //
    //   console.log(saveContent);
    //
    //
    //   if (this.popupMode === 'Add') {// New
    //     if (this.popupFormData.cust_gb === '3') {
    //       // 표준 duplication check
    //       if (this.popupFormData.pwh_cd !== '') {
    //         countStd = await this.service.std_dup_check(JSON.stringify(saveContent));
    //         if (countStd.data[0].count > 0 && countStd.data[0].std_yn === 'Y') {
    //           this.utilService.notify_error(this.utilService.convert('중복됩니다.'));
    //           return;
    //         }
    //       }
    //     } else {
    //       countSales = await this.service.sales_dup_check(JSON.stringify(saveContent));
    //       if (countSales.data[0].count > 0) {
    //         this.utilService.notify_error(this.utilService.convert('중복됩니다.'));
    //         return;
    //       }
    //     }
    //
    //     const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
    //     result = await this.service.insert(JSON.stringify(saveContent));
    //     if (!await this.utilService.confirm(confirmMsg)) {
    //       return;
    //     }
    //
    //     this.popupFormData.createdby = this.sessionUserId;
    //     this.popupFormData.modifiedby = this.sessionUserId;
    //
    //     if (!result.success || result.count > 0) {
    //       this.utilService.notify_error(result.msg);
    //       return;
    //     } else {
    //       this.utilService.notify_success('Save success');
    //       this.popupForm.instance.resetValues();
    //       this.popup.visible = false;
    //       this.onSearch();
    //     }
    //   } else {// Edit
    //     result = await this.service.update(JSON.stringify(saveContent));
    //     if (!result.success || result.count > 0) {
    //       this.utilService.notify_error(result.msg);
    //       return;
    //     } else {
    //       this.utilService.notify_success('Save success');
    //       this.popupForm.instance.resetValues();
    //       this.popup.visible = false;
    //       this.onSearch();
    //     }
    //   }
    // }
  }

  // popup delete event
  async onPopupDelete(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormData as Sacs060VO;
      const result = await this.service.delete(deleteContent);

      if (result.success) {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popup.visible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error');
    }
  }

  // popup search
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.info(data);
    console.log(result.data);

    if (result != null) {
      // this.popupFormData = result.data;

      this.popupEntityStore = new ArrayStore(
        {
          data: result.data,
          key: this.key,
        }
      );
      this.popupDataSource = new DataSource({
        store: this.popupEntityStore
      });

      this.popupGrid.focusedRowKey = null;
      this.popupGrid.paging.pageIndex = 0;

      if (result.data.length > 0) {
        this.popupFormData.ptrn_cd = result.data[0].ptrn_cd;
      }

      this.utilService.notify_success('search success');
    } else {
      return;
    }
  }

  // / **
  //  * 거래처구분 수정시
  //  */
  // onValueChangedCustGb(e): void {
  //   console.log('==== onValueChangedCustGb ====');
  //   this.popupForm.instance.getEditor('std_yn').option('disabled', true);
  //   if (!e.event) {
  //     return;
  //   }
  //
  //   if (e.value === 2) {
  //     console.log('=== onValueChangedCustGb 2 ===');
  //     this.popupFormData.std_yn = 'N';
  //     this.popupFormData.pwh_cd = '';
  //     this.popupForm.instance.getEditor('pwh_cd').option('disabled', true);
  //     this.popupForm.instance.getEditor('std_yn').option('disabled', true);
  //     this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => {
  //       this.dsPtrn = result.data;
  //     });
  //   }
  //
  //   if (e.value === 3) {
  //     console.log('=== onValueChangedCustGb 3 ===');
  //     this.popupFormData.std_yn = 'Y';
  //     this.popupForm.instance.getEditor('pwh_cd').option('disabled', false);
  //     // this.popupForm.instance.getEditor('std_yn').option('disabled', true);
  //     this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => {
  //       this.dsPtrn = result.data;
  //     });
  //   }
  //
  //   if (e.value === 4) {
  //     console.log('=== onValueChangedCustGb 4 ===');
  //     this.popupFormData.std_yn = 'N';
  //     this.popupFormData.pwh_cd = '';
  //     this.popupForm.instance.getEditor('pwh_cd').option('disabled', true);
  //     this.popupForm.instance.getEditor('std_yn').option('disabled', true);
  //     this.bizService.getCust(this.G_TENANT, '', '', 'Y', '', '', '').subscribe(result => {
  //       this.dsPtrn = result.data;
  //     });
  //   }
  // }
  // /

  onPwhChange(e): void {
    console.log('=== onPwhChange ===');
    if (!e.event) {
      return;
    }

    if (e.value !== '') {
      this.popupForm.instance.getEditor('std_yn').option('disabled', false);
      this.popupFormData.std_yn = '';
    }
  }

  onValueChangedStdYn(e): void {
    console.log('=== onValueChangedStdYn ===');
    if (!e.event) {
      return;
    }
    if (this.popupFormData.pwh_cd === '' || this.popupFormData.pwh_cd == null) {
      this.popupFormData.std_yn = 'N';
      this.popupForm.instance.getEditor('std_yn').option('disabled', true);
    }
  }

  // 추가버튼 이벤트
  addClick(): void {
    // // 입고상태가 예정이 아닐 경우 return
    // if (this.popupData.sts !== RcvCommonUtils.STS_IDLE || this.popupData.moveId != null) {
    //   return;
    // }

    if (!this.popupFormData.ptrn_cd) {
      return;
    }

    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    // // 입고상태가 예정이 아닐 경우 return
    // if (this.popupData.sts !== RcvCommonUtils.STS_IDLE || this.popupData.moveId != null) {
    //   return;
    // }
    //
    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  onInitNewRow(e): void {
    console.log(this.popupFormData);
    // // e.data.itemAdminId = this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : null;
    // e.data.itemAdminId = this.utilService.getCommonItemAdminId();
    // e.data.damageFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.noShippingFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.foreignCargoFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.customsReleaseFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.taxFlg = RcvCommonUtils.FLAG_FALSE;
    // e.data.expectQty1 = 0;
    // e.data.receivedQty1 = 0;
    // e.data.adjustQty1 = 0;
    // e.data.whInDate = this.gridUtil.getToday();
    e.data.ptrn_cd = this.popupFormData.ptrn_cd;
    e.data.std_yn = 'N';
  }

  onEditingStart(e): void {
    console.log(e);
    // if (e.column.dataField === 'sales_wh_cd' && e.data.createdby) { // 영업창고 코드 수정여부
    //   e.cancel = !e.data.sales_wh_cd ? false : true;
    // }

    // 영업창고 코드 자동 채번으로 변경이므로 수정불가
    if (e.column.dataField === 'sales_wh_cd') {
      e.cancel = true;
    }

    // 창고 수정여부
    if (e.column.dataField === 'pwh_cd') {
      if (e.data.cust_gb === this.custGB.ptrn) {
        e.cancel = false;
      } else {
        e.cancel = true;
      }
    }

    // 표준 수정여부
    if (e.column.dataField === 'std_yn' && e.data.cust_gb !== this.custGB.ptrn) {
      // 수출입사 창고코드 수정불가
      e.cancel = true;
    }

  }

  setCustGbValue(newData, value, currentData): void {
    newData.cust_gb = value;

    // console.log('value', value);
    console.log('==== setCustGbValue ====');
    // this.popupForm.instance.getEditor('std_yn').option('disabled', true);


    if (value === this.custGB.expt) {  // 수출사
      console.log('=== setCustGbValue 2 ===');
      newData.std_yn = 'Y';
      newData.pwh_cd = null;

      // this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => {
      //   this.dsPtrn = result.data;
      // });
    }

    if (value === this.custGB.ptrn) {  // 파트너사
      console.log('=== setCustGbValue 3 ===');
      newData.std_yn = 'Y';

      // this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => {
      //   this.dsPtrn = result.data;
      // });
    }

    if (value === this.custGB.impt) {  // 수입사
      console.log('=== onValueChangedCustGb 4 ===');
      newData.std_yn = 'Y';
      newData.pwh_cd = null;

      // this.bizService.getCust(this.G_TENANT, '', '', 'Y', '', '', '').subscribe(result => {
      //   this.dsPtrn = result.data;
      // });
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
          tenant: this.G_TENANT,
          createdBy: this.sessionUserId,
          modifiedBy: this.sessionUserId,
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {
              operType: changes[rowIndex].type,
              uid: changes[rowIndex].key,
              modifiedBy: this.sessionUserId,
            }, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  /**
   * 소속회사 변경시 조회
   */
  onValueChangedPtrnCd(e): void {
    this.changes = [];
    this.onPopupSearch({ptrn_cd: e.value}).then();
  }
}
