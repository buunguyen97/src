import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {ReportMngService, ReportMngVO} from './report-mng.service';

@Component({
  selector: 'app-report-mng',
  templateUrl: './report-mng.component.html',
  styleUrls: ['./report-mng.component.scss']
})
export class ReportMngComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('saveBtn', {static: false}) saveBtn: DxButtonComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: ReportMngVO = {} as ReportMngVO;
  // Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';

  changes = [];

  // DataSet
  dsWarehouseId = [];
  dsReportKey = [];
  dsReportName = [];
  dsOwner = [];
  dsCategory = [];
  dsUser = []; // 사용자
  dsYN = [];

  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: ReportMngVO = {} as ReportMngVO;

  popupData: ReportMngVO = {} as ReportMngVO;

  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;

  selectedRows: number[];

  PAGE_PATH = '';
  GRID_STATE_KEY = 'mm_reportmng';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');

  constructor(
    public utilService: CommonUtilService,
    private service: ReportMngService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.PAGE_PATH = this.utilService.getPagePath();
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.addClick = this.addClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
    this.onPopupSave = this.onPopupSave.bind(this);
    this.onPopupDelete = this.onPopupDelete.bind(this);
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
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

  // 화면의 컨트롤까지 다 로드 후 호출
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
    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'REPORTCATEGORY').subscribe(result => {
      this.dsCategory = result.data;
    });
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

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

  popupShown(e): void {
    this.popupGrid.instance.deselectAll();

    this.popupGrid.instance.repaint();  // 팝업 그리드 스크롤 제거를 위해 추가
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);

    if (this.popupMode === 'Add') { // 신규


    } else if (this.popupMode === 'Edit') { // 수정

    }
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

    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.onSearchPopup();
  }

  // 팝업 그리드 조회
  async onSearchPopup(): Promise<void> {
    if (this.popupData.uid) {
      const result = await this.service.getFull(this.popupData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.reportDetailList,
            key: this.key
          }
        );
        this.popupDataSource = new DataSource({
          store: this.popupEntityStore
        });
        this.popupGrid.focusedRowKey = null;
        this.popupGrid.paging.pageIndex = 0;
      }
    }
  }

  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    const detailList = this.collectGridData(this.changes);

    console.log(detailList);

    if (popData.isValid && detailList.length > 0) {

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('reportmng_save', '리포트'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      try {
        let result;
        const saveContent = this.popupData as ReportMngVO;

        saveContent.reportDetailList = detailList;
        saveContent.tenant = this.G_TENANT;

        result = await this.service.save(saveContent);

        // if (this.popupMode === 'Add') {
        //   result = await this.service.save(this.popupFormData);
        // } else {
        //   result = await this.service.update(this.popupFormData);
        // }

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.popupForm.instance.resetValues();
          this.popupVisible = false;
          this.onSearch();
        }
      } catch (e) {
        this.utilService.notify_error('There was an error!');
      }
    } else {
      if (!popData.isValid) {
        this.utilService.notify_error('값을 확인해주세요.');
        return;
      }
      if (detailList.length === 0) {
        this.utilService.notify_error('변경된 데이터가 없습니다.');
        return;
      }
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  async onPopupDelete(): Promise<void> {
    try {
      const result = await this.service.delete(this.popupData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  onPopupAfterOpen(): void {

    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('actFlg').option('value', 'Y');

      this.popupForm.instance.getEditor('reportName').focus();
    } else {

    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();

    this.onSearch();
  }

  addClick(): void {
    this.popupGrid.instance.addRow().then(r => {
      const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx, this.popupGrid);
    });
  }

  async deleteClick(): Promise<void> {
    if (this.popupGrid.focusedRowIndex > -1) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  // 닫기클릭 이벤트
  popupCancelClick(): void {
    this.popupVisible = false;
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
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
}
