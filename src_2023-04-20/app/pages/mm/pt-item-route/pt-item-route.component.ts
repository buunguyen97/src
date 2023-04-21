import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {PtItemRouteDetailVO, PtItemRouteService, PtItemRouteVO} from './pt-item-route.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import {v4 as uuidv4} from 'uuid';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';
import {BizCodeService} from '../../../shared/services/biz-code.service';

@Component({
  selector: 'app-pt-item-route',
  templateUrl: './pt-item-route.component.html',
  styleUrls: ['./pt-item-route.component.scss']
})
export class PtItemRouteComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;
  @ViewChild('downloadFileBtn', {static: false}) downloadFileBtn: DxButtonComponent;
  @ViewChild('deleteFileBtn', {static: false}) deleteFileBtn: DxButtonComponent;

  @ViewChild('imagePopup', {static: false}) imagePopup: DxPopupComponent;
  @ViewChild('imagePopupForm', {static: false}) imagePopupForm: DxFormComponent;
  @ViewChild('fileUploader2', {static: false}) fileUploader2: DxFileUploaderComponent;
  @ViewChild('downloadFileBtn2', {static: false}) downloadFileBtn2: DxButtonComponent;
  @ViewChild('deleteFileBtn2', {static: false}) deleteFileBtn2: DxButtonComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;


  // 이미지 업로드 설정
  uploadUrl = APPCONSTANTS.BASE_URL_WM + '/master-service/azureStorage/uploadFile';
  // uploadUrl = APPCONSTANTS.BASE_URL_SL + '/sales-service/azureStorage/uploadFile';
  uploadUrlImage = 'https://concplay.blob.core.windows.net/alporter/';
  legacyImage = 'https://concplay.blob.core.windows.net/alporter/';

  uploadImage = '';

  // 변수설정
  logFileNm: any;
  phyFileNm: any;
  logFileNm2: any;
  phyFileNm2: any;
  fileCheck: any;
  downFileNm: any;
  fileId: any;

  imageList = [];


  // Global
  G_TENANT: any;
// ***** main ***** //
  // Form
  mainFormData: PtItemRouteVO = {} as PtItemRouteVO;
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;

  popupFormData: PtItemRouteVO = {} as PtItemRouteVO;
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  // image
  imageDataSource: DataSource;
  imageEntityStore: ArrayStore;
  imagePopupData: any;

  imageTempVO: PtItemRouteDetailVO;

  key = 'uid';
  selectedRows: number[];

  dsUser = [];
  dsItemId = [];
  dsSpec = [];
  dsItemAdminId = [];
  dsRout = [];
  dsRoutGb = [];
  dsUnitStyle = [];
  // dsRoutId = [];
  dsRevision = [];
  dsfilteredRevision = [];
  dsFilteredRoutId = [];

  searchList = [];

  // Grid Popup
  changes = [];
  popupVisible = false;
  popupMode = 'Add';
  popupData: PtItemRouteVO = {} as PtItemRouteVO;

  PAGE_PATH = '';

  GRID_STATE_KEY = 'mm_ptitemroute';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  lossRateVisible = false;

  constructor(
    public utilService: CommonUtilService,
    public service: PtItemRouteService,
    public codeService: CommonCodeService,
    public gridUtil: GridUtilService,
    private bizService: BizCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.PAGE_PATH = this.utilService.getPagePath();
    this.getFilteredItemId = this.getFilteredItemId.bind(this);
    this.onSearchPopup = this.onSearchPopup.bind(this);

    this.popupShown = this.popupShown.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
    this.onItemIdChanged = this.onItemIdChanged.bind(this);
    // this.setRoutValue = this.setRoutValue.bind(this);

    this.onDownloadFile = this.onDownloadFile.bind(this);
    this.onDownloadFile2 = this.onDownloadFile2.bind(this);

    this.onImagePopupOpen = this.onImagePopupOpen.bind(this);
    this.selectRoutId = this.selectRoutId.bind(this);
  }

  ngOnInit(): void {
    this.initCode();
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

  initCode(): void {
    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdminId = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });

    // 공정ID
    this.codeService.getRoute(this.G_TENANT).subscribe(result => {
      this.dsRout = result.data;
    });

    // // revision
    // this.codeService.getRevision(this.G_TENANT).subscribe(result => {
    //   this.dsRevision = result.data;
    //   // this.dsfilteredRevision = this.dsRevision.filter(el => el.revision === this.utilService.getCommonItemId());
    // });

    // // 공정ID
    // this.codeService.getCode(this.G_TENANT, 'PRODPROC').subscribe(result => {
    //   console.log(result);
    //   this.dsRoutId = result.data;
    // });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnitStyle = result.data;
    });

    // 공정유형
    this.codeService.getCode(this.G_TENANT, 'ROUTGB').subscribe(result => {
      this.dsRoutGb = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // // 사용여부
    // this.codeService.getCode(this.G_TENANT, 'ROUTID').subscribe(result => {
    //   this.dsRoutId = result.data;
    // });

  }

  async onItemIdChanged(e): Promise<void> {

    if (!e.value) {
      this.dsRevision = [];
      return;
    }
    // this.dsRevision = [];
    // await this.codeService.getItemRevision(this.G_TENANT, e.value).subscribe(r => {
    //   this.dsRevision = r.data;
    // });

    await this.codeService.getItemRevision(this.G_TENANT, e.value).subscribe(async (r) => {
      this.dsRevision = r.data;
      if (this.dsRevision.length > 0) {
        this.popupData.childRevision = this.dsRevision[0].childRevision;
      }
    });


    await this.codeService.getRouteByItem(this.G_TENANT, e.value).subscribe(r => {
      this.dsFilteredRoutId = r.data;
    });
  }

  initForm(): void {
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());

    this.mainForm.instance.focus();
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
      this.popupFormData = this.popupData;
      this.popupMode = popupMode;

      this.onSearchPopup(data);

    } else {
      this.popupMode = 'Add';
      this.popupFormData.uid = null;
    }
    this.popupVisible = true;
    // this.popup.instance.repaint();
  }

  // 팝업 그리드 조회
  async onSearchPopup(data, revision?): Promise<void> {

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
        await this.popupGrid.instance.deselectAll();

        // 물리파일명이 있을시 이미지 불러오기
        if (this.popupFormData.phyFileNm) {

          const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
          legacyImage.src = this.uploadUrlImage + this.popupFormData.logFileNm;
          legacyImage.setAttribute('style', 'display:block;');

        } else {
          // 물리파일명이 없을시 legacyImage hidden처리
          // const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
          // legacyImage.hidden = true;
          this.popupForm.instance.getEditor('phyFileNm').option('visible', false);
          this.downloadFileBtn.visible = false;
          this.deleteFileBtn.visible = false;

        }
      }
    }
    // this.popup.instance.repaint();

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

    // 파일 업로드 및 이미지 기본설정
    this.fileUploader.instance.reset();

    // 파일 다운로드 및 이미지 기본설정
    this.popupForm.instance.getEditor('phyFileNm').option('visible', false);
    this.downloadFileBtn.visible = false;
    this.deleteFileBtn.visible = false;
    // 업로드 이미지 초기화
    const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
    const mainGridImage = document.getElementsByClassName('mainGridImage');

    legacyImage.src = '';
    legacyImage.hidden = true;

    if (this.popupFormData.phyFileNm === null || this.popupFormData.phyFileNm === undefined) {
      legacyImage.src = '';
      legacyImage.setAttribute('style', 'display:none;');
      // const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
      // legacyImage.hidden = true;
    }

    if (this.popupMode === 'Add') { // 신규
      legacyImage.setAttribute('style', 'display:hidden;');
      this.popupForm.instance.getEditor('itemId').option('disabled', false);
      this.popupForm.instance.getEditor('childRevision').option('disabled', false);
      // mainGridImage.setAttribute('style', 'display:hidden;');

      // this.popupForm.instance.getEditor('actFlg').option('value', 'Y');

    } else if (this.popupMode === 'Edit') { // 수정
      // revision
      this.codeService.getRevision(this.G_TENANT).subscribe(r => {
        this.dsRevision = r.data;
      });

      // 공정ID
      this.codeService.getRoute(this.G_TENANT).subscribe(result => {
        this.dsFilteredRoutId = result.data;
      });

      this.popupForm.instance.getEditor('itemId').option('disabled', true);
      this.popupForm.instance.getEditor('childRevision').option('disabled', true);

      this.popupForm.instance.getEditor('childRevision').option('value', this.popupData.revision);

      if (this.dsRout.find(el => el.uid === this.popupFormData.routId).cutYn === 'Y') {
        this.lossRateVisible = true;
      }

      // phy_file_nm1값의 유무 체크후 파일접근
      if (this.popupFormData.phyFileNm) {
        this.popupForm.instance.getEditor('phyFileNm').option('visible', true);
        this.popupForm.instance.getEditor('phyFileNm').option('value', this.popupFormData.phyFileNm);
        this.downloadFileBtn.visible = true;
        this.deleteFileBtn.visible = true;

        // tslint:disable-next-line:no-shadowed-variable
        const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
        legacyImage.src = this.legacyImage + this.popupFormData.logFileNm;

        legacyImage.hidden = false;
      }

    }
    // this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
    // this.utilService.getPopupGridHeight(this.popupGrid, this.popup);

    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가

  }

  // 저장버튼 이벤트
  async popupSaveClick(e): Promise<void> {

    const detailList = this.collectGridData(this.changes);

    // validation 체크
    for (const item of this.popupDataSource.items()) {

      const mainGridIdx = this.popupGrid.instance.getRowIndexByKey(item.uid);
      const workSeq = this.popupGrid.instance.cellValue(mainGridIdx, 'workSeq');

      // if (detailList.length === 0) { // 입력안한 상세 데이터는 continue
      //   await this.setFocusRow(mainGridIdx, this.popupGrid);
      //   const msg = this.utilService.convert('com_valid_required', this.utilService.convert1('ptItemRoute', '제품별 공정'));
      //   this.utilService.notify_error(msg);
      //   return;
      // }
      const messages = {workSeq: 'mm_ptitemroute', workCt: 'mm_ptitemroute_workCt2'};
      const columns = ['workSeq', 'workCt'];    // required 컬럼 dataField 정의
      for (const data of detailList) {
        if (!data.key && !data.uid) {
          for (const col of columns) {
            if ((data[col] === undefined) || (data[col] === '')) {
              await this.setFocusRow(mainGridIdx, this.popupGrid);
              this.utilService.notify_error(this.utilService.convert('com_valid_required', this.utilService.convert(messages[col])));
              return;
            }
          }
        }
      }
    }

    // await this.mainGrid1.instance.saveEditData();
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('ptItemRoute', '제품별 공정'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      } else {

        this.popupFormData.logFileNm = this.logFileNm; // logFileNm의 값을 popupformdata['log_file_nm1']에 넣어서 DB저장
        this.popupFormData.phyFileNm = this.phyFileNm; // phyFileNm의 값을 popupformdata['phy_file_nm1']     ""
        this.logFileNm = undefined;                         // logFileNm의 값을 초기화.
        this.phyFileNm = undefined;                         // phyFileNm의 값을 초기화.
      }

      try {
        let result;
        const itemAdminId = this.mainForm.instance.getEditor('itemAdminId').option('value');
        const saveContent = this.popupData as PtItemRouteVO;

        saveContent.ptItemRouteDetailList = detailList;

        // const result = await this.service.save(saveContent);
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

        saveContent.itemId = this.popupForm.instance.getEditor('itemId').option('value');
        saveContent.revision = this.popupForm.instance.getEditor('childRevision').option('value');

        saveContent.routId = this.popupForm.instance.getEditor('routId').option('value');

        if (this.popupFormData.phyFileNm) {

          saveContent.phyFileNm = this.popupFormData.phyFileNm;
          saveContent.logFileNm = this.popupFormData.logFileNm;
        }


        console.log(saveContent);
        result = await this.service.save(saveContent);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          if (this.fileUploader.value[0]) {
            const formData = new FormData(document.forms.namedItem('uploadForm'));
            formData.append('logFileNm', this.logFileNm);
            const fileResult = this.service.uploadFile(formData);
          }

          if (this.imageList.length > 0) {

            for (const image of this.imageList) {
              const fileResult = this.service.uploadFile(image);
            }
          }

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

    const confirmMsg = this.utilService.convert('confirmDelete', this.utilService.convert1('ptitemroute_delete', '제품별공정'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      this.popupData.ptItemRouteDetailList = this.popupGrid.instance.getDataSource().items();

      const deleteContent = this.popupData as PtItemRouteVO;

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

  // 추가버튼 이벤트
  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);

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

  // 그리드 Lookup filter 품목
  getFilteredItemId(options): any {
    return {
      store: this.dsItemId,
      filter: options.data ? ['itemAdminId', '=', options.data.itemAdminId] : null
    };
  }

  // // 그리드 공정id 선택시
  // setRoutValue(rowData: any, value: any): void {
  //
  //   if (value) {
  //     for (const popupData of this.popupGrid.instance.getVisibleRows()) {
  //       if (value === popupData.data.routId) {
  //         const msg = this.utilService.convert('sameRout', '등록된 공정이 있습니다.');
  //         this.utilService.notify_error(msg);
  //         return;
  //       }
  //     }
  //   }
  //
  //   rowData.routId = value;
  //
  //   rowData.workCt = this.dsRout.filter(el => el.uid === value)[0].workCt;        // 작업내용 가져오기
  //   rowData.routGb = this.dsRout.filter(el => el.uid === value)[0].routGb;    // 공정유형 가져오기
  //   rowData.lossRate = this.dsRout.filter(el => el.uid === value)[0].lossRate;    // 손실율 가져오기
  // }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  onEditingStart(e): void {
    if ((e.column.caption === '폐기량') && (e.data.routId !== 22)) {
      e.cancel = true;
    } else {
    }
  }

  onOptionChanged(e): void {
    // 파일 확장자만 추출
    // const myuuid = uuidv4();
    const file = this.fileUploader.value[0];

    if (!file) {
      return;
    }

    const fileExt = file.name.split('.').pop();
    // this.phyFileNm = file.name;
    // this.logFileNm = myuuid + '.' + fileExt;
    // this.logFileNm = this.fileCheck + '.' + fileExt;

    // 파일 확장자 체크
    if (fileExt === 'jpg' || fileExt === 'JPG' || fileExt === 'png' || fileExt === 'PNG' || fileExt === 'gif'
      || fileExt === 'GIF' || fileExt === 'bmp' || fileExt === ('BMP') || fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'cvs' || fileExt === 'pdf') {
      const legacyImage = document.getElementById('legacyImage') as HTMLImageElement;
      // legacyImage.src = this.legacyImage + this.logFileNm;
      // legacyImage.hidden = false;
      legacyImage.setAttribute('style', 'display:none;');
      this.popupForm.instance.getEditor('phyFileNm').option('visible', false);
      this.downloadFileBtn.visible = false;
      this.deleteFileBtn.visible = false;

    } else {
      // 파일 확장자가 이미지 파일이 아닐시.
      const msg = '업로드할 수 없는 파일입니다.';
      this.utilService.notify_error(msg);
      this.fileUploader2.instance.reset();
      // 변수 값을 전부 비워준다.
      this.phyFileNm2 = '';
      this.logFileNm2 = '';
      // 이미지 숨김 처리
      // uploadImage.hidden = true;
      return;
    }
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

  // 파일삭제
  async onDeleteFile(): Promise<void> {
    const confirmMsg = this.utilService.convert1('ptbom_deletefile', '파일을 삭제하시겠습니까?');
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    } else {

      const deleteContent = this.popupFormData as PtItemRouteVO;

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

        // 파일 다운로드 및 이미지 기본설정
        this.popupForm.instance.getEditor('phyFileNm').option('visible', false);
        this.downloadFileBtn.visible = false;
        this.deleteFileBtn.visible = false;
        legacyImage.setAttribute('style', 'display:none;');
      }
    }
  }


  imagePopupShown(e): void {
    // 파일 업로드 및 이미지 기본설정
    this.fileUploader2.instance.reset();

    // 파일 다운로드 및 이미지 기본설정
    this.imagePopupForm.instance.getEditor('phyFileNm').option('visible', false);
    this.downloadFileBtn2.visible = false;
    this.deleteFileBtn2.visible = false;

    // 업로드 이미지 초기화
    const legacyImage2 = document.getElementById('legacyImage2') as HTMLImageElement;
    legacyImage2.src = '';
    legacyImage2.hidden = true;

    const idx = this.popupGrid.focusedRowIndex;

    const logFileNm = this.popupGrid.instance.cellValue(idx, 'logFileNm');
    const phyFileNm = this.popupGrid.instance.cellValue(idx, 'phyFileNm');
    const uid = this.popupGrid.instance.cellValue(idx, 'uid');


    // phy_file_nm1값의 유무 체크후 파일접근
    if (phyFileNm) {

      this.imagePopupData.phyFileNm = phyFileNm;
      this.imagePopupData.logFileNm = logFileNm;
      this.imagePopupData.uid = uid;

      this.imagePopupForm.instance.getEditor('phyFileNm').option('visible', true);
      this.downloadFileBtn2.visible = true;
      this.deleteFileBtn2.visible = true;

      // tslint:disable-next-line:no-shadowed-variable
      const legacyImage2 = document.getElementById('legacyImage2') as HTMLImageElement;
      legacyImage2.src = this.legacyImage + logFileNm;

      legacyImage2.hidden = false;
    }

  }

  async onImagePopupOpen(e, datas: any): Promise<void> {
    this.imagePopup.visible = true;

    if (this.imagePopupData.phyFileNm === null || this.imagePopupData.phyFileNm === undefined) {

    }

  }

  // 저장버튼 이벤트
  async onImageUploadClick(): Promise<void> {

    const saveContent = this.popupData as PtItemRouteVO;

    const idx = this.popupGrid.focusedRowIndex;

    const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('ptiemtroute_imagesave', '이미지'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    } else {

      this.imagePopupData.logFileNm = this.logFileNm2; // logFileNm의 값을 popupformdata['log_file_nm1']에 넣어서 DB저장
      this.imagePopupData.phyFileNm = this.phyFileNm2; // phyFileNm의 값을 popupformdata['phy_file_nm1']     ""
      this.logFileNm2 = undefined;                         // logFileNm의 값을 초기화.
      this.phyFileNm2 = undefined;                         // phyFileNm의 값을 초기화.
    }

    if (this.fileUploader2.value[0]) {

      const myuuid = uuidv4();
      const file = this.fileUploader2.value[0];

      const fileExt = file.name.split('.').pop();
      this.phyFileNm2 = file.name;
      this.logFileNm2 = myuuid + '.' + fileExt;

      this.popupGrid.instance.cellValue(idx, 'logFileNm', this.logFileNm2);
      this.popupGrid.instance.cellValue(idx, 'phyFileNm', this.phyFileNm2);

      this.uploadUrl = this.updateQueryStringParameter(this.uploadUrl, 'logFileNm', this.logFileNm2);

      const ImageFormData = new FormData(document.forms.namedItem('uploadForm2'));
      ImageFormData.append('logFileNm', this.logFileNm2);

      // @ts-ignore
      this.imageList.push(ImageFormData);
      // this.onSearchPopup(null);
    } else {
      this.popupGrid.instance.cellValue(idx, 'logFileNm', null);
      this.popupGrid.instance.cellValue(idx, 'phyFileNm', null);
    }
    this.imagePopup.visible = false;
  }


  onOptionChanged2(e): void {
    // 파일 확장자만 추출
    // const myuuid = uuidv4();
    const file = this.fileUploader2.value[0];

    if (!file) {
      return;
    }

    const fileExt = file.name.split('.').pop();

    // 파일 확장자 체크
    if (fileExt === 'jpg' || fileExt === 'JPG' || fileExt === 'png' || fileExt === 'PNG' || fileExt === 'gif'
      || fileExt === 'GIF' || fileExt === 'bmp' || fileExt === ('BMP') || fileExt === 'xlsx' || fileExt === 'xls'
      || fileExt === 'cvs' || fileExt === 'pdf') {
      const legacyImage2 = document.getElementById('legacyImage2') as HTMLImageElement;
      // legacyImage.src = this.legacyImage + this.logFileNm;
      // legacyImage.hidden = false;
      legacyImage2.setAttribute('style', 'display:none;');
      this.imagePopupForm.instance.getEditor('phyFileNm').option('visible', false);
      this.downloadFileBtn2.visible = false;
      this.deleteFileBtn2.visible = false;

    } else {
      // 파일 확장자가 이미지 파일이 아닐시.
      const msg = '업로드할 수 없는 파일입니다.';
      this.utilService.notify_error(msg);
      this.fileUploader2.instance.reset();
      // 변수 값을 전부 비워준다.
      this.phyFileNm2 = '';
      this.logFileNm2 = '';
      // 이미지 숨김 처리
      // uploadImage.hidden = true;
      return;
    }
  }

  // 파일다운로드
  onDownloadFile2(): void {
    this.utilService.download(this.imagePopupData.phyFileNm, this.imagePopupData.phyFileNm);
  }

  // 파일삭제
  async onDeleteFile2(): Promise<void> {
    const confirmMsg = this.utilService.convert1('ptbom_deletefile', '파일을 삭제하시겠습니까?');
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    } else {

      const deleteContent = this.imagePopupData as PtItemRouteVO;


      const result = await this.service.deleteFileDb2(deleteContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.service.deleteFile(deleteContent);

        this.imagePopupData.phyFileNm = '';
        this.imagePopupData.logFileNm = '';

        this.phyFileNm2 = '';
        this.logFileNm2 = '';

        const legacyImage2 = document.getElementById('legacyImage2') as HTMLImageElement;

        legacyImage2.setAttribute('style', 'display:none;');
        this.imagePopupForm.instance.getEditor('phyFileNm').option('visible', false);
        this.downloadFileBtn2.visible = false;
        this.deleteFileBtn2.visible = false;

      }
    }
  }

  onImagePopupClose(): void {
    this.imagePopup.visible = false;
  }

  onImagePopupAfterClosed(): void {
    // this.onResetFileUploader();
    // this.onSerialPopupGridReset();
  }

  selectRoutId(e): void {

    if (!e.value) {
      return;
    }

    // this.popupForm.instance.getEditor('lossRate').option('value', this.popupFormData.lossRate);

    if (this.dsRout.find(el => el.uid === e.value).cutYn === 'Y') {
      this.lossRateVisible = true;
      // this.popupFormData.lossRate = 0;
      // this.popupForm.instance.getEditor('lossRate').option('value', 0);
    } else {
      this.popupFormData.lossRate = 0;
      // this.popupForm.instance.getEditor('lossRate').option('value', 0);
      this.lossRateVisible = false;
    }

    // const selectRout = [...this.dsRout].filter(el => {
    //     return el.uid === e.value;
    // });
    //
    // console.log(selectRout);
    //
    // if (selectRout[0].cutYn === 'Y') {
    //     this.lossRateVisible = true;
    //     // this.popupFormData.lossRate = 0;
    //     // this.popupForm.instance.getEditor('lossRate').option('value', 0);
    // } else {
    //     this.popupFormData.lossRate = 0;
    //     // this.popupForm.instance.getEditor('lossRate').option('value', 0);
    //     this.lossRateVisible = false;
    // }
  }
}

