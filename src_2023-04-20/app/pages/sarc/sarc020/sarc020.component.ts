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
import {Sarc020Service, Sarc020VO, formData} from './sarc020.service';

@Component({
  selector: 'app-sarc020',
  templateUrl: './sarc020.component.html',
  styleUrls: ['./sarc020.component.scss']
})
export class Sarc020Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sarc020Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  @ViewChild('fromRtnOrdDate', {static: false}) fromRtnOrdDate: DxDateBoxComponent;
  @ViewChild('toRtnOrdDate', {static: false}) toRtnOrdDate: DxDateBoxComponent;

  dsWrkStat = []; // 작업상태
  dsExptCd = []; // 거래처(수출사)
  dsPtrnCd = []; // 수출사
  dsImptCd = []; // 수입사
  dsGridWhCd = []; // 센터(창고마스터)
  dsWhCd = []; // 센터(창고마스터)
  dsCopyWhCd = []; // 센터(창고마스터)
  dsItemCd = []; // 품목
  dsUser = []; // 사용자
  dsContNo = [];
  dsCopySaWh = []; // 영업창고
  dsCountry = [];

  // Global
  G_TENANT: any;
  sessionUserId: any;
  ownerId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sarc020VO = {} as Sarc020VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  // Popup
  popupVisible = false;
  popupMode = 'Add';
  popupModeNm = this.utilService.convert1('sales.rtn_ord_confirm', '회수요청확정', 'Return Order Confirm');
  popupFormData: formData;
  firstPopupData = '';

  // popup detail grid
  dsItemGrid: DataSource;
  entityStoreItemGrid: ArrayStore;

  deleteRowList = [];
  key = 'uid';

  // Grid State
  GRID_STATE_KEY = 'sarc_sarc020_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {

    this.dsWrkStat = [{cd: '1', nm: '회수지시'},
      {cd: '2', nm: '지시확정'},
      {cd: '3', nm: '회수'}];

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
    this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
      this.dsPtrnCd = result.data;
    });

    // // 수입사
    // this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
    //   this.dsImptCd = result.data;
    // });

    // 수입사 - 파트너사
    if (this.utilService.getCompany() === 'O1000') {
      this.bizService.getImptPtrn(this.G_TENANT).subscribe(result => {
        this.dsImptCd = result.data;
      });
    } else {
      this.bizService.getImptPtrn(this.G_TENANT, this.utilService.getCompany()).subscribe(result => {
        this.dsImptCd = result.data;
      });
    }

    // 창고
    this.bizService.getWh(this.G_TENANT).subscribe(result => {
      this.dsGridWhCd = result.data;
    });
    this.bizService.getPtrnWh(this.G_TENANT).subscribe(result => {
      this.dsCopyWhCd = result.data;
    });

    // 전체 품목
    this.bizService.getItem(this.G_TENANT, '', 'Y', '', '', '').subscribe(result => {
      this.dsItemCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.ownerId = result.data[0]["company"];
    });

    // 계약번호
    this.bizService.getContNo(this.G_TENANT, '2', '', '', '').subscribe(result => {
      this.dsContNo = result.data;
    });

    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsCopySaWh = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
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

    this.fromRtnOrdDate.value = rangeDate.fromDate;
    this.toRtnOrdDate.value = rangeDate.toDate;
    // this.mainForm.instance.getEditor('wrkStat').option('value', '1');

    if (this.userGroup === '3') {
      this.mainForm.instance.getEditor('rtnPtrnCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('rtnPtrnCd').option('disabled', true);
    }
  }


  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromRtnOrdDate = document.getElementsByName('fromRtnOrdDate').item(1).getAttribute('value');
      this.mainFormData.toRtnOrdDate = document.getElementsByName('toRtnOrdDate').item(1).getAttribute('value');

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
            key: [this.key, 'wh_cd'],
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
  // 저장버튼 이벤트 - 주문할당 저장 버튼 save
  async popupSaveClick(e): Promise<void> {

    const popData = this.popupForm.instance.validate();

    if (!popData.isValid) return;

    try {
      let result;
      let sendResult;

      // @ts-ignore
      const saveContent = this.popupFormData as Sarc020VO;

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));  // "저장"
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent["createdby"] = this.sessionUserId;
      saveContent["modifiedby"] = this.sessionUserId;

      const detailList = this.popupGrid.instance.getDataSource().items();

      saveContent.rtnItemList = detailList;
      saveContent.ownerId = this.ownerId;
      saveContent.tran_dt = this.gridUtil.getToday().replace(/-/gi, '');

      console.log(saveContent);

      result = await this.service.mainSave(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        // // 회수확정 송신 I/F
        // sendResult = await this.bizService.sendApi({
        //   sendType: 'rtnOrd',
        //   rtnOrdNo: this.popupFormData.rtn_ord_no,
        //   ownerId: this.ownerId
        // });
        //
        // if (!sendResult.success) {
        //   this.utilService.notify_error(JSON.stringify(sendResult));
        //   // return;
        // } else {
        //   console.log('I/F Success');
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

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;

    // 팝업 버튼 보이기 정리
    this.saveBtn.visible = false; // 저장버튼
    this.popupVisible = true;

    if (this.popupFormData.wrk_stat === '1') {
      this.saveBtn.visible = true; // 저장버튼
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

  onInitNewRow(e): void {
    // e.data.item_cd = "";
    // e.data.ord_qty = 0;
    // e.data.ord_pr = 0;
  }




  /**
   *  팝업 메소드 END
   */

}
