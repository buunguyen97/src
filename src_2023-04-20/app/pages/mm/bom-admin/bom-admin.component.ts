import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxFileUploaderComponent,
  DxGalleryComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {BomAdminService, BomAdminVO} from './bom-admin.service';
import {MmCommonUtils} from '../mmCommonUtils';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {v4 as uuidv4} from 'uuid';
import {DxoGroupingComponent} from 'devextreme-angular/ui/nested';

@Component({
  selector: 'app-bom-admin',
  templateUrl: './bom-admin.component.html',
  styleUrls: ['./bom-admin.component.scss']
})
export class BomAdminComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('downloadFileBtn', {static: false}) downloadFileBtn: DxButtonComponent;
  @ViewChild('deleteFileBtn', {static: false}) deleteFileBtn: DxButtonComponent;

  @ViewChild('gallery1', {static: false}) gallery1: DxGalleryComponent;
  @ViewChild('gallery2', {static: false}) gallery2: DxGalleryComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('revisionBtn', {static: false}) revisionBtn: DxButtonComponent;
  @ViewChild('copyBtn', {static: false}) copyBtn: DxButtonComponent;
  @ViewChild('actFlgBtn', {static: false}) actFlgBtn: DxButtonComponent;

  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  @ViewChild('expand', {static: true}) expand: DxoGroupingComponent;


  // 이미지 업로드 설정
  uploadUrl = APPCONSTANTS.BASE_URL_WM + '/master-service/azureStorage/uploadFile';
  // uploadUrl = APPCONSTANTS.BASE_URL_SL + '/sales-service/azureStorage/uploadFile';
  uploadUrlImage = 'https://concplay.blob.core.windows.net/alporter/';
  legacyImage = 'https://concplay.blob.core.windows.net/alporter/';

  uploadImage = '';

  // 변수설정
  logFileNm: any;
  phyFileNm: any;
  fileCheck: any;
  downFileNm: any;
  fileId: any;
  revisionFlg = false;
  lossRateFlg = false;

  // Global
  G_TENANT: any;
// ***** main ***** //
  // Form
  mainFormData: BomAdminVO = {} as BomAdminVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: BomAdminVO = {} as BomAdminVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  treeKey = 'uid';
  key = 'path';
  selectedRows: number[];

  dsItemAdminId = [];
  dsUnitStyle = [];
  dsItemId = [];
  dsUser = [];
  dsFilteredItemId = [];
  dsSpec = [];
  dsActFlg = [];
  dsRevision = [];
  dsfilteredRevision = [];

  searchList = [];

  // Grid Popup
  changes = [];
  popupVisible = false;
  popupMode = 'Add';
  popupData: BomAdminVO = {} as BomAdminVO;
  popupKey = 'uid';
  firstPopupData = '';

  categoryChangeFlg = true;

  GRID_STATE_KEY = 'mm_bomAdmin1';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');


  isOpenedPopup = false;  // 팝업호출 여부
  constructor(
    public utilService: CommonUtilService,
    public service: BomAdminService,
    public codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.setItemValue = this.setItemValue.bind(this);

    this.onDownloadFile = this.onDownloadFile.bind(this);
    this.onOptionChanged = this.onOptionChanged.bind(this);
    this.onRevision = this.onRevision.bind(this);
    this.getFilteredRevision2 = this.getFilteredRevision2.bind(this);
    this.onLossRateChanged = this.onLossRateChanged.bind(this);
    this.onActFlg = this.onActFlg.bind(this);
    this.selectionChanged = this.selectionChanged.bind(this);
    this.onCopy = this.onCopy.bind(this);
  }

  ngOnInit(): void {
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainDataSource = new DataSource({
      store: this.mainEntityStore
    });

    this.expand.autoExpandAll = false;

  }

  ngAfterViewInit(): void {
    // 팝업 그리드 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [], key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initCode(): void {
    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(r => {
      this.dsUnitStyle = r.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
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

    // revision
    this.codeService.getRevision(this.G_TENANT).subscribe(result => {
      this.dsRevision = result.data;
      // this.dsfilteredRevision = this.dsRevision.filter(el => el.revision === this.utilService.getCommonItemId());
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  initForm(): void {
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      this.searchList = result.data;

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        result.data.forEach(el => {

          let level = Number(el.level);

          while (level > 0) {
            if (level === Number(el.level)) {
              el.childItemName = '' + el.childItemName;
            }

            el.childItemName = '►' + el.childItemName;

            level--;
          }
        });

        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.mainDataSource = new DataSource({
          store: this.mainEntityStore
        });
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
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


  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.revisionFlg = true;
    this.showPopup('Add', {...e.data});
  }

  showPopup(popupMode, data): void {
    this.changes = [];  // 초기화
    this.popupEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.popupDataSource = new DataSource({
      store: this.popupEntityStore
    });
    this.popupVisible = true;
    if (popupMode === 'Edit') {
      this.popupData = data;
      this.popupData = {tenant: this.G_TENANT, ...this.popupData};
      this.popupFormData = this.popupData;
      this.popupMode = popupMode;
      // this.popupForm.readOnly = true;

      this.onSearchPopup(data);

    } else {
      this.revisionBtn.visible = false;
      this.copyBtn.visible = false;
      this.actFlgBtn.visible = false;
      this.deleteBtn.visible = false;
      // this.popupForm.readOnly = false;
      // this.popupGrid.editing.allowUpdating = true;
      this.revisionFlg = true;

      this.popupMode = 'Add';
    }

  }

  // 팝업 그리드 조회
  async onSearchPopup(data): Promise<void> {
    if (this.popupData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getFull(this.popupData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.popupKey
          }
        );
        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });

        this.popupForm.instance.getEditor('itemId').option('value', data.childItemId);
        this.popupGrid.editing.allowUpdating = false;

        if (this.revisionFlg === false) {
          this.popupForm.readOnly = true;
          this.popupForm.instance.getEditor('lossRate').option('readOnly', true);
        } else {
          this.popupForm.readOnly = false;
        }

        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;


        // 물리파일명이 있을시 이미지 불러오기
        if (this.popupFormData.phyFileNm) {
          const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
          legacyImage.src = this.uploadUrlImage + this.popupFormData.logFileNm;
          legacyImage.setAttribute('style', 'display:block;');

          // legacyImage.hidden = false;

        } else {
          // 물리파일명이 없을시 legacyImage hidden처리
          // const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
          // legacyImage.hidden = true;
          this.popupForm.instance.getEditor('phyFileNm').option('visible', false);
          this.downloadFileBtn.visible = false;
          this.deleteFileBtn.visible = false;

        }
        // this.firstPopupData = JSON.stringify(this.popupFormData);
      }
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {

    let data;

    console.log(e.data.key);
    if (!e.data.key) {
      data = {...e.data};
    } else {
      if (!e.data.collapsedItems) {
        data = e.data.items[0];

        console.log(e.data.items[0]);
      } else {
        data = e.data.collapsedItems[0];
        console.log(e.data.collapsedItems[0]);
      }
    }

    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', data);

  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.revisionFlg = false;
    this.lossRateFlg = false;

    // this.onSearch();
  }

  popupShown(e): void {

    this.lossRateFlg = false;

    // revision
    this.codeService.getRevision(this.G_TENANT).subscribe(result => {
      this.dsRevision = result.data;
    });

    // this.utilService.getPopupGridHeight(this.popupGrid, this.popup, -40);
    this.deleteBtn.visible = this.popupMode === 'Edit'; // 삭제버튼
    this.revisionBtn.visible = this.popupMode === 'Edit';  // 리비전 버튼
    this.copyBtn.visible = this.popupMode === 'Edit';  // 리비전 버튼
    this.actFlgBtn.visible = this.popupMode === 'Edit'; // 활성화 버튼

    // 파일 업로드 및 이미지 기본설정
    this.fileUploader.instance.reset();

    // 파일 다운로드 및 이미지 기본설정
    this.popupForm.instance.getEditor('phyFileNm').option('visible', false);
    this.downloadFileBtn.visible = false;
    this.deleteFileBtn.visible = false;

    // 업로드 이미지 초기화
    const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
    legacyImage.src = '';
    legacyImage.hidden = true;

    if (this.popupFormData.phyFileNm === null || this.popupFormData.phyFileNm === undefined) {
      legacyImage.src = '';
      legacyImage.setAttribute('style', 'display:none;');
      // const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
      // legacyImage.hidden = true;
    }

    if (this.popupMode === 'Add') { // 신규
      this.revisionFlg = true;
      this.popupForm.instance.getEditor('lossRate').option('value', '0');
      this.popupForm.instance.getEditor('actFlg').option('value', 'Y');
      this.popupForm.instance.getEditor('childRevision').option('value', '0');

      legacyImage.setAttribute('style', 'display:hidden;');
      this.popupForm.readOnly = false;
      this.popupGrid.editing.allowUpdating = true;

    } else if (this.popupMode === 'Edit') { // 수정
      const confirmedBtn = this.popup.toolbarItems[0];
      let opt = {};

      if (this.popupFormData.actFlg === 'Y') {
        opt = {
          text: this.utilService.convert1('bomadmin_msg_actFlg', '비활성화'),
          type: 'normal',
          onClick: this.onActFlg,
        };
        this.saveBtn.visible = true;
      } else {

        opt = {
          text: this.utilService.convert1('bomadmin_msg_cancelActFlg', '활성화'),
          type: 'normal',
          onClick: this.onActFlg,
        };
      }
      confirmedBtn.options = opt;

      // phy_file_nm1값의 유무 체크후 파일접근
      if (this.popupFormData.phyFileNm !== null) {
        this.popupForm.instance.getEditor('phyFileNm').option('visible', true);
        this.downloadFileBtn.visible = true;
        this.deleteFileBtn.visible = false;

        // tslint:disable-next-line:no-shadowed-variable
        const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
        legacyImage.src = this.legacyImage + this.popupFormData.logFileNm;

        legacyImage.hidden = false;

      }
    }
    this.categoryChangeFlg = true;
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh

    this.utilService.getGridHeight(this.popupGrid);
    // 팝업 여백 조정
    if (!this.isOpenedPopup) {
      this.isOpenedPopup = true;
    } else {
      this.utilService.adjustFormHeightInPopup();
    }

    // this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {

    if (this.popupMode === 'Add') {
      this.revisionFlg = true;
    }

    // await this.mainGrid1.instance.saveEditData();
    const popData = this.popupForm.instance.validate();

    if (this.popupForm.instance.getEditor('itemId').option('value') === null) {
      this.utilService.notify_error('모품목을 선택해주세요.');
      return;
    }

    if (popData.isValid && this.revisionFlg === true) {
      try {
        let result;

        const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const saveContent = this.popupData as BomAdminVO;
        // this.popupFormData.bomAdminDetailList = this.popupGrid.instance.getDataSource().items();
        // await this.popupGrid.instance.saveEditData();
        const detailList = this.collectGridData(this.changes);

        if (this.changes.length === 0 && this.lossRateFlg === false) {
          // 파일만 수정했을 때
          if (this.fileUploader.value[0].name !== this.popupData.phyFileNm) {
            const msg = this.utilService.convert1('confirmSaveOnlyFile', '파일정보만 수정하시겠습니까?');
            if (!await this.utilService.confirm(msg)) {
              return;
            }
            if (this.fileUploader.value[0]) {
              const myuuid = uuidv4();
              const file = this.fileUploader.value[0];

              const fileExt = file.name.split('.').pop();
              this.phyFileNm = file.name;
              this.logFileNm = myuuid + '.' + fileExt;

              this.popupFormData.logFileNm = this.logFileNm;
              this.popupFormData.phyFileNm = this.phyFileNm;

              this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'logFileNm', this.logFileNm);

              const formData = new FormData(document.forms.namedItem('uploadForm'));
              formData.append('logFileNm', this.logFileNm);

              this.popupFormData.childRevision = this.popupForm.instance.getEditor('childRevision').option('value');

              await this.service.updateFile(this.popupFormData);
              await this.service.uploadFile(formData);

              this.utilService.notify_success('Save success');
              this.popupForm.instance.resetValues();
              this.popupVisible = false;
              this.onSearch();
            }
            return;
          }

          this.utilService.notify_error('수정된 내용이 없습니다.');
          return;
        }

        await this.popupGrid.instance.saveEditData();

        for (const detail of this.popupGrid.instance.getDataSource().items()) {
          if (detail.childItemId === this.popupForm.instance.getEditor('itemId').option('value')) {
            const msg = this.utilService.convert1('childitemIdError', '자품목에 모품목과 동일한 품목이 있습니다.');
            await this.utilService.notify_error(msg);
            return;
          }
          if (detail.childItemId == null) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert('bomadmin_childItem'));
            this.utilService.notify_error(msg);
            return;
          }
          if (detail.reQty <= 0) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert('bomadmin_reQty'));
            this.utilService.notify_error(msg);
            return;
          }
          if (detail.actFlg == null) {
            const msg = this.utilService.convert('com_valid_required', this.utilService.convert('mm_itemadmin_actFlg'));
            this.utilService.notify_error(msg);
            return;
          }
        }

        saveContent.bomAdminDetailList = detailList;

        const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('BOM', 'BOM'));
        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        } else {

          console.log(this.popupFormData);
          console.log(this.logFileNm);
          this.popupFormData.logFileNm = this.logFileNm; // logFileNm의 값을 popupformdata['log_file_nm1']에 넣어서 DB저장
          this.popupFormData.phyFileNm = this.phyFileNm; // phyFileNm의 값을 popupformdata['phy_file_nm1']     ""
          this.logFileNm = undefined;                         // logFileNm의 값을 초기화.
          this.phyFileNm = undefined;                         // phyFileNm의 값을 초기화.
        }

        saveContent.itemAdminId = itemAdminId;
        saveContent.tenant = this.G_TENANT;

        if (this.fileUploader.value[0]) {
          saveContent.file = this.fileUploader.value[0];

          const myuuid = uuidv4();
          const file = this.fileUploader.value[0];

          const fileExt = file.name.split('.').pop();
          this.phyFileNm = file.name;
          this.logFileNm = myuuid + '.' + fileExt;

          this.popupFormData.logFileNm = this.logFileNm;
          this.popupFormData.phyFileNm = this.phyFileNm;

          this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'logFileNm', this.logFileNm);
        }
        this.popupFormData.childRevision = this.popupForm.instance.getEditor('childRevision').option('value');
        saveContent.childRevision = this.popupFormData.childRevision;
        console.log(saveContent);

        result = await this.service.save(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);

          return;
        } else {
          if (this.fileUploader.value[0]) {
            const formData = new FormData(document.forms.namedItem('uploadForm'));
            formData.append('logFileNm', this.logFileNm);

            await this.service.uploadFile(formData);
          }

          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }

      } catch (e) {
        console.log(e.toString());
        this.utilService.notify_error('There was an error!');
      }
    } else {
      this.utilService.notify_error('Revision 버튼을 눌러주세요.');
    }
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('bomAdmin', '부품구성표'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      this.popupFormData.bomAdminDetailList = this.popupGrid.instance.getDataSource().items();

      const deleteContent = this.popupFormData as BomAdminVO;

      console.log(deleteContent);

      const result = await this.service.delete(deleteContent);
      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Delete success');
        this.popupForm.instance.resetValues();
        this.popupVisible = false;
        this.onSearch();
      }
    } catch (e) {
      console.log(e.toString());
      this.utilService.notify_error('There was an error!');
    }
  }

  // 추가버튼 이벤트
  async addClick(): Promise<void> {

    if (this.revisionFlg === false && this.popupMode === 'Edit') {
      await this.utilService.notify_error('Revision 버튼을 눌러주세요.');
      return;
    }

    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
      // this.popupGrid.instance.cellValue(rowIdx, 'insert');
    });
  }

  // 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  // changes -> savedata 변환
  collectGridData(changes: any): any[] {
    const gridList = [];
    const byKeyData = this.popupGrid.instance.getVisibleRows();

    // tslint:disable-next-line:forin
    for (const rowIndex in byKeyData) {

      gridList.push(
        {
          uid: null,
          childItemId: byKeyData[rowIndex].data.childItemId,
          childRevision: byKeyData[rowIndex].data.childRevision,
          spec: byKeyData[rowIndex].data.spec,
          unit: byKeyData[rowIndex].data.unit,
          reQty: byKeyData[rowIndex].data.reQty,
          actFlg: byKeyData[rowIndex].data.actFlg,
          // lengthYn: byKeyData[rowIndex].data.lengthYn,
          remarks: byKeyData[rowIndex].data.remarks
        }
      );

    }
    return gridList;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 그리드 Lookup filter 품목
  getFilteredItemId(options): any {
    return {
      store: this.dsItemId,
      filter: options.data ? ['itemAdminId', '=', options.data.itemAdminId] : null
    };
  }

  // 그리드 품목 선택시 시리얼 여부
  async setItemValue(rowData: any, value: any): Promise<void> {
    rowData.childItemId = value;
    rowData.spec = this.dsItemId.filter(el => el.uid === value)[0].spec;        // 규격 가져오기
    rowData.unit = this.dsItemId.filter(el => el.uid === value)[0].unit3Stylecd;

    let logFileNm = '';
    let phyFileNm = '';

    // tslint:disable-next-line:no-shadowed-variable
    await this.service.findFileNm(rowData).then((result) => {
      logFileNm = result.data.logFileNm;
      phyFileNm = result.data.phyFileNm;
    });
    rowData.childPhyFileNm = phyFileNm;
    rowData.childLogFileNm = logFileNm;
  }

  onInitNewRow(e): void {
    // e.data.itemAdminId = this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : null;
    e.data.actFlg = MmCommonUtils.FLAG_TRUE;
    e.data.reQty = 0;
    // e.data.lengthYn = MmCommonUtils.FLAG_FALSE;
    e.data.childRevision = 0;
  }

  onLossRateChanged(e): void {
    this.lossRateFlg = true;
  }


  onOptionChanged(e): void {
    // 파일 확장자만 추출
    // const myuuid = uuidv4();
    const file = this.fileUploader.value[0];

    if (!file) {
      this.revisionFlg = false;
      return;
    }

    const fileExt = file.name.split('.').pop();
    // this.phyFileNm = file.name;
    // this.logFileNm = myuuid + '.' + fileExt;
    // this.logFileNm = this.fileCheck + '.' + fileExt;

    // 파일 확장자 체크
    if (fileExt === 'jpg' || fileExt === 'JPG' || fileExt === 'png' || fileExt === 'PNG' || fileExt === 'gif'
      || fileExt === 'GIF' || fileExt === 'bmp' || fileExt === ('BMP') || fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'cvs') {
      const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
      // legacyImage.src = this.legacyImage + this.logFileNm;
      // legacyImage.hidden = false;
      legacyImage.setAttribute('style', 'display:none;');
      this.popupForm.instance.getEditor('phyFileNm').option('visible', false);
      this.downloadFileBtn.visible = false;
      this.deleteFileBtn.visible = false;
      this.revisionFlg = true;

    } else {
      // 파일 확장자가 이미지 파일이 아닐시.
      const msg = '업로드할 수 없는 파일입니다.';
      this.utilService.notify_error(msg);
      this.fileUploader.instance.reset();
      // 변수 값을 전부 비워준다.
      this.phyFileNm = '';
      this.logFileNm = '';
      // 이미지 숨김 처리
      // uploadImage.hidden = true;
      return;
    }
  }

  generateFileNm(e): void {

    // this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'newFileName', this.logFileNm);
    //
    // e.component.option('uploadUrl', this.uploadUrl);

    // this.bizService.getSaleFileId('ptBom').subscribe(result => { this.fileId = result.data.file_id; });
    // this.fileCheck = this.fileId;
    // this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'newFileName', this.fileCheck);
    // e.component.option('uploadUrl', this.uploadUrl);

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
    this.utilService.download(this.popupFormData.logFileNm, this.popupFormData.phyFileNm);
  }

  // 파일다운로드
  onDownloadFile2(): void {
    const idx = this.popupGrid.focusedRowIndex;
    const phyFileNm = this.popupGrid.instance.cellValue(idx, 'childPhyFileNm');
    const logFileNm = this.popupGrid.instance.cellValue(idx, 'childLogFileNm');

    this.utilService.download(logFileNm, phyFileNm);
  }

  // 파일삭제
  async onDeleteFile(): Promise<void> {

    const confirmMsg = this.utilService.convert1('ptbom_deletefile', '파일을 삭제하시겠습니까?');
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    } else {

      const deleteContent = this.popupFormData as BomAdminVO;

      const result = await this.service.deleteFileDb(deleteContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {

        this.service.deleteFile(deleteContent);
        this.popupFormData.phyFileNm = '';
        this.popupFormData.logFileNm = '';

        // 업로드 이미지 초기화
        const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;

        legacyImage.setAttribute('style', 'display:none;');
      }
    }
  }

  async onRevision(): Promise<void> {
    if (this.revisionFlg === true) {
      return;
    }

    const result = await this.service.findRevision(this.popupFormData);

    this.popupForm.instance.getEditor('childRevision').option('value', Number(result.data.revision) + 1);
    this.popupGrid.editing.allowUpdating = true;
    // this.popupForm.readOnly = false;
    this.popupForm.instance.getEditor('lossRate').option('readOnly', false);
    if (this.popupFormData.phyFileNm) {

      this.deleteFileBtn.visible = true;
    }
    this.revisionFlg = true;
  }

  async onCopy(): Promise<void> {
    this.deleteBtn.visible = false;
    this.actFlgBtn.visible = false;
    this.revisionBtn.visible = false;
    this.revisionFlg = true;

    this.popupForm.instance.getEditor('lossRate').option('value', '0');
    this.popupForm.instance.getEditor('actFlg').option('value', 'Y');
    this.popupForm.instance.getEditor('childRevision').option('value', '0');

    this.popupForm.readOnly = false;
    this.popupGrid.editing.allowUpdating = true;

    this.popupMode = 'Add';

  }


  async onActFlg(element): Promise<void> {

    const saveContent = this.popupData as BomAdminVO;
    let confirmMsg;

    if (saveContent.actFlg === 'Y') {
      confirmMsg = this.utilService.convert1('bomadmin_onActFlg_cancle', '비활성화시키겠습니까?');

    } else {
      confirmMsg = this.utilService.convert1('bomadmin_onActFlg_confirm', '활성화시키겠습니까?');
    }
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    saveContent.itemAdminId = this.popupFormData.itemAdminId;
    saveContent.childRevision = this.popupFormData.childRevision;

    console.log(saveContent);

    const result = await this.service.update(saveContent);

    if (!result.success) {
      this.utilService.notify_error(result.msg);

      return;
    }

    this.utilService.notify_success('Save success');
    this.popupForm.instance.resetValues();
    this.popupVisible = false;
    this.onSearch();

  }

  // 그리드 Lookup filter 품목
  // 품목에 따른 lot번호 필터
  getFilteredRevision2(options): any {
    const filter = [];
    const idx = this.popupGrid.focusedRowIndex;
    // filter.push(['itemAdminId', '=', this.utilService.getCommonItemAdminId()]);
    filter.push(['childItemId', '=', this.popupGrid.instance.cellValue(idx, 'childItemId')]);

    // console.log(this.popupGrid.instance.cellValue(idx, 'childItemId'));

    return {
      store: this.dsRevision,
      filter: options.data ? filter : null
    };
  }

  isButtonVisible(e): boolean {
    return e.row.data.childPhyFileNm;
  }

  selectionChanged(e): void {

    console.log(e);
    e.component.collapseAll(-1);
    // e.component.expandRow(e.currentSelectedRowKeys[0]);
  }

}

