import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {ApplicationService, AppVO} from './application.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss']
})
export class ApplicationComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;

  dsActFlg = [];

  // Global
  G_TENANT: any;

  mainFormData: AppVO;

  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupData = {};

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  // entities: CompanyService[];
  selectedRows: number[];
  deleteRowList = [];
  key = 'uid';

  constructor(private utilService: CommonUtilService,
              private service: ApplicationService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService) {
    this.G_TENANT = this.utilService.getTenant();
    // this.searchClick = this.searchClick.bind(this);
    this.popupSaveClick = this.popupSaveClick.bind(this);
    this.popupCancelClick = this.popupCancelClick.bind(this);
    this.popupDeleteClick = this.popupDeleteClick.bind(this);
  }

  ngOnInit(): void {

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    // ArrayStore - DataSource와 바인딩.
    // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
    this.dataSource = new DataSource({
      store: this.entityStore
    });
  }


  ngAfterViewInit(): void {
    this.mainGrid.rowAlternationEnabled = true;  // 그리드 로우 색 구분
    this.mainForm.instance.getEditor('actFlg').option('value', 'Y');
  }


  // 신규
  async onNew(e): Promise<void> {
    this.deleteBtn.visible = false;
    this.showPopup('Add', {...e.data});
  }

  // 조회
  async onSearch(): Promise<void> {
    // 조회패널에 필수컬럼에 값 있는지 체크
    const data = this.mainForm.instance.validate();
    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {
      // Service의 get 함수 생성
      const result = await this.service.get(this.mainFormData);

      // 조회 결과가 success이면 화면표시, 실패면 메시지 표시

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        // Front에서 데이터의 CRUD를 컨트롤 할 수 있음.
        // Grid1
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        // ArrayStore - DataSource와 바인딩.
        // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        // 그리드 상태가 수시로 저장되어 포커스가 있을경우 해당 포커스로 강제 페이지 이동되기 때문에, 그리드의 포커스 없앰
        // 페이징번호도 강제로 1페이지로 Fix
        // 참고 : grid1은 HTML에서 그리드의 이름이 #grid1로 명시되어 있으며, Behind 상단에 @ViewChild에 DxDataGridComponent로 선언되어 있음.
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  // 그리드 상태 저장
  saveState = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('mm_app', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadState = () => {
    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('mm_app');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  // Popup 관련
  showPopup(popupMode, data): void {
    this.popupData = data;
    this.popupData = {tenant: this.G_TENANT, ...this.popupData};
    this.popupMode = popupMode;
    this.popupVisible = true;
  }

  popupShown(e): void {
    // popupShow 이후 컨트롤들을 수정 할 수 있음.
    // 초기값
    if (this.popupMode === 'Add') {
      // 신규
      this.popupForm.instance.getEditor('actFlg').option('value', '1');
      this.popupForm.instance.getEditor('app').focus();
      this.deleteBtn.visible = false;
    } else if (this.popupMode === 'Edit') {
      // 수정
      this.popupForm.instance.getEditor('app').focus();
      this.deleteBtn.visible = true;
    }
  }

  async popupSaveClick(e): Promise<void> {
    const popData = this.popupForm.instance.validate();
    if (popData.isValid) {
      try {
        let result;
        // popupData에서 Data를 가져온다.
        const saveContent = this.popupData as AppVO;


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

  popupCancelClick(e): void {
    this.popupVisible = false;
    this.popupForm.instance.resetValues();

    // 재조회
    this.onSearch();
  }

  async popupDeleteClick(e): Promise<void> {

    try {
      const deleteContent = this.popupData as any;
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

  // 그리드 툴바
  onToolbarPreparing(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));
    const searchPanelTemp = toolbarItems.find(item => item.name === 'searchPanel');
    searchPanelTemp.location = 'after';

    newToolbarItems.push(searchPanelTemp);
    e.toolbarOptions.items = newToolbarItems;
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }
}
