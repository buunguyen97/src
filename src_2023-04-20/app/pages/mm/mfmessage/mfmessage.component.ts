import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {MfmessageService} from './mfmessage.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';

@Component({
  selector: 'app-mfmessage',
  templateUrl: './mfmessage.component.html',
  styleUrls: ['./mfmessage.component.scss']
})
export class MfmessageComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  dsActFlg = [];

  // Global
  G_TENANT: any;

  mainFormData = {};

  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupData = {};

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  selectedRows: number[];
  deleteRowList = [];
  key = 'uid';
  changes = [];

  dsUser = [];

  GRID_STATE_KEY = 'mm_mfmessage1';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              private service: MfmessageService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.dataSource = new DataSource({
      store: this.entityStore
    });
    this.initCode();
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.utilService.getGridHeight(this.mainGrid);
    this.mainForm.instance.focus();
  }

  initCode(): void {
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
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
      this.popupForm.instance.getEditor('messageKey').focus();
      this.deleteBtn.visible = false;
    } else if (this.popupMode === 'Edit') {
      // 수정
      // this.popupForm.instance.getEditor('messageKey').option('disabled', true);
      this.popupForm.instance.getEditor('messageKey').focus();
      this.deleteBtn.visible = true;
    }
  }

  async saveClick(): Promise<void> {
    const columns = ['messageKey'];    // required 컬럼 dataField 정의
    // const changeData = [];
    const tempData = this.collectGridData(this.changes);

    for (const item of tempData) {
      // if (item.type === 'delete') {
      //   return;
      // }

      if (!item.key && !item.uid) {
        for (const col of columns) {
          if ((item[col] === undefined) || (item[col] === '')) {
            this.utilService.notify_error('An empty value exists');
            return;
          }
        }
      }

      this.mainGrid.instance.byKey(item.key).then(
        (dataItem) => {
          for (const col of columns) {
            if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
              this.utilService.notify_error('An empty value exists');
              return;
            }
          }
        }
      );
    }

    // for (const item of tempData) {
    //   if (item.operType === 'remove') {
    //     continue;
    //   }
    //   for (const col of columns) {
    //     if ((item[col] === undefined) || (item[col] === '')) {
    //       this.utilService.notify_error('An empty value exists');
    //       return;
    //     }
    //   }
    // }

    this.mainGrid.instance.saveEditData();
    // const saveData = changeData;
    const result = await this.service.save(tempData);

    if (result.success) {
      this.utilService.notify_success('save success');
    } else {
      this.utilService.notify_error('save failed');
      // this.utilService.notify_error(result.msg);
    }
    this.onSearch();
  }

  addClick(e): void {
    this.mainGrid.instance.addRow().then(r => {
      const rowIdx = this.mainGrid.instance.getRowIndexByKey(this.changes[this.changes.length - 1].key);
      this.setFocusRow(rowIdx);
    });
  }

  async deleteClick(e): Promise<void> {

    if (this.mainGrid.focusedRowIndex > -1) {
      const focusedIdx = this.mainGrid.focusedRowIndex;
      this.mainGrid.instance.deleteRow(this.mainGrid.focusedRowIndex);
      this.entityStore.push([{type: 'remove', key: this.mainGrid.focusedRowKey}]);

      // 삭제된 로우 위로 포커스
      this.mainGrid.focusedRowIndex = focusedIdx - 1;
    }
  }

  // 그리드 더블클릭시 호출하는 함수
  rowDblClick(e): void {
    this.deleteBtn.visible = true;
    // Row double 클릭시 이벤트에서 해당 Row에 대한 이벤트를 접근할 수 있다.
    this.showPopup('Edit', {...e.data});
    console.log(e.data);
  }

  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

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
