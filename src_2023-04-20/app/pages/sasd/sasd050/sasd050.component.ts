import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxDateBoxComponent,
  DxFormComponent,
  DxPopupComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {CustVO, CustMstVO, Sasd050Service} from './sasd050.service';
import {Sabu110VO} from "../../sabu/sabu110/sabu110.service";

@Component({
  selector: 'app-sasd050',
  templateUrl: './sasd050.component.html',
  styleUrls: ['./sasd050.component.scss']
})
export class Sasd050Component implements OnInit, AfterViewInit {

  @ViewChild('searchForm', {static: false}) searchForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;
  @ViewChild('holdBtn', {static: false}) holdBtn: DxButtonComponent;

  @ViewChild('fileDownBtn', {static: false}) fileDownBtn: DxButtonComponent;
  @ViewChild('fileDtlBtn', {static: false}) fileDtlBtn: DxButtonComponent;

  @ViewChild('fromEstDt', {static: false}) fromEstDt: DxDateBoxComponent;
  @ViewChild('toEstDt', {static: false}) toEstDt: DxDateBoxComponent;

  dsUser = []; // 사용자
  dsCustNm = []; // 거래처명
  dsSex = [];      // 성별
  dsCountry = [];      // 국가
  dsApproval = [];
  dsBizGb = [];      // 사업자구분
  dsImptPtrn = [];      // 수입사
  dsUserGroup = [];      // 사용자그룹
  dsActFlg = [];      // 사용여부
  dsCustCd = [];
  dsCustGb = []; // 거래처구분

  // Global
  G_TENANT: any;
  UserUID: any;
  vTENANT: any;
  logFileNm: any;
  phyFileNm: any;

  // Form
  searchFormData: CustMstVO = {} as CustMstVO;

  // Grid
  dataSource: DataSource;
  popupDataSource: DataSource;
  entityStore: ArrayStore;
  data: CustVO;
  changes = [];
  popupEntityStore: ArrayStore;
  key = 'cust_nm';

  // ***** Popup ***** //
  // Grid Popup
  popupMode = 'Edit';
  popupFormData: CustMstVO;

  bizNoCnt: any;
  dunsNoCnt: any;
  mBizNoCnt: any;

  constructor(public utilService: CommonUtilService,
              private service: Sasd050Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private bizService: BizCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.GbNm = this.GbNm.bind(this);
    this.GbNm1 = this.GbNm1.bind(this);
    this.onDownloadFile1 = this.onDownloadFile1.bind(this);
    this.onDeleteFile1 = this.onDeleteFile1.bind(this);
    this.onPopupAfterOpen = this.onPopupAfterOpen.bind(this);
  }

  ngOnInit(): void {
    // 진행사항
    this.dsApproval = [{cd: 'Y', nm: this.utilService.convert1('sales.approval_y', '승인완료')},
      {cd: 'N', nm: this.utilService.convert1('sales.approval_n', '보류')},
      {cd: '', nm: this.utilService.convert1('sales.approval_null', '검토대기')},
    ];

    this.dsCustGb = [{cd: '2', nm: this.utilService.convert('sales.expt_cd')}
      , {cd: '4', nm: this.utilService.convert('sales.impt_cd')}
      , {cd: '3', nm: this.utilService.convert('sales.ptrn_cd')}];

    this.codeService.getCodeOrderByCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
    // 수입사
    this.bizService.getCust(this.G_TENANT, '', '', 'Y', 'Y', '', '').subscribe(result => {
      this.dsImptPtrn = result.data;
    });

    // 성별
    this.codeService.getCode(this.G_TENANT, 'SEX').subscribe(result => {
      this.dsSex = result.data;
    });

    // 사업자구분
    this.codeService.getCode(this.G_TENANT, 'BIZGB').subscribe(result => {
      this.dsBizGb = result.data;
    });

    // 영업담당자
    this.bizService.getSaChg_SACS010(1).subscribe(result => {
      this.dsUserGroup = result.data;
    });

    // 매입처
    this.bizService.getCust(this.G_TENANT, '', '', '', 'Y', '', '').subscribe(result => {
      this.dsCustCd = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initForm();
    this.searchForm.instance.getEditor('custNm').focus();
    this.utilService.getGridHeight(this.mainGrid);
  }


  // 작업상태 표현식
  GbNm(rowData): any {

    let nm = '';
    if (this.utilService.getLanguage() === 'ko') {
      if (rowData.biz_gb === 'C') {
        nm = '법인';
      } else if (rowData.biz_gb === 'P') {
        nm = '개인';
      }
    } else {
      if (rowData.biz_gb === 'C') {
        nm = 'Company';
      } else if (rowData.biz_gb === 'P') {
        nm = 'Pesonal';
      }
    }
    return nm;
  }

  GbNm1(rowData): any {

    let nm = '';
    if (this.utilService.getLanguage() === 'ko') {
      if (rowData.approval === 'Y') {
        nm = '승인완료';
      } else if (rowData.approval === 'N') {
        nm = '보류';
      } else if (rowData.approval === '') {
        nm = '검토대기';
      }
    } else {
      if (rowData.approval === 'Y') {
        nm = 'Confirm';
      } else if (rowData.approval === 'N') {
        nm = 'On Hold';
      } else if (rowData.approval === '') {
        nm = 'Waiting';
      }
    }
    return nm;
  }

  // ***** Main ***** //
  // 조회함수
  async onSearch(): Promise<void> {

    const data = this.searchForm.instance.validate();

    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {
      this.searchFormData.fromEstDt = document.getElementsByName('fromEstDt').item(1).getAttribute('value');
      this.searchFormData.toEstDt = document.getElementsByName('toEstDt').item(1).getAttribute('value');
      const result = await this.service.main_list(this.searchFormData);
      console.log(result);
      if (!result.success) {
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: 'cust_nm'
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


  // ***** Popup ***** //
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
      // this.popupForm.instance.getEditor('slotPriority').option('disabled', true);
    } else {
      return;
    }
  }

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;
    this.popupMode = 'Edit';
    this.onPopupSearch(e.data).then(
      () => this.popupForm.instance.getEditor('cust_nm').focus()
    );

    console.log(e);
    if (e.data.approval === '') {
      this.saveBtn.visible = true;
      this.holdBtn.visible = true;

    } else {
      this.saveBtn.visible = false;
      this.holdBtn.visible = false;
    }
  }

  // 팝업 오픈 후 처리
  onPopupAfterOpen(): void {

    if (this.popupMode === 'Edit') {
      // 기본설정
      this.popupForm.instance.getEditor('expt_yn').option('disabled', true);
      this.popupForm.instance.getEditor('impt_yn').option('disabled', true);
      this.popupForm.instance.getEditor('cust_cd').option('disabled', true);
      this.popupForm.instance.getEditor('country').option('disabled', true);
      this.popupForm.instance.getEditor('biz_unit_tax_yn').option('disabled', true);
      this.popupForm.instance.getEditor('est_dt').option('disabled', true);
      this.popupForm.instance.getEditor('biz_gb').option('disabled', true);
      this.popupForm.instance.getEditor('biz_no').option('disabled', true);
      this.popupForm.instance.getEditor('cust_nm').option('disabled', true);
      this.popupForm.instance.getEditor('eng_cust_nm').option('disabled', true);
      this.popupForm.instance.getEditor('eng_cust_short_nm').option('disabled', true);
      this.popupForm.instance.getEditor('biz_type').option('disabled', true);
      this.popupForm.instance.getEditor('biz_cond').option('disabled', true);
      this.popupForm.instance.getEditor('boss_nm').option('disabled', true);
      this.popupForm.instance.getEditor('eng_boss_nm').option('disabled', true);
      this.popupForm.instance.getEditor('boss_country').option('disabled', true);
      this.popupForm.instance.getEditor('boss_sex').option('disabled', true);
      this.popupForm.instance.getEditor('boss_email').option('disabled', true);
      this.popupForm.instance.getEditor('zip_no').option('disabled', true);
      this.popupForm.instance.getEditor('biz_adr1').option('disabled', true);
      this.popupForm.instance.getEditor('biz_adr2').option('disabled', true);
      this.popupForm.instance.getEditor('eng_biz_adr1').option('disabled', true);
      this.popupForm.instance.getEditor('eng_biz_adr2').option('disabled', true);
      this.popupForm.instance.getEditor('chg_nm').option('disabled', true);
      this.popupForm.instance.getEditor('chg_email').option('disabled', true);
      this.popupForm.instance.getEditor('chg_hp_no').option('disabled', true);
      this.popupForm.instance.getEditor('chg_tel_no').option('disabled', true);
      this.popupForm.instance.getEditor('corp_no').option('disabled', true);
      this.popupForm.instance.getEditor('duns_no').option('disabled', true);
      this.popupForm.instance.getEditor('m_biz_no').option('disabled', true);
      // this.popupForm.instance.getEditor('sa_chg_id').option('disabled', true);
      this.popupForm.instance.getEditor('corp_no').option('disabled', true);
      this.popupForm.instance.getEditor('bill_chg_email').option('disabled', true);
      this.popupForm.instance.getEditor('bill_chg_hp_no').option('disabled', true);
      this.popupForm.instance.getEditor('bill_chg_nm').option('disabled', true);
      this.popupForm.instance.getEditor('bill_chg_tel_no').option('disabled', true);
      this.popupForm.instance.getEditor('wh_biz_adr1').option('disabled', true);
      this.popupForm.instance.getEditor('wh_biz_adr2').option('disabled', true);
      this.popupForm.instance.getEditor('wh_eng_biz_adr1').option('disabled', true);
      this.popupForm.instance.getEditor('wh_eng_biz_adr2').option('disabled', true);
      this.popupForm.instance.getEditor('wh_chg_tel_no').option('disabled', true);
      this.popupForm.instance.getEditor('wh_chg_hp_no').option('disabled', true);
      this.popupForm.instance.getEditor('wh_chg_tel_no').option('disabled', true);
      this.popupForm.instance.getEditor('wh_zip_no').option('disabled', true);
      this.popupForm.instance.getEditor('wh_chg_nm').option('disabled', true);
      this.popupForm.instance.getEditor('wh_chg_email').option('disabled', true);
      this.popupForm.instance.getEditor('remark').option('disabled', true);

    }

  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  async onReset(): Promise<void> {
    await this.searchForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromEstDt.value = rangeDate.fromDate;
    this.toEstDt.value = rangeDate.toDate;
    this.searchForm.instance.getEditor('custNm').focus();
    // this.searchForm.instance.getEditor('est_dt').option('value', this.gridUtil.getToday());
  }

  async onPopupSsp(): Promise<void> {

    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {

      if (await this.execSsp()) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  async execSsp(): Promise<boolean> {
    try {
      let result;

      if (this.popupFormData.review_comments === '' && this.popupMode === 'Edit') {
        const msg = '보류 사유를 적어주십시오.';
        this.utilService.notify_error(msg);
        return;
      }

      this.popupFormData["createdby"] = this.utilService.getUserUid();
      this.popupFormData["modifiedby"] = this.utilService.getUserUid();

      if (this.popupMode === 'Edit') {
        result = await this.service.mainSsp(this.popupFormData);
      }

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        // this.onSearch();
        return true;
      } else {
        return false;
      }
    } catch {
      this.utilService.notify_error('There was an error!');
      return false;
    }
    return false;
  }

  async onPopupCfm(): Promise<void> {

    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {

      if (await this.execCfm()) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  async execCfm(): Promise<boolean> {
    try {
      let result;
      console.log(this.popupFormData.review_comments);

      // if (!(this.popupFormData.review_comments === '') && this.popupMode === 'Edit') {
      //   const msg = this.utilService.convert1('sasd050.execCfm_review_comments', '보류 사유를 비워주십시오.');
      //   this.utilService.notify_error(msg);
      //   return;
      // }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      this.popupFormData["createdby"] = this.utilService.getUserUid();
      this.popupFormData["modifiedby"] = this.utilService.getUserUid();

      if (this.popupMode === 'Edit') {
        result = await this.service.mainCfm(this.popupFormData);
      }

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        // this.onSearch();
        return true;
      } else {
        return false;
      }
    } catch {
      this.utilService.notify_error('There was an error!');
      return false;
    }
    return false;

  }

  // 업로드 파일 다운로드
  onDownloadFile1(): void {
    this.bizService.portalFileDownload(this.popupFormData.phy_file_nm1, this.popupFormData.logical_file_nm1);
  }

  // 업로드 파일 삭제
  onDeleteFile1(): void {
    this.bizService.portalFileDelete(this.popupFormData.phy_file_nm1);
    this.popupFormData['phy_file_nm1'] = '';
    this.popupFormData['logical_file_nm1'] = '';
    this.phyFileNm = '';
    this.logFileNm = '';
  }

  // 업로드 파일 다운로드
  onDownloadFile2(): void {
    this.bizService.portalFileDownload(this.popupFormData.phy_file_nm2, this.popupFormData.logical_file_nm2);
  }

  // 업로드 파일 삭제
  onDeleteFile2(): void {
    this.bizService.portalFileDelete(this.popupFormData.phy_file_nm2);
    this.popupFormData['phy_file_nm2'] = '';
    this.popupFormData['logical_file_nm2'] = '';
    this.phyFileNm = '';
    this.logFileNm = '';
  }

  // 업로드 파일 다운로드
  onDownloadFile3(): void {
    this.bizService.portalFileDownload(this.popupFormData.phy_file_nm3, this.popupFormData.logical_file_nm3);
  }

  // 업로드 파일 삭제
  onDeleteFile3(): void {
    this.bizService.portalFileDelete(this.popupFormData.phy_file_nm3);
    this.popupFormData['phy_file_nm3'] = '';
    this.popupFormData['logical_file_nm3'] = '';
    this.phyFileNm = '';
    this.logFileNm = '';
  }

  // 업로드 파일 다운로드
  onDownloadFile4(): void {
    this.bizService.portalFileDownload(this.popupFormData.phy_file_nm4, this.popupFormData.logical_file_nm4);
  }

  // 업로드 파일 삭제
  onDeleteFile4(): void {
    this.bizService.portalFileDelete(this.popupFormData.phy_file_nm4);
    this.popupFormData['phy_file_nm4'] = '';
    this.popupFormData['logical_file_nm4'] = '';
    this.phyFileNm = '';
    this.logFileNm = '';
  }

  // 업로드 파일 다운로드
  onDownloadFile5(): void {
    this.bizService.portalFileDownload(this.popupFormData.phy_file_nm5, this.popupFormData.logical_file_nm5);
  }

  // 업로드 파일 삭제
  onDeleteFile5(): void {
    this.bizService.portalFileDelete(this.popupFormData.phy_file_nm5);
    this.popupFormData['phy_file_nm5'] = '';
    this.popupFormData['logical_file_nm5'] = '';
    this.phyFileNm = '';
    this.logFileNm = '';
  }


}
