import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {Code1Service, CodeCategoryVO, CodeVO} from './code1.service';

@Component({
  selector: 'app-common-code',
  templateUrl: './code1.component.html',
  styleUrls: ['./code1.component.scss']
})
export class Code1Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Code1Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();

    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popupGrid', {static: false}) popupGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';
  selectedRows: number[];
  // ***** main ***** //

  popupVisible = false;

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: CodeCategoryVO = {} as CodeCategoryVO;
  // Grid
  popupDataSource: DataSource;
  popupEntityStore: ArrayStore;
  codeList: CodeVO[];
  // Changes
  changes = [];

  // DataSet
  dsYN = [];
  dsUser = [];

  GRID_STATE_KEY = 'mm_code';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStatePopup = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_popup');
  loadStatePopup = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_popup');

  ngOnInit(): void {
    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.mainDataSource = new DataSource({
      store: this.mainEntityStore
    });

    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
  }

  ngAfterViewInit(): void {
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
  }

  initCode(): void {

    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
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

  // 메인 그리드 조회
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
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // 신규버튼 이벤트
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }


  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    this.showPopup('Edit', {...e.data});
  }

  async onSearchPopup(): Promise<void> {
    if (this.popupFormData.uid) {
      // Service의 get 함수 생성
      const result = await this.service.getPopup(this.popupFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.popupGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.popupEntityStore = new ArrayStore(
          {
            data: result.data.codeList,
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

    this.popupFormData = data;
    this.popupFormData = {tenant: this.G_TENANT, ...this.popupFormData};
    this.popupMode = popupMode;
    this.popupVisible = true;
    this.onSearchPopup();
  }


  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.getEditor('codeCategory').option('disabled', false);
    if (!!this.popupDataSource) {
      // this.popupEntityStore.clear();
      // this.popupDataSource.reload();

      this.popupEntityStore = new ArrayStore(
        {
          data: [],
          key: this.key
        }
      );
      this.popupDataSource = new DataSource({
        store: this.popupEntityStore
      });

      this.popupGrid.instance.cancelEditData();
    }
    this.onSearch();
  }

  popupShown(e): void {
    this.deleteBtn.visible = this.popupMode === 'Edit'; // 삭제버튼
    this.popupGrid.instance.repaint();  // 스크롤 제거를 위해 refresh
    // 팝업 그리드 사이즈 조정
    this.utilService.setPopupGridHeight(this.popup, this.popupForm, this.popupGrid);
  }

  async popupSaveClick(e): Promise<void> {
    const popData = this.popupForm.instance.validate();
    const detailList = this.collectGridData(this.changes);

    if (popData.isValid) {
      let result;
      this.popupFormData.codeList = detailList;

      if (this.popupMode === 'Add') {
        result = await this.service.save(this.popupFormData);
      } else {
        result = await this.service.update(this.popupFormData);
      }

      if (this.resultMsgCallback(result, 'Save')) {
        this.popupFormData = result.data;
        this.popupVisible = false;
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

// 닫기클릭 이벤트
  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();

    // 재조회
    this.onSearch();
  }

// 삭제클릭 이벤트
  async popupDeleteClick(e): Promise<void> {
    try {
      const deleteContent = this.popupFormData as CodeCategoryVO;
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
    this.popupGrid.instance.addRow().then(() => {
        const rowIdx = this.popupGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
        this.setFocusRow(rowIdx, this.popupGrid);
      }
    );
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  onInitNewRow(e): void {
    e.data.tenant = this.utilService.getTenant();
    e.data.codeCategoryId = this.popupFormData.uid;
  }

// 삭제버튼 이벤트
  async deleteClick(): Promise<void> {
    if (this.popupGrid.focusedRowIndex > -1
    ) {
      const focusedIdx = this.popupGrid.focusedRowIndex;

      this.popupGrid.instance.deleteRow(focusedIdx);
      this.popupEntityStore.push([{type: 'remove', key: this.popupGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.popupGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  initForm(): void {
  }

}
