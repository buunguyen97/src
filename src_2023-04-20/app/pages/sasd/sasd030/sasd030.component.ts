import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxButtonComponent,
  DxDataGridComponent,
  DxFileUploaderComponent,
  DxGalleryComponent,
  DxPopupComponent
} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {ItemUpVO, Sasd030Service, Sasd030VO} from './sasd030.service';
import * as XLSX from 'xlsx';
import {APPCONSTANTS} from 'src/app/shared/constants/appconstants';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-sasd030',
  templateUrl: './sasd030.component.html',
  styleUrls: ['./sasd030.component.scss']
})
export class Sasd030Component implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('fileDownloadDelete', {static: false}) fileDownloadDelete: DxFormComponent;

  @ViewChild('beginInvListGrid', {static: false}) beginInvListGrid: DxDataGridComponent;
  @ViewChild('beginInvForm', {static: false}) beginInvForm: DxFormComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('downloadFileBtn', {static: false}) downloadFileBtn: DxButtonComponent;
  @ViewChild('deleteFileBtn', {static: false}) deleteFileBtn: DxButtonComponent;

  @ViewChild('gallery1', {static: false}) gallery1: DxGalleryComponent;
  @ViewChild('gallery2', {static: false}) gallery2: DxGalleryComponent;

  @ViewChild('copyBtn', {static: false}) copyBtn: DxButtonComponent;

  // 이미지 업로드 설정
  uploadUrl = APPCONSTANTS.BASE_URL_SL + '/sales-service/azureStorage/uploadFile';
  uploadUrlImage = 'https://concplay.blob.core.windows.net/alporter/';
  uploadImage = '';

  gallery1DataSource = [];
  gallery2DataSource = [];
  dsUser = [];

  // 변수설정
  G_TENANT: any;
  mainCount: any;
  sessionUid: any;
  autocomplete: any;
  logFileNm: any;
  phyFileNm: any;
  fileCheck: any;
  downFileNm: any;
  fileId: any;

  // main설정
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainFormData: Sasd030VO = {} as Sasd030VO;
  key = 'item_cd';

  // popup설정
  popupFormData: Sasd030VO;
  firstPopupData = '';
  popupMode = 'Add';

  // 품목정보 업로드 popup설정
  itemUpPopupVisible = false;
  itemUpDataSource: DataSource;
  itemUpEntityStore: ArrayStore;
  itemUpFormData: any;
  itemUpSaveData: ItemUpVO;


  dsITEM = [];
  dsYN = [];
  dsSTOUNIT = [];
  dsPRODGB = [];
  dsITEMGROP = [];
  dsITEMGB = [];
  dsITEMTP = [];
  dsUSER = [];
  dsACCOUNTSYS = [];
  dsItemCategory1Id = [];
  dsItemCategory2Id = [];
  dsItemCategory3Id = [];

  dsSearchItemCategory2Id = [];
  dsSearchItemCategory3Id = [];
  dsActFlg = [];
  dsPopupItemCategory2Id = [];
  dsPopupItemCategory3Id = [];

  categoryChangeFlg = true;

  GRID_STATE_KEY = 'item_mst';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  // 의존성 주입
  constructor(public gridUtil: GridUtilService
    , public utilService: CommonUtilService
    , private service: Sasd030Service
    , private codeService: CommonCodeService
    , private bizService: BizCodeService) {
    this.onItemUpCancelClick = this.onItemUpCancelClick.bind(this);
    this.onItemUpSaveClick = this.onItemUpSaveClick.bind(this);
    this.onDownloadFile = this.onDownloadFile.bind(this);
    this.onCopy = this.onCopy.bind(this);
    this.onUploaded = this.onUploaded.bind(this);
  }

  // HTML 동작 완료후 호출
  ngAfterViewInit(): void {
    this.initCode();
    this.initForm();
    this.mainForm.instance.focus();
    this.utilService.getGridHeight(this.mainGrid);
  }

  // 바인딩 값을 읽을수 있다고 보장하는 상황에서 호출
  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUid = this.utilService.getUserUid();

    this.onSearchCategory1Changed = this.onSearchCategory1Changed.bind(this);
    this.onSearchCategory2Changed = this.onSearchCategory2Changed.bind(this);
    this.onPopupCategory1Changed = this.onPopupCategory1Changed.bind(this);
    this.onPopupCategory2Changed = this.onPopupCategory2Changed.bind(this);

    this.onLwhChanged = this.onLwhChanged.bind(this);
    this.onPopupItemGbChanged = this.onPopupItemGbChanged.bind(this);

    this.mainEntityStore = new ArrayStore({
      data: [],
      key: this.key
    });

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  initCode(): void {

    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    }); // 사용여부
    this.codeService.getCode(this.G_TENANT, 'PRODGB').subscribe(result => {
      this.dsPRODGB = result.data;
    }); // 생산구분
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsSTOUNIT = result.data;
    }); // CALUNIT
    this.codeService.getCode(this.G_TENANT, 'ITEMGROUP').subscribe(result => {
      this.dsITEMGROP = result.data;
    }); // 품목군
    this.codeService.getCode(this.G_TENANT, 'ITEMGB').subscribe(result => {
      this.dsITEMGB = result.data;
    }); // 품목구분
    this.codeService.getCode(this.G_TENANT, 'ITEMTP').subscribe(result => {
      this.dsITEMTP = result.data;
    }); // 품목유형
    this.codeService.getCode(this.G_TENANT, 'ACCOUNTSYS').subscribe(result => {
      this.dsACCOUNTSYS = result.data;
    }); // 회계처리시스템
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUSER = result.data;
    }); // 유저정보
    this.codeService.getItemCategory1(this.G_TENANT).subscribe(result => {
      this.dsItemCategory1Id = result.data;
    }); // 폼목카테고리1
    this.codeService.getItemCategory2(this.G_TENANT).subscribe(result => {
      this.dsItemCategory2Id = result.data;
    }); // 폼목카테고리2
    this.codeService.getItemCategory3(this.G_TENANT).subscribe(result => {
      this.dsItemCategory3Id = result.data;
    }); // 폼목카테고리3
    this.bizService.getItem(this.G_TENANT, 'Y', '', '', '', '').subscribe(result => {
      this.dsITEM = result.data;
    }); // 품목
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });                              // 사용자

  }

  // 팝업에서 딱 한번 실행될 함수 모음
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
  }

  // 팝업 오픈 후
  onPopupAfterOpen(): void {
    this.popupForm.instance.getEditor('item_cd').option('disabled', true);
    this.popupForm.instance.getEditor('barcode').option('disabled', true);
    this.sessionUid = this.utilService.getUserUid();

    // 파일 업로드 및 이미지 기본설정
    this.fileUploader.instance.reset();

    // 파일 다운로드 및 이미지 기본설정
    this.popupForm.instance.getEditor('phy_file_nm1').option('visible', false);
    this.downloadFileBtn.visible = false;
    this.deleteFileBtn.visible = false;

    // 업로드 이미지 초기화
    // var uploadImage = document.getElementById('uploadImage') as HTMLImageElement;
    // uploadImage.src = '';
    // uploadImage.hidden = true;

    const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
    if (this.popupFormData.phy_file_nm1 === null || this.popupFormData.phy_file_nm1 === undefined) {
      legacyImage.src = '';
      legacyImage.hidden = true;
    }

    if (this.popupMode === 'Add') {
      // 신규 오픈시 팝업 폼 기본값
      this.popupForm.instance.getEditor('item_gb').option('disabled', false);
      this.popupForm.instance.getEditor('item_length').option('value', '0');
      this.popupForm.instance.getEditor('item_width').option('value', '0');
      this.popupForm.instance.getEditor('item_height').option('value', '0');
      this.popupForm.instance.getEditor('item_wegh').option('value', '0');
      this.popupForm.instance.getEditor('load_wegh1').option('value', '0');
      this.popupForm.instance.getEditor('load_wegh2').option('value', '0');
      this.popupForm.instance.getEditor('make_loss_rank').option('value', '0');
      this.popupForm.instance.getEditor('sale_usd_pr').option('value', '0');
      this.popupForm.instance.getEditor('sale_krw_pr').option('value', '0');
      this.popupForm.instance.getEditor('std_cra').option('value', '0');
      this.popupForm.instance.getEditor('exp_cra').option('value', '0');
      this.popupForm.instance.getEditor('set_item_yn').option('value', 'N');
      this.popupForm.instance.getEditor('serial_yn').option('value', 'N');
      this.popupForm.instance.getEditor('use_yn').option('value', 'Y');

      legacyImage.setAttribute('style', 'display:hidden;');
      this.popupForm.readOnly = false;
    }

    if (this.popupMode === 'Edit') {
      this.popupForm.instance.getEditor('item_gb').option('disabled', true);

      // phy_file_nm1값의 유무 체크후 파일접근
      if (this.popupFormData.phy_file_nm1 !== null || this.popupFormData.phy_file_nm1 !== undefined) {
        this.popupForm.instance.getEditor('phy_file_nm1').option('visible', true);
        this.downloadFileBtn.visible = true;
        this.deleteFileBtn.visible = true;
      }
    }
    this.categoryChangeFlg = true;
    this.utilService.adjustFormHeightInPopup();
  }

  // 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      const result = await this.service.mainList(this.mainFormData);
      if (this.resultMsgCallback(result, 'Search')) {
        this.mainEntityStore = new ArrayStore({
          data: result.data,
          key: this.key
        });
        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        var keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      } else {
        return;
      }
    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  // 팝업 검색
  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);
    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;

      // 물리파일명이 있을시 이미지 불러오기
      if (this.popupFormData.phy_file_nm1) {
        var legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
        legacyImage.src = this.uploadUrlImage + (this.popupFormData.log_file_nm1 || '');
        legacyImage.hidden = false;
      } else {
        // 물리파일명이 없을시 legacyImage hidden처리
        // var uploadImage = document.getElementById('uploadImage') as HTMLImageElement;
        // uploadImage.hidden = true;
        this.popupForm.instance.getEditor('phy_file_nm1').option('visible', false);
        this.downloadFileBtn.visible = false;
        this.deleteFileBtn.visible = false;
      }
      this.firstPopupData = JSON.stringify(this.popupFormData);
    } else {
      return;
    }
  }

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;
    if (e.element.id === 'Open') {
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.popupMode = 'Edit';
      this.categoryChangeFlg = false;
      this.dsPopupItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.data.itemCategory1Id);
      this.dsPopupItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.data.itemCategory2Id);
      this.onPopupSearch(e.data).then(
        () => {
          this.popupForm.instance.getEditor('item_cd').focus();
        }
      );
    }
  }

  // 팝업창 저장
  async onPopupSave(): Promise<void> {

    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      if (await this.execSave()) {
        //this.onReset();
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  // 팝업을 닫은 후
  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.repaint();
  }

  // 실제 저장기능
  async execSave(): Promise<boolean> {
    try {
      let lastPopupData: string = JSON.stringify(this.popupFormData);

      const file = this.fileUploader.value[0];

      if (file) {
        this.phyFileNm = file.name;
      }

      // 변경사항 체크
      if (this.firstPopupData === lastPopupData && this.phyFileNm === undefined || this.firstPopupData === lastPopupData && this.phyFileNm === '') {
        this.utilService.notify_error('변경항목이 없습니다.');
        return;
      }

      if (this.popupMode === 'Add') {
        var itemGb = this.popupFormData['item_gb'];
        var itemCd = this.popupFormData['item_cd'];
        if (!(itemGb === '03' || itemGb === '05') && !itemCd) {
          this.utilService.notify_error(this.utilService.convert('제품코드는 필수입력 항목입니다.'));
          this.popupForm.instance.getEditor('item_cd').focus();
          return;
        }
      }

      let result;

      this.popupFormData['createdby'] = this.sessionUid;
      this.popupFormData['modifiedby'] = this.sessionUid;

      let resultCount;

      resultCount = await this.service.mainValidation(this.popupFormData);
      this.mainCount = resultCount.data;

      if (this.mainCount.count === 1 && this.popupMode === 'Add') {
        this.utilService.notify_error(this.utilService.convert('중복된 제품코드입니다.'));
        this.popupForm.instance.getEditor('item_cd').focus();
        return;
      }

      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      } else {

        this.popupFormData['log_file_nm1'] = this.popupFormData.log_file_nm1; // logFileNm의 값을 popupformdata['log_file_nm1']에 넣어서 DB저장
        this.popupFormData['phy_file_nm1'] = this.popupFormData.phy_file_nm1; // phyFileNm의 값을 popupformdata['phy_file_nm1']     ""
        this.logFileNm = undefined;                         // logFileNm의 값을 초기화.
        this.phyFileNm = undefined;                         // phyFileNm의 값을 초기화.
      }

      const saveContent = this.popupFormData as any;

      if (this.fileUploader.value[0]) {

        // 이미지 교체일 경우 기존 이미지 삭제
        if (this.popupFormData.log_file_nm1) {
          const res = await this.service.deleteFile(this.popupFormData.log_file_nm1);
        }

        saveContent.file = this.fileUploader.value[0];

        const myuuid = uuidv4();

        const fileExt = file.name.split('.').pop();
        this.phyFileNm = file.name;
        this.logFileNm = myuuid;
        // this.logFileNm = myuuid + '.' + fileExt;

        this.popupFormData.phy_file_nm1 = this.phyFileNm;
        this.popupFormData.log_file_nm1 = this.logFileNm + '.' + fileExt;

        this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'logFileNm', this.logFileNm);
      }


      if (this.popupMode === 'Add') { //popupMode가 Add로 들어오면
        result = await this.service.mainInsert(this.popupFormData);//서비스의 세이브로
      } else {
        result = await this.service.mainUpdate(this.popupFormData)//그외엔 업데이트로
      }

      if (this.resultMsgCallback(result, 'Save')) {

        if (this.fileUploader.value[0]) {
          const formData = new FormData(document.forms.namedItem('uploadForm'));
          formData.append('newFileName', this.logFileNm);

          const fileResult = this.service.uploadFile(formData);
        }

        // 물류 제품 송신 I/F
        var vo = {
          sendType: "item"
        };

        let apiResult = await this.bizService.sendApi(vo);

        if (!apiResult.success) {
          this.utilService.notify_error(JSON.stringify(apiResult));
          //return;
        } else {
          console.log("I/F Success");
        }

        this.popupFormData = result.data;
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

  // 리셋
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.mainForm.instance.focus();
  }

  initForm(): void {
    this.mainForm.instance.getEditor('use_yn').option('value', 'Y');
    this.mainForm.instance.focus();
  }

  // 품목카테고리 change
  onSearchCategory1Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory2Id').option('value', null);
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);

    this.dsSearchItemCategory2Id = this.dsItemCategory2Id.filter(el => el.itemCategory1Id === e.value);
  }

  // 품목카테고리 change2
  onSearchCategory2Changed(e): void {
    this.mainForm.instance.getEditor('itemCategory3Id').option('value', null);
    this.dsSearchItemCategory3Id = this.dsItemCategory3Id.filter(el => el.itemCategory2Id === e.value);
  }

  onPopupItemGbChanged(e): void {
    // 제품, 상품은 품목코드 자동채번이므로 품목코드 비활성화
    if (this.popupMode == "Add") {
      if (e.value == "03" || e.value == "05") {
        this.popupForm.instance.getEditor('item_cd').option('disabled', true);
        this.popupForm.instance.getEditor('barcode').option('disabled', true);
      } else {
        this.popupForm.instance.getEditor('item_cd').option('disabled', false);
        this.popupForm.instance.getEditor('barcode').option('disabled', false);
      }
    }
  }

  // 바코드 제어
  onPopupBarcordeChanged(e): void {
    // 제품, 상품은 품목코드 자동채번이므로 품목코드 비활성화
    if (this.popupMode === 'Add') {
      if (e.value === '03' || e.value === '05') {
        this.popupForm.instance.getEditor('barcode').option('disabled', true);
      } else {
        this.popupForm.instance.getEditor('barcode').option('disabled', false);
      }
    }
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

  // 규격
  onLwhChanged(e): void {
    if (this.popupForm) {
      var specNm = this.popupForm.instance.getEditor('item_length').option('value') + 'X' + this.popupForm.instance.getEditor('item_width').option('value') + 'X' + this.popupForm.instance.getEditor('item_height').option('value');
      var itemCbm = this.popupForm.instance.getEditor('item_length').option('value') / 1000 * this.popupForm.instance.getEditor('item_width').option('value') / 1000 * this.popupForm.instance.getEditor('item_height').option('value') / 1000;
      this.popupForm.instance.getEditor('spec_nm').option('value', specNm);
      this.popupForm.instance.getEditor('item_cbm').option('value', Math.trunc(itemCbm * 1000) / 1000);
    }
  }

  // 규격 표현식
  async initSpec(): Promise<void> {
    const input = document.getElementsByName('spec_nm').item(0) as HTMLInputElement;
    this.mainFormData.spec_nm = input.value;
    input.addEventListener('change', () => {
    });
  }

  // 메세지라인 함수
  resultMsgCallback(result, msg): boolean {
    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  // 품목정보 업로드 팝업 툴바
  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('serialTemplete', '양식다운로드'),
        onClick: this.downloadExcel.bind(this)
      }
    });
    e.toolbarOptions.items = newToolbarItems;
  }

  // 엑셀 다운로드
  async downloadExcel(): Promise<void> {
    this.service.download();
  }

  /**
   *   기초재고 업로드 추가
   */
  async onBeginInvClick(e): Promise<void> {
    this.itemUpPopupVisible = true;
  }

  onItemUpPopupClose(e): void {
    this.beginInvForm.instance.resetValues();

    if (!!this.itemUpDataSource) {
      this.itemUpEntityStore.clear();
      this.itemUpDataSource.reload();
      this.fileUploader.instance.reset();
    }
  }

  // 업로드 저장
  async onItemUpSaveClick(): Promise<void> {
    const dataItems = this.itemUpDataSource.items();
    console.log(dataItems);
    if ((dataItems !== undefined) && (dataItems.length > 0)) {
      try {

        // 유효성 체크 실패한 건이 있는지 체크
        const maxItem = dataItems.reduce(function (prev, current) {
          return (prev.err_msg > current.err_msg) ? prev : current
        });

        if (maxItem.err_msg) {
          var msg = "오류를 확인하여 주세요.";
          if (this.utilService.getLanguage() != 'ko') {
            msg = "Please check for errors.";
          }
          this.utilService.notify_error(msg);
          return;
        }

        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_save'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        this.itemUpSaveData = {tenant: this.G_TENANT, ...this.itemUpSaveData};
        const saveContent = this.itemUpSaveData as ItemUpVO;
        saveContent.itemList = dataItems;
        saveContent.createdby = this.sessionUid;
        saveContent.modifiedby = this.sessionUid;
        const result = await this.service.saveItemUp(saveContent);
        if (result.success) {
          if (this.resultMsgCallback(result, 'Save')) {
            // 물류 제품 송신 I/F
            var vo = {sendType: "item"};
            let apiResult = await this.bizService.sendApi(vo);

            if (!apiResult.success) {
              this.utilService.notify_error(JSON.stringify(apiResult));
            } else {
              console.log("Save success, I/F Success");
              this.itemUpDataSource.reload();
              this.utilService.notify_success('Save success, I/F Success');
              this.itemUpPopupVisible = false;
            }
          }
        } else {
          this.utilService.notify_error(result.msg);
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  onItemUpCancelClick(): void {
    this.itemUpPopupVisible = false;
  }

  // 액셀파일 업로더
  async onItemUpFileUploader(fileUploader: DxFileUploaderComponent): Promise<void> {

    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = fileUploader.value[0];

    if (!file) {
      return;
    }

    let sheetContentList = [];
    reader.onload = async (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      sheetContentList = mapData.Sheet1;
      sheetContentList = sheetContentList.slice(1);

      this.itemUpSaveData = {tenant: this.G_TENANT, ...this.itemUpSaveData};
      const checkContent = this.itemUpSaveData as ItemUpVO;

      checkContent.itemList = sheetContentList;
      checkContent.prog_id = "SASD030";
      checkContent.uid = this.sessionUid;

      let result;
      result = await this.service.itemUpCheck(checkContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.itemUpEntityStore = new ArrayStore({
          data: result.data.excelCheckList,
          key: ['item_nm', 'item_short_nm']
        });
        this.itemUpDataSource = new DataSource({
          store: this.itemUpEntityStore
        });
        this.itemUpDataSource.reload();
      }
    };
    reader.readAsBinaryString(file);
  }

  onItemUpResetFileUploader(fileUploader: DxFileUploaderComponent): void {

    this.itemUpEntityStore.clear();
    this.itemUpDataSource.reload();
    fileUploader.instance.reset();

    this.itemUpEntityStore = new ArrayStore(
      {data: [], key: 'uid'});

    this.itemUpDataSource = new DataSource({
      store: this.itemUpEntityStore
    });
  }

  onUploaded(e): void {
    // 파일 확장자만 추출
    // let fileExt = e.file.name.split(".").pop();
    // this.phyFileNm = e.file.name;
    // this.logFileNm = this.fileCheck + '.' + fileExt;
    //
    // // 파일 확장자 체크
    // if (fileExt == 'jpg' || fileExt == 'JPG' || fileExt == 'png' || fileExt == 'PNG' || fileExt == 'gif' || fileExt == 'GIF' || fileExt == 'bmp' || fileExt == ('BMP')) {
    //   var uploadImage = document.getElementById("uploadImage") as HTMLImageElement;
    //   uploadImage.src = this.uploadUrlImage + this.logFileNm;
    //   uploadImage.hidden = false;
    //
    // } else {
    //   // 파일 확장자가 이미지 파일이 아닐시.
    //   const msg = "이미지 파일이 아닙니다."
    //   this.utilService.notify_error(msg);
    //   this.fileUploader.instance.reset();
    //   // 변수 값을 전부 비워준다.
    //   this.phyFileNm = "";
    //   this.logFileNm = "";
    //   // 이미지 숨김 처리
    //   uploadImage.hidden = true;
    //   return;
    // }

  }

  generateFileNm(e): void {
    this.bizService.getSaleFileId('sasd030').subscribe(result => {
      this.fileId = result.data['file_id'];
    });
    this.fileCheck = this.fileId;
    this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'newFileName', this.fileCheck);
    e.component.option('uploadUrl', this.uploadUrl);

    // const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
    //
    // legacyImage.src = '';
    // legacyImage.hidden = true;
  }

  updateQueryStringParameter(uri, key, value): any {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + value + '$2');
    } else {
      return uri + separator + key + '=' + value;
    }
  }

  // 파일다운로드
  onDownloadFile(): void {
    this.bizService.fileDownload(this.popupFormData.log_file_nm1);
  }

  // 파일삭제
  onDeleteFile(): void {
    this.bizService.fileDelete(this.popupFormData.log_file_nm1);
    this.popupFormData['phy_file_nm1'] = '';
    this.popupFormData['log_file_nm1'] = '';
  }

  async onCopy(): Promise<void> {
    // this.deleteBtn.visible = false;
    this.popupForm.instance.getEditor('item_cd').option('value', '');
    this.popupForm.instance.getEditor('item_gb').option('disabled', false);

    if (this.popupForm.instance.getEditor('item_gb').option('value') === '03') {
      this.popupForm.instance.getEditor('item_cd').option('disabled', true);
    } else {
      this.popupForm.instance.getEditor('item_cd').option('disabled', false);

    }

    this.popupMode = 'Add';

  }

}
