import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {FormData, Sabu040Service, Sabu040VO} from './sabu040.service';

@Component({
  selector: 'app-sabu040',
  templateUrl: './sabu040.component.html',
  styleUrls: ['./sabu040.component.scss']
})
export class Sabu040Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sabu040Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);

    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.allowEditing = this.allowEditing.bind(this);
    this.onValueChangedPurCd = this.onValueChangedPurCd.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  dsCustCd = []; // 거래처
  filteredWhCd = [];
  dsCopyWhCd = [];
  dsWhCd = []; // 센터(창고마스터)
  dsMonyUnit = []; // 화폐
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsPtrnCd = [];
  dsDamageFlg = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  ownerId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sabu040VO = {} as Sabu040VO;
  saveData: Sabu040VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = this.utilService.convert('/sabu/sabu040');  // 구매발주확정
  popupFormData: FormData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  changes = [];
  subChanges = [];
  key = 'ord_no';
  key2 = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sabu_sabu040_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {

    // 거래처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', 'Y', '').subscribe(result => {
      this.dsCustCd = result.data;
    });

    // 창고
    // this.bizService.getWh(this.G_TENANT).subscribe(result => {
    //   this.dsWhCd = result.data;
    // });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => {
      this.dsMonyUnit = result.data;
    });

    // 품목
    // this.bizService.getItem(this.G_TENANT,'','','2','','').subscribe(result => { this.dsItemCd = result.data; });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(
      result => {
        this.dsItemCd = result.data;
        // this.dsFullitemCd = result.data;
      });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.ownerId = result.data[0]["company"];
    });

    // 영업창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });

    // 매입처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    // 불량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    // 팝업 그리드 초기화
    this.entityStoreItemGrid = new ArrayStore(
      {
        data: [], key: this.key
      }
    );

    this.dsItemGrid = new DataSource({
      store: this.entityStoreItemGrid
    });

    // this.utilService.getFoldable(this.mainForm, this.foldableBtn);

    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;

    // this.mainForm.instance.getEditor('ptrn_cd').option('value', this.utilService.getCompany());
    this.mainFormData.ptrn_cd = this.utilService.getCompany();

    if (this.userGroup === '3') {
      // this.mainForm.instance.getEditor('ptrnCd').option('value', this.userCompany);
      // this.mainForm.instance.getEditor('ptrnCd').option('disabled', true);
    }
  }


  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStoreMainGrid = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.dsMainGrid = new DataSource({
          store: this.entityStoreMainGrid
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        // this.mainGrid.focusedRowIndex = -1;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }


  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupFormData.ord_no) {

      // Service의 get 함수 생성

      const para: any = this.popupFormData;

      const result = await this.service.mainInfo(para);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        // 팝업 폼 데이터 세팅
        this.popupFormData = result.data.info;
        this.firstPopupData = JSON.stringify(this.popupFormData);

        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.gridList,
            key: this.key2
          }
        );
        this.dsItemGrid = new DataSource({
          store: this.entityStoreItemGrid
        });
        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  async purWrkStatChange(e): Promise<void> {
    this.saveData = {tenant: this.G_TENANT, ...this.saveData};
    const saveContent = this.saveData as Sabu040VO;

    const purList = this.mainGrid.instance.getSelectedRowsData();

    if (purList.length === 0) {
      let msg = '체크된 발주가 없습니다.';
      if (this.utilService.getLanguage() !== 'ko') {
        msg = 'There are no confirmed orders.';
      }
      this.utilService.notify_error(msg);
      return;
    }

    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    console.log(purList);
    saveContent.gridList = purList;

    saveContent["createdby"] = this.sessionUserId;
    saveContent["modifiedby"] = this.sessionUserId;

    await this.service.purWrkStatChange(saveContent);

    await this.onSearch();
  }

  // 팝업(POPUP) 띄우기  이벤트
  async purInpClick(e): Promise<void> {

    const ordDatas: any = this.mainGrid.instance.getSelectedRowsData();

    if (ordDatas.length < 1) {
      // 목록을 선택하세요.
      const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.order'));
      this.utilService.notify_error(msg);
      return;
    }

    const ordData: any = ordDatas[0];

    this.showPopup('Add', {...ordData});
  }

  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {
    this.onSave(e);
  }

  async onSave(e): Promise<void> {
    if ((this.popupGrid.instance.totalCount() + this.changes.length) === 0) {
      // '품목 목록을 추가하세요.'
      // tslint:disable-next-line:no-shadowed-variable
      const msg = this.utilService.convert('com_valid_required', this.utilService.convert('sales.item'));
      this.utilService.notify_error(msg);
      return;
    }

    console.log(e);

    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) return;

    try {

      const today: string = this.gridUtil.getToday().replace(/-/gi, '');
      const chkDt: string = this.popupForm.instance.getEditor('chk_dt').option('value').replace(/-/gi, '');

      // if (chkDt < today) {
      //   // tslint:disable-next-line:no-shadowed-variable
      //   const msg = '확정일자는 당일 포함 이후만 가능합니다.';
      //   this.utilService.notify_error(msg);
      //   this.popupForm.instance.getEditor('chk_dt').focus();
      //   return;
      // }

      const saveContent = this.popupFormData as Sabu040VO;
      let detailList;

      if (this.changes.length > 0) {
        detailList = this.bizService.collectGridData(this.changes, this.popupGrid, this.G_TENANT);
      } else {
        detailList = this.popupGrid.instance.getDataSource().items();
      }

      for (const items of detailList) {
        // tslint:disable-next-line:no-bitwise
        const ordQty: number = items.ord_qty >>> 0;
        // tslint:disable-next-line:no-bitwise
        const chkQty: number = (items.old_chk_qty >>> 0) + (items.chk_qty >>> 0);

        if (ordQty < chkQty) {
          let msg = '발주수량을 초과할 수 없습니다.';
          if (this.utilService.getLanguage() !== 'ko') {
            msg = 'Order quantity cannot be exceeded.';
          }
          this.utilService.notify_error(msg);
          return;
        }
      }

      // 검사수량
      let totChkQty = 0;
      for (const items of this.popupGrid.instance.getVisibleRows()) {
        // tslint:disable-next-line:no-bitwise
        totChkQty += items.data.chk_qty >>> 0;
      }

      if (totChkQty < 1) {
        var msg = '확정수량을 1개 이상 입력하세요.';
        if (this.utilService.getLanguage() !== 'ko') {
          msg = 'Please enter 1 or more inspection quantity.';
        }
        this.utilService.notify_error(msg);
        return;
      }

      // if (!this.popupGrid.instance.hasEditData()) {
      //   var msg = '변경항목이 없습니다.';
      //   if (this.utilService.getLanguage() !== 'ko') {
      //     msg = 'There are no changes.';
      //   }
      //   this.utilService.notify_error(msg);
      //   return;
      // }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.gridList = detailList;

      saveContent["createdby"] = this.sessionUserId;
      saveContent["modifiedby"] = this.sessionUserId;

      saveContent['damageflg'] = this.popupFormData.damageflg;
      saveContent['ownerId'] = this.ownerId;

      const result = await this.service.mainSave(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        // 입고번호 = result.data.inpNo
        // console.log(result.data["inpNo"]);
        //
        // // 해당 영업창고에 물류창고 있으면 i/f
        // const wh = await this.dsCopyWhCd.filter(el => el.cd === this.popupForm.instance.getEditor('wh_cd').option('value'));
        //
        // if (wh.length > 0 && wh[0].pwh_cd) {
        //   const sendResult = await this.bizService.sendApi({
        //     sendType: 'purInpOrd',
        //     inpNo: result.data["inpNo"],
        //     ownerId: this.ownerId
        //   });
        //
        //   if (!sendResult.success) {
        //     this.utilService.notify_error(JSON.stringify(sendResult));
        //     // return;
        //   } else {
        //     console.log('I/F Success');
        //   }
        // } else {
        // }

        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }


  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  /**
   *  이벤트 메소드 END
   */

  /**
   *  팝업 메소드 START
   */
  showPopup(popupMode, data): void {

    this.changes = [];  // 초기화

    // 품목 그리드 초기화
    if (!!this.dsItemGrid) {
      this.entityStoreItemGrid.clear();
      this.dsItemGrid.reload();
    }

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;

    this.popupVisible = true;

    this.onSearchPopup();
  }

  popupShown(e): void {
    this.popupFormData.ptrn_cd = this.utilService.getCompany();

    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.popupFormData.ptrn_cd);

    this.popupForm.instance.getEditor('chk_dt').option('value', this.gridUtil.getToday());
    this.popupForm.instance.getEditor('chk_dt').focus();

    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }


  // 확정수량 변경시
  setChkQty(rowData: any, value: any, currentRowData: any): void {
    rowData.chk_qty = (value < 0) ? 0 : value;

    rowData.chk_amt =  Math.floor((value * currentRowData.ord_pr) + 0.5555);

    if (currentRowData.std_pur_vat_rate) {
      rowData.chk_vat_amt = Math.floor((rowData.chk_amt * (currentRowData.std_pur_vat_rate)) / 10) * 10;
    }
  }

  // 입고가 변경시
  setOrdPr(rowData: any, value: any, currentRowData: any): void {
    rowData.ord_pr = (value < 0) ? 0 : value;

    if (currentRowData.chk_qty > 0) {
      rowData.chk_amt = Math.floor((value * currentRowData.chk_qty) + 0.5555);
      rowData.chk_vat_amt = Math.floor((rowData.chk_amt * (currentRowData.std_pur_vat_rate)) / 10) * 10;
    }
  }

  // 입고금액 표현식
  calcChkAmt(rowData): any {
    return rowData.chk_qty * rowData.ord_pr;
  }

  // grid edit 제어
  allowEditing(e): any {
    return true;
  }

  /**
   *  팝업 메소드 END
   */

  onValueChangedPurCd(e): void {
    this.filteredWhCd = this.dsCopyWhCd.filter(el => el.ptrn_cd === this.mainForm.instance.getEditor('purCd').option('value'));

  }

}
