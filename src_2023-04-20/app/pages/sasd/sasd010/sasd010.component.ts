import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxButtonComponent, DxDataGridComponent, DxFormComponent, DxPopupComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {DeptVO, Sasd010Service} from './sasd010.service';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Component({
  selector: 'app-sasd010',
  templateUrl: './sasd010.component.html',
  styleUrls: ['./sasd010.component.scss']
})
export class Sasd010Component implements OnInit, AfterViewInit {

  @ViewChild('searchForm', {static: false}) searchForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;

  dsActFlg = []; // 사용여부
  dsUser = []; // 사용자
  dsPtrnId = []; // 파트너ID
  dsDept = [];  // 부서

  // Global
  G_TENANT: any;
  UserUID: any;

  // Form
  searchFormData = {};

  // Grid
  dataSource: DataSource;
  popupDataSource: DataSource;
  entityStore: ArrayStore;
  data: DeptVO;
  changes = [];
  popupEntityStore: ArrayStore;
  key = 'dept_id';

  // ***** Popup ***** //
  // Grid Popup
  popupVisible = false;
  popupMode = 'Add';
  popupFormData: DeptVO;

  constructor(public utilService: CommonUtilService,
              private service: Sasd010Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService,
              private bizService: BizCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
    this.onChangedPtrnCd = this.onChangedPtrnCd.bind(this);
  }

  ngOnInit(): void {
    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
    // 파트너사

    if (this.utilService.getCompany() === 'O1000') {
      // 알포터면 모든 파트너사
      this.bizService.getCust(this.G_TENANT, 'Y', '', '', 'Y', '', '').subscribe(result => {
        this.dsPtrnId = result.data.map((el) => {
          // @ts-ignore
          el.company = el.cd;
          return el;
        });
      });
    } else {
      const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));
      this.codeService.getRelatedCompany(this.utilService.getTenant(), Number(data.companyId)).subscribe(r => {
        this.dsPtrnId = r.data;
      });
    }
  }

  onChangedPtrnCd(e): void {
    this.dsDept = [];
    this.codeService.getDept(this.G_TENANT).subscribe(r => {
      this.dsDept = r.data.filter(el => el.ptrn_cd === e.value);
    });
  }

  ngAfterViewInit(): void {
    this.searchForm.instance.getEditor('deptId').focus();
    this.utilService.getGridHeight(this.mainGrid);
    this.searchForm.instance.getEditor('use_yn').option('value', 'Y');

    // @ts-ignore
    this.searchFormData.ptrn_cd = this.utilService.getCompany();
  }

  // ***** Main ***** //
  // 조회함수
  async onSearch(): Promise<void> {

    const data = this.searchForm.instance.validate();

    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {
      const result = await this.service.mainList(this.searchFormData);
      console.log(result);
      if (!result.success) {
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: 'dept_id'
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

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.mainInfo(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.popupFormData = result.data;
    } else {
      return;
    }
  }


  // ***** Popup ***** //

  // 팝업 열기
  onPopupOpen(e): void {
    this.popup.visible = true;

    if (e.element.id === 'open') {
      this.deleteBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data).then(
        () => this.popupForm.instance.getEditor('dept_id').focus()
      );
    }
  }

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, warehouse: '', name: ''});
  }

  // 팝업 오픈 후 처리
  onPopupAfterOpen(): void {
    this.popupForm.instance.getEditor('dept_id').option('disabled', false);
    this.popupForm.instance.getEditor('dept_nm').option('disabled', false);
    if (this.popupMode === 'Add') {
      this.popupForm.instance.getEditor('dept_id').focus();
      this.popupForm.instance.getEditor('use_yn').option('value', 'Y');
      this.popupForm.instance.getEditor('ptrn_cd').option('value', this.utilService.getCompany());
      // this.popupForm.instance.getEditor('createdby').option('value',this.UserUID);
    } else if (this.popupMode === 'Edit') {
      this.popupForm.instance.getEditor('dept_id').option('disabled', true);
      // this.popupForm.instance.getEditor('modifiedby').option('value',this.UserUID);
    }
    if (this.popupForm.instance.getEditor('use_yn').option('value') == 'N') {
      this.popupForm.instance.getEditor('dept_nm').option('disabled', true);
    }
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  async onReset(): Promise<void> {
    await this.searchForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    this.searchForm.instance.getEditor('deptId').focus();
  }

  // 팝업 닫히고 후 처리
  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    // this.onSearch();
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  async onPopupSave(): Promise<void> {

    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {

      if (await this.execSave()) {
        this.onPopupClose();
        this.onSearch();
      }
    }
  }

  async execSave(): Promise<boolean> {
    try {
      let result;

      this.popupFormData.createdby = this.utilService.getUserUid();
      this.popupFormData.modifiedby = this.utilService.getUserUid();

      if (this.popupMode === 'Add') {
        result = await this.service.mainInsert(this.popupFormData);
      } else {
        result = await this.service.mainUpdate(this.popupFormData);
        this.onSearch();
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

  async onPopupDelete(): Promise<void> {

    try {
      const result = await this.service.mainDelete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }
}
