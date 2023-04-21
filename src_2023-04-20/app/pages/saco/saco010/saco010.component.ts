import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saco010Service, Saco010VO} from './saco010.service';

@Component({
  selector: 'app-saco010',
  templateUrl: './saco010.component.html',
  styleUrls: ['./saco010.component.scss']
})
export class Saco010Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saco010Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.onSelectionChangeDepoGb = this.onSelectionChangeDepoGb.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  @ViewChild('fromDepoDate', {static: false}) fromDepoDate: DxDateBoxComponent;
  @ViewChild('toDepoDate', {static: false}) toDepoDate: DxDateBoxComponent;

  dsExptCd     = []; // 거래처(수출사)
  dsMonyUnit   = []; // 화폐
  dsOrdGb      = []; // 주문구분
  dsDepoGb     = []; // 입금구분
  dsDishonorYn = []; // 부도여부
  dsUser       = []; // 사용자

  dsExptCdAll = []; // 전체수출사

  dsClaim = []; // 수출사 청구목록

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Saco010VO = {} as Saco010VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: Saco010VO;
  firstPopupData = '';

  selectedRows: number[];
  deleteRowList = [];
  changes = [];
  key = 'depo_no';

  // Grid State
  GRID_STATE_KEY = 'saor_saco010_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 주문구분
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
                    {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')}];

    // 입금구분
    this.dsDepoGb = [{cd: '1', nm: '현금'},
                     {cd: '2', nm: '어음'},
                     {cd: '3', nm: '기타'}];

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => { this.dsDishonorYn = result.data; });

    // 수출사
    if (this.userGroup === '3') {
      this.service.getExptPtrn(this.G_TENANT, this.userCompany).subscribe(result => {
        this.dsExptCd = result.data;
      });
    } else {
      this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
        this.dsExptCd = result.data;
      });
    }

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => { this.dsMonyUnit = result.data; });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => { this.dsExptCdAll = result.data; });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromDepoDate.value = rangeDate.fromDate;
    this.toDepoDate.value = rangeDate.toDate;
  }

  /**
   *  초기화 메소드 END
   */

  /**
   *  조회 메소드 START
   */
  // 메인 그리드 조회
  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromDepoDate = document.getElementsByName('fromDepoDate').item(1).getAttribute('value');
      this.mainFormData.toDepoDate = document.getElementsByName('toDepoDate').item(1).getAttribute('value');

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

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {

    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      try {
        let result;

        const lastPopupData: string = JSON.stringify(this.popupFormData);
        let formModified = 'N';

        // console.log(this.firstPopupData);
        // console.log(lastPopupData);

        if ( this.firstPopupData !== lastPopupData ) {
            formModified = 'Y';
            // console.log('diff');
        }
        else {
            // console.log('same');
            this.utilService.notify_error(this.utilService.convert('변경항목이 없습니다.'));
            return;
        }

        const today: string = this.gridUtil.getToday().replace(/-/gi, '');
        const depoDt: string = this.popupForm.instance.getEditor('depo_dt').option('value').replace(/-/gi, '');

        /*
        if( this.popupMode === 'Add' && depoDt < today ) {
          const msg = "입금일자는 당일 포함 이후만 가능합니다.";
          this.utilService.notify_error(msg);
          this.popupForm.instance.getEditor('depo_dt').focus();
          return;
        }
        */

        const depoGb: string = this.popupForm.instance.getEditor('depo_gb').option('value');
        const dishonorYn: string = this.popupForm.instance.getEditor('dishonor_yn').option('value');
        if ( depoGb === '2' ) {
          if ( !dishonorYn ) {
            let msg = '어음일 경우 부도여부는 필수 선택입니다.';
            if ( this.utilService.getLanguage() !== 'ko' ) {
                msg = 'If it\'s a bill, bankruptcy Y/N is a essential.';
            }
            this.utilService.notify_error(msg);
            this.popupForm.instance.getEditor('dishonor_yn').focus();
            return;
          }
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        const saveContent = this.popupFormData as Saco010VO;

        saveContent.createdby  = this.sessionUserId;
        saveContent.modifiedby = this.sessionUserId;
        saveContent.formModified = formModified;
        saveContent.language     = this.utilService.getLanguage();

        // console.log("==save saveContent >>>");  console.log(saveContent);

        result = await this.service.mainSave(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        }
        else {
          this.utilService.notify_success('Save success');
          // this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
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
    grid.focusedRowIndex = e.rowIndex;
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
  async showPopup(popupMode, data): Promise<void> {
    console.log('showPopup');
    this.changes = [];  // 초기화
    this.dsClaim = [];

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.firstPopupData = JSON.stringify(this.popupFormData);
    this.popupMode = popupMode;

    // 팝업 버튼 보이기 정리
    if (this.popupMode === 'Add') { // 주문할당
      this.deleteBtn.visible = false; // 삭제버튼
      this.saveBtn.visible   = true; // 저장버튼
    }
    else {
      this.deleteBtn.visible = true;
      this.saveBtn.visible = true;
    }

    this.popupVisible = true;

    if (this.popupMode === 'Add' && this.popupForm ) {
      this.popupForm.instance.resetValues();
    }
  }

  popupShown(e): void {
    console.log('popupShown');
    this.popupForm.instance.getEditor('depo_dt').option('disabled', false);
    this.popupForm.instance.getEditor('expt_cd').option('disabled', false);
    // this.popupForm.instance.getEditor('ord_gb').option('disabled', false);
    this.popupForm.instance.getEditor('depo_gb').option('disabled', false);
    this.popupForm.instance.getEditor('mony_unit').option('disabled', false);
    this.popupForm.instance.getEditor('depo_amt').option('disabled', false);
    this.popupForm.instance.getEditor('std_rate').option('disabled', false);
    this.popupForm.instance.getEditor('remark').option('disabled', false);
    this.popupForm.instance.getEditor('dishonor_yn').option('disabled', true);

    if (this.popupMode === 'Add') { // 신규
      this.popupForm.instance.getEditor('depo_dt').option('value', this.gridUtil.getToday());
      this.popupForm.instance.getEditor('depo_amt').option('value', 0);
      this.popupForm.instance.getEditor('std_rate').option('value', 1);

      // 초기 focus
      this.popupForm.instance.getEditor('depo_dt').focus();
    }
    else if (this.popupMode === 'Edit') { // 수정
      this.popupForm.instance.getEditor('depo_dt').option('disabled', true);
      this.popupForm.instance.getEditor('expt_cd').option('disabled', true);

      // 초기 focus
      // this.popupForm.instance.getEditor('ord_gb').focus();
    }

    console.log('this.popupFormData');
    console.log(this.popupFormData);

    if ( this.popupFormData.depo_gb === '2' ) {
      this.popupForm.instance.getEditor('dishonor_yn').option('disabled', false);
      this.popupForm.instance.getEditor('expi_dt').option('disabled', false);
    }
    else {
      this.popupForm.instance.getEditor('dishonor_yn').option('disabled', true);
      this.popupForm.instance.getEditor('expi_dt').option('disabled', true);
    }
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    // this.popupForm.instance.resetValues();
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('sales.delete_btn'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const deleteContent = this.popupFormData as Saco010VO;
      deleteContent.language = this.utilService.getLanguage();

      const result = await this.service.mainDelete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        // this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  // 창고변경시 가용재고를 위해 품목목록 재조회
  async onSelectionChangeDepoGb(e): Promise<void> {
    // console.log('onSelectionChangeDepoGb >>>>');
    // console.log(e.event);
    if ( !e.event ) { return; }

    if ( e.value === '2' ) {
      this.popupForm.instance.getEditor('dishonor_yn').option('disabled', false);
      this.popupFormData.dishonor_yn = 'N';
      this.popupForm.instance.getEditor('expi_dt').option('disabled', false);
    }
    else {
      this.popupForm.instance.getEditor('dishonor_yn').option('disabled', true);
      this.popupFormData.dishonor_yn = '';
      this.popupForm.instance.getEditor('expi_dt').option('disabled', true);
      this.popupFormData.expi_dt = '';
    }
    // console.log(e);

  }
  onInitNewRow(e): void {
    e.data.item_cd = '';
    e.data.ord_qty = 0;
    e.data.ord_pr = 0;
  }

  /**
   *  팝업 메소드 END
   */

}
