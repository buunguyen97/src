import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import { BizCodeService } from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import { Sarc030Service, Sarc030VO } from './sarc030.service';
import {formData} from '../sarc020/sarc020.service';
import {Sarc031Service} from './sarc031.service';

@Component({
  selector: 'app-sarc031',
  templateUrl: './sarc031.component.html',
  styleUrls: ['./sarc031.component.scss']
})
export class Sarc031Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sarc031Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.rtnCancel = this.rtnCancel.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('fromOrdDate', {static: false}) fromOrdDate: DxDateBoxComponent;
  @ViewChild('toOrdDate', {static: false}) toOrdDate: DxDateBoxComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  // @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  dsOrdGb     = []; // 주문구분
  dsExptCd    = []; // 수출사
  dsPtrnCd    = []; // 파트너사
  dsMonyUnit  = []; // 화폐
  dsUser      = []; // 사용자
  dsImptCd    = []; // 수입사
  // dsWrkStat   = []; // 작업상태
  dsWhCd      = []; // 창고
  dsPort      = []; // 항구

  dsExptCdAll = []; // 전체수출사
  dsPtrnCdAll = []; // 전체파트너사
  dsImptCdAll = []; // 전체수입사

  dsCopySaWh = []; // 영업창고
  dsCountry = [];
  dsContNo = [];
  dsItemCd = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sarc030VO = {} as Sarc030VO;

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = this.utilService.convert1('sales.rtn_ord_confirm', '회수요청확정', 'Return Order Confirm');
  popupFormData: formData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  key = ['rtn_ord_no', 'item_cd'];

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    // 주문구분
    this.dsOrdGb = [{cd: '1', nm: this.utilService.convert1('sales.sale', '판매', 'Sale')},
                    {cd: '2', nm: this.utilService.convert1('sales.rent', '렌탈', 'Rental')},
                    {cd: '3', nm: this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample')}];

    // 작업상태
    // this.dsWrkStat = [{cd: '1', nm: this.utilService.convert1('sales.rtn_ord', '회수지시', 'Return Order')},
    //                   {cd: '2', nm: this.utilService.convert1('sales.instruction_confirm', '지시확정', 'Instruction Confirm')},
    //                   {cd: '3', nm: this.utilService.convert1('sales.rtn', '회수', 'Return')}];

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

    // 파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => { this.dsPtrnCd = result.data; });

    // 화폐
    this.codeService.getCode(this.G_TENANT, 'MONYUNIT').subscribe(result => { this.dsMonyUnit = result.data; });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

    // 수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
      this.dsImptCd = result.data;
    });

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => { this.dsWhCd = result.data; });

    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => { this.dsPort = result.data; });

    // 전체수출사
    this.bizService.getCust(this.G_TENANT, '', 'Y', '', '', '', '').subscribe(result => { this.dsExptCdAll = result.data; });

    // 전체파트너사
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', '', '', '').subscribe(result => { this.dsPtrnCdAll = result.data; });

    // 전체수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', '', '', '').subscribe(result => { this.dsImptCdAll = result.data; });

    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopySaWh = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 계약번호
    this.bizService.getContNo(this.G_TENANT, '2', '', '', '').subscribe(result => {
      this.dsContNo = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    const rangeDate = this.utilService.getDateRange();

    this.fromOrdDate.value = rangeDate.fromDate;
    this.toOrdDate.value = rangeDate.toDate;
    // this.mainForm.instance.getEditor('wrkStat').option('value', '2');

    if ( this.userGroup === '2' ) {
      this.mainForm.instance.getEditor('exptCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('exptCd').option('disabled', true);
    }
    if ( this.userGroup === '3' ) {
      this.mainForm.instance.getEditor('rtnPtrnCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('rtnPtrnCd').option('disabled', true);
    }
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
      this.mainFormData.fromOrdDate = document.getElementsByName('fromOrdDate').item(1).getAttribute('value');
      this.mainFormData.toOrdDate = document.getElementsByName('toOrdDate').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    console.log('onSearchPopup >>> ');
    if (this.popupFormData.uid) {

      // Service의 get 함수 생성

      const para: any = this.popupFormData;
      para.popup_mode = this.popupMode;

      const result = await this.service.mainInfo(para);

      this.bizService.getContNo(this.G_TENANT, '2', this.popupFormData.expt_cd, this.popupFormData.impt_cd, '').subscribe(r => {
        this.dsContNo = r.data;
      });

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        if (result.data.info) {
          this.popupFormData = result.data.info;

          this.popupFormData.cust_cont = result.data.info.cust_cont;

        }
        // 팝업 폼 데이터 세팅
        this.firstPopupData = JSON.stringify(this.popupFormData);

        // 파트너사에 따른 창고만 콤보에 적용
        // this.dsWhCd = this.dsCopyWhCd.filter(el => el.cust_cd === this.popupFormData.rtn_ptrn_cd);

        this.entityStoreItemGrid = new ArrayStore(
          {
            data: result.data.rtnItemList,
            key: this.key
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
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }
  /**
   *  이벤트 메소드 END
   */

  // 작업상태 표현식
  ordGbNm(rowData): any {
    let ordGbNm = '';
    if (rowData.ord_gb === '1') {
      ordGbNm = this.utilService.convert1('sales.sale', '판매', 'Sale');
    }
    if (rowData.ord_gb === '2') {
      ordGbNm = this.utilService.convert1('sales.rent', '렌탈', 'Rental');
    }
    if (rowData.ord_gb === '3') {
      ordGbNm = this.utilService.convert1('sales.ord_sample', '견본,타계정', 'Sample');
    }

    return ordGbNm;
  }

  async rtnCancel(e): Promise<void> {
    const rtnData = this.mainGrid.instance.getSelectedRowsData();

    try {
      if (rtnData.length < 1) {
        // tslint:disable-next-line:no-shadowed-variable
        const msg = this.utilService.convert('com_select_obj', this.utilService.convert('sales.rtn_ord'));
        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert1('Execute_rtncancel', '회수요청확정을 취소하시겠습니까?');
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      const result = await this.service.rtnCancel(rtnData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        this.utilService.notify_success('Save success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }

  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Modify', {...e.data});
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    // console.log("onFocusedCellChanging   CELL Changing");
    // grid.focusedRowIndex = e.rowIndex;
  }


  /**
   *  이벤트 메소드 END
   */

  /**
   *  팝업 메소드 START
   */
  showPopup(popupMode, data): void {

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;

    // 팝업 버튼 보이기 정리
    // this.saveBtn.visible = false; // 저장버튼
    this.popupVisible = true;

    if (this.popupFormData.wrk_stat === '1') {
      // this.saveBtn.visible = true; // 저장버튼
    }
    this.onSearchPopup();
  }

  popupShown(e): void {
    this.popupModeNm = this.utilService.convert1('sales.rtn_ord_confirm', '회수요청확정', 'Return Order Confirm'); // "회수지시확정";
    this.popupForm.instance.getEditor('rtn_ord_no').option('disabled', true);
    this.popupForm.instance.getEditor('rtn_ord_dt').option('disabled', true);
    this.popupForm.instance.getEditor('impt_cd').option('disabled', true);
    this.popupForm.instance.getEditor('expt_cd').option('disabled', true);
    this.popupForm.instance.getEditor('rtn_ptrn_cd').option('disabled', true);
    this.popupForm.instance.getEditor('sa_wh_cd').option('disabled', true);
    this.popupForm.instance.getEditor('remark').option('disabled', true);


    // this.popupForm.instance.getEditor('rtn_sche_dt').focus();
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();
  }

}
