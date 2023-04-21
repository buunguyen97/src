import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {PtRouteService, PtRouteVO} from './pt-route.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {BizCodeService} from '../../../shared/services/biz-code.service';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-pt-route',
  templateUrl: './pt-route.component.html',
  styleUrls: ['./pt-route.component.scss']
})
export class PtRouteComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('downloadFileBtn', {static: false}) downloadFileBtn: DxButtonComponent;
  @ViewChild('deleteFileBtn', {static: false}) deleteFileBtn: DxButtonComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  // 이미지 업로드 설정
  uploadUrl = APPCONSTANTS.BASE_URL_WM + '/receive-service/rcv/rcv/uploadFile';
  // uploadUrl = APPCONSTANTS.BASE_URL_SL + '/sales-service/azureStorage/uploadFile';
  uploadUrlImage = 'https://concplay.blob.core.windows.net/alporter/';
  legacyImage = 'https://concplay.blob.core.windows.net/alporter/';

  // 변수설정
  logFileNm: any;
  phyFileNm: any;
  fileCheck: any;
  downFileNm: any;
  fileId: any;

  // Global
  G_TENANT: any;
// ***** main ***** //
  // Form
  mainFormData: PtRouteVO = {} as PtRouteVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: PtRouteVO = {} as PtRouteVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  key = 'uid';
  selectedRows: number[];

  dsUser = [];
  dsRout = [];
  dsDeptId = [];
  dsRoutGb = [];
  dsCutYn = [];
  dsActFlg = [];
  dsItemAdminId = [];

  searchList = [];

  // Grid Popup
  changes = [];
  popupVisible = false;
  popupMode = 'Add';
  popupData: PtRouteVO = {} as PtRouteVO;


  GRID_STATE_KEY = 'mm_ptRoute';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  constructor(
    public utilService: CommonUtilService,
    public service: PtRouteService,
    public codeService: CommonCodeService,
    public gridUtil: GridUtilService,
    private bizService: BizCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);

    this.onDownloadFile = this.onDownloadFile.bind(this);

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

    // 공정ID
    this.codeService.getRoute(this.G_TENANT).subscribe(result => {
      this.dsRout = result.data;
    });

    // 공정유형
    this.codeService.getCode(this.G_TENANT, 'ROUTGB').subscribe(result => {
      this.dsRoutGb = result.data;
    });

    // 절단여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsCutYn = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  initForm(): void {
    // this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

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

    if (popupMode === 'Edit') {
      this.popupData = data;
      this.popupData = {tenant: this.G_TENANT, ...this.popupData};
      // this.popupFormData = this.popupData;
      this.popupMode = popupMode;
      this.onSearchPopup(data);

    } else {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
    }
    this.popupVisible = true;
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
        this.utilService.notify_success('search success');

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });

        // this.popupForm.instance.getEditor('itemId').option('value', data.childItemId);
        // this.popupGrid.editing.allowUpdating = true;

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
    this.onSearch();
  }

  popupShown(e): void {
    this.deleteBtn.visible = this.popupMode === 'Edit'; // 삭제버튼

    if (this.popupMode === 'Add') { // 신규
      this.popupForm.instance.getEditor('actFlg').option('value', 'Y');
      this.popupForm.instance.getEditor('cutYn').option('value', 'N');
      this.popupForm.instance.getEditor('empQty').option('value', '0');
      this.popupForm.instance.getEditor('machQty').option('value', '0');
      this.popupForm.instance.getEditor('waitTm').option('value', '0');
      this.popupForm.instance.getEditor('workTm').option('value', '0');
      this.popupForm.instance.getEditor('redyTm').option('value', '0');

    } else if (this.popupMode === 'Edit') { // 수정
    }
  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {
    const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('ptRoute', '공정표'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }
    // await this.mainGrid1.instance.saveEditData();
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      try {
        let result;
        const saveContent = this.popupData as PtRouteVO;

        saveContent.tenant = this.G_TENANT;


        console.log(saveContent);
        if (this.popupMode === 'Add') {
          result = await this.service.save(saveContent);
        } else {
          result = await this.service.update(saveContent);
        }

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
  }

  // 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('pttouteDelBtn', '공정표'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      // this.popupFormData.bomAdminDetailList = this.popupGrid.instance.getDataSource().items();

      const deleteContent = this.popupData as PtRouteVO;

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
    } catch {
      this.utilService.notify_error('There was an error!');
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
          tenant: this.G_TENANT
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 파일다운로드
  onDownloadFile(): void {
    this.bizService.fileDownload(this.popupFormData.phyFileNm);
  }

  // 파일삭제
  onDeleteFile(): void {
    this.bizService.fileDelete(this.popupFormData.logFileNm);
    this.popupFormData.phyFileNm = '';
    this.popupFormData.logFileNm = '';
  }

  onOptionChanged(e): void {
    // 파일 확장자만 추출
    const myuuid = uuidv4();
    const file = this.fileUploader.value[0];

    console.log(e.component);
    console.log(file);

    const fileExt = file.name.split('.').pop();
    this.phyFileNm = file.name;
    this.logFileNm = myuuid + '.' + fileExt;
    // this.logFileNm = this.fileCheck + '.' + fileExt;

    console.log(this.logFileNm);
    console.log(this.phyFileNm);

    // 파일 확장자 체크
    if (fileExt === 'jpg' || fileExt === 'JPG' || fileExt === 'png' || fileExt === 'PNG' || fileExt === 'gif'
      || fileExt === 'GIF' || fileExt === 'bmp' || fileExt === ('BMP')) {
      const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
      legacyImage.src = this.legacyImage + this.logFileNm;
      // legacyImage.hidden = false;

    } else {
      // 파일 확장자가 이미지 파일이 아닐시.
      const msg = '이미지 파일이 아닙니다.';
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

}
