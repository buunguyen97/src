import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {DxButtonComponent, DxDataGridComponent, DxPopupComponent} from 'devextreme-angular';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {UserService, UserVO} from './user.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {CookieService} from 'ngx-cookie-service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {DxTreeViewComponent} from 'devextreme-angular/ui/tree-view';
import {APPCONSTANTS} from '../../../shared/constants/appconstants';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('popup', {static: false}) popup: DxPopupComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('newBtn', {static: false}) newBtn: DxButtonComponent;
  @ViewChild('deleteBtn', {static: false}) deleteBtn: DxButtonComponent;
  @ViewChild('resetPwdBtn', {static: false}) resetPwdBtn: DxButtonComponent;


  @ViewChild('pwdPopup', {static: false}) pwdPopup: DxPopupComponent;
  @ViewChild('pwdPopupForm', {static: false}) pwdPopupForm: DxFormComponent;
  @ViewChild('pwdBtn', {static: false}) pwdBtn: DxButtonComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild(DxTreeViewComponent, {static: false}) treeView;


  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';
  // ***** main ***** //

  // ***** popup ***** //
  popupMode = 'Add';
  // Form
  popupFormData: UserVO;
  // ***** popup ***** //

  // DataSets
  dsOwnerId = [];
  dsDept = [];
  dsFilteredDept = [];
  dsActFlg = [];
  dsCompany = [];
  dsUserGroup = [];
  dsUser = [];
  pwdPopupData = {
    changePassword: ''
  };

  treeBoxValue = [];
  deptFlg = true;

  // Grid State
  GRID_STATE_KEY = 'mm_user1';
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  private inputElement: any;

  constructor(public utilService: CommonUtilService,
              private service: UserService,
              private cookieService: CookieService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.onSearch = this.onSearch.bind(this);
    this.pwdPopupSaveClick = this.pwdPopupSaveClick.bind(this);
    this.pwdPopupCancelClick = this.pwdPopupCancelClick.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.focusIn = this.focusIn.bind(this);
    this.onValueChangedCompanyId = this.onValueChangedCompanyId.bind(this);
    this.calculateFilterExpression = this.calculateFilterExpression.bind(this);
    this.cellTemplate = this.cellTemplate.bind(this);
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

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  ngAfterViewInit(): void {
    this.newBtn.visible = this.utilService.isAdminUser();
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);

  }

  initForm(): void {
    this.mainForm.instance.getEditor('companyId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('actFlg').option('value', 'Y');
  }

  initCode(): void {
    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 사용자그룹
    this.codeService.getCode(this.G_TENANT, 'USERGROUP').subscribe(result => {
      this.dsUserGroup = result.data;
    });

    // 화주
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 화주(로그인 사용자가 선택할 수 있는 화주)
    this.codeService.getCompany(this.G_TENANT, true, true, null, null, true, null, null).subscribe(result => {
      this.dsOwnerId = result.data;

    });

    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });


    // 부서
    this.codeService.getDept(this.G_TENANT).subscribe(result => {

      console.log(result.data);
      this.dsDept = result.data;
      // this.dsFilteredDept = this.dsDept.filter(el => el.ptrn_cd === this.popupFormData.company);
      // console.log(this.dsFilteredDept);
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {

        result.data.forEach(el => {
          let str = el.dept;

          if (el.dept) {
            str = str.replace('[', '');
            str = str.replace(']', '');
            str = str.replace(/"/g, '');

            console.log(str);
            el.dept = str;
          }

        });

        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      } else {
        return;
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

  // 팝업 열기
  onPopupOpen(e): void {
    if (e.element.id === 'Open') {
      this.deleteBtn.visible = false;
      // this.resetPwdBtn.visible = false;
      this.popupMode = 'Add';
      this.onPopupInitData();
    } else {
      this.deleteBtn.visible = true;
      // this.resetPwdBtn.visible = this.utilService.isAdminUser();  // 관리자용 비밀번호 초기화
      this.popupMode = 'Edit';
      this.onPopupSearch(e.data);
    }
    // if (this.utilService.isAdminUser()) {
    //   this.resetPwdBtn.disabled = true;
    // } else {
    //   this.resetPwdBtn.disabled = false;
    // }

    this.popup.visible = true;
  }

  // 생성시 초기데이터
  onPopupInitData(): void {
    this.popupFormData = Object.assign({tenant: this.G_TENANT, usr: '', name: '', shortName: '', email: '', dept: ''});
  }

  onPopupAfterOpen(): void {

    // 사용자 계정이 아닌 경우 수정 불가
    this.popupForm.instance.getEditor('companyId').option('disabled', !this.utilService.isAdminUser());

    // 관리자용 비밀번호 초기화
    if (this.utilService.isAdminUser()) {
      this.resetPwdBtn.visible = true;
      this.resetPwdBtn.disabled = false;
    }

    // this.popupForm.instance.getEditor('companyId').option('value', this.utilService.getCommonOwnerId());
    if (this.popupMode === 'Add') {
      this.pwdBtn.disabled = true;
      this.resetPwdBtn.disabled = true;

      this.popupForm.instance.getEditor('usr').focus();
    }

    this.deptFlg = true;
  }

  // 팝업 닫기
  onPopupClose(): void {
    this.popup.visible = false;
  }

  onPopupAfterClose(): void {
    this.popupForm.instance.resetValues();
    this.popupForm.instance.getEditor('usr').option('disabled', false);
    this.pwdBtn.disabled = false;

    // 관리자용 비밀번호 초기화
    if (this.utilService.isAdminUser()) {
      this.resetPwdBtn.visible = true;
      this.resetPwdBtn.disabled = false;
    }

    this.onSearch();
  }

  async onPopupSearch(data): Promise<void> {
    const result = await this.service.getPopup(data);

    if (this.resultMsgCallback(result, 'PopupSearch')) {
      this.deptFlg = false;

      this.popupFormData = result.data;

      if (result.data.dept) {
        this.treeBoxValue = JSON.parse(result.data.dept);
      }

    } else {
      return;
    }
  }

  async onPopupSave(): Promise<void> {
    const popData = this.popupForm.instance.validate();

    if (popData.isValid) {
      if (await this.execSave()) {
        this.onPopupClose();
      }
    }
  }

  async execSave(): Promise<boolean> {
    try {
      let result;

      this.popupFormData.dept = JSON.stringify(this.treeBoxValue);

      if (this.popupMode === 'Add') {
        result = await this.service.save(this.popupFormData);
      } else {
        result = await this.service.update(this.popupFormData);
      }

      if (this.resultMsgCallback(result, 'Save')) {
        const data = JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN));

        if (data.user === this.popupFormData.usr) {
          const company = this.dsOwnerId.filter(el => el.uid === this.popupFormData.companyId);
          data.companyId = this.popupFormData.companyId;
          data.userGroup = this.popupFormData.userGroup;
          data.company = company[0].company;

          sessionStorage.setItem(APPCONSTANTS.ISLOGIN, JSON.stringify(data));
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

  async onPopupDelete(): Promise<void> {
    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('com_btn_del'));

    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      const result = await this.service.delete(this.popupFormData);

      if (this.resultMsgCallback(result, 'Delete')) {
        this.onPopupClose();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  pwdPopupOpenClick(): void {
    this.pwdPopup.visible = true;
  }

  async resetPassword(): Promise<void> {
    // 비밀번호 초기화를 하시겠습니까?
    const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('비밀번호 초기화'));
    if (!await this.utilService.confirm(confirmMsg)) {
      return;
    }

    try {
      const result = await this.service.resetPassword(this.popupFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Save success');
        this.pwdPopupCancelClick();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }

  async pwdPopupSaveClick(): Promise<void> {
    const pwdPopData = this.pwdPopupForm.instance.validate();
    const saveData = Object.assign(this.popupFormData, this.pwdPopupData);

    if (pwdPopData.isValid) {

      try {
        const result = await this.service.updatePwd(saveData);

        if (!result.success) {
          this.utilService.notify_error(result.msg);
          return;
        } else {
          this.utilService.notify_success('Save success');
          this.pwdPopupCancelClick();
        }
      } catch {
        this.utilService.notify_error('There was an error!');
      }
    }
  }

  pwdPopupCancelClick(): void {
    this.pwdPopup.visible = false;
  }

  pwdPopupAfterClose(): void {
    this.pwdPopupForm.instance.resetValues();
  }

  // tel 커서 위치
  focusIn(e: any): void {
    let len = 1;
    const textValue = e.component._textValue?.trimEnd();
    if (textValue && textValue.charAt(textValue.length - 1) !== ')') {
      len = textValue.length + 1;
    } else {
      len = e.component._value?.trimEnd().length + 1;
    }

    e.element.children[1].children[0].children[0].onclick = () => {

      if (e.element.children[1].children[0].children[0].selectionStart < textValue.length) {

      } else {
        e.element.children[1].children[0].children[0].selectionStart = len || 1;
        e.element.children[1].children[0].children[0].selectionEnd = len || 1;
      }
    };

  }

  passwordComparison = () => this.pwdPopupData.changePassword;


  onValueChangedCompanyId(e): void {
    console.log(this.deptFlg);
    if (this.deptFlg) {
      // @ts-ignore
      this.treeBoxValue = '';
      this.popupFormData.dept = JSON.stringify(this.treeBoxValue);
    }
    const selectedCompany = this.dsOwnerId.filter(el => el.uid === e.value);

    if (selectedCompany[0]) {
      this.dsFilteredDept = this.dsDept.filter(el => el.ptrn_cd === selectedCompany[0].company);
    } else {
      this.dsFilteredDept = this.dsDept.filter(el => el.ptrn_cd === this.popupFormData.company);
    }
  }

  updateSelection(treeView): void {
    if (!treeView) {
      return;
    }

    treeView.unselectAll();

    if (this.treeBoxValue) {
      this.treeBoxValue.forEach(((value) => {
        treeView.selectItem(value);
      }));
    }
  }

  onDropDownBoxValueChanged(e): void {
    this.updateSelection(this.treeView && this.treeView.instance);
  }

  onTreeViewReady(e): void {
    this.updateSelection(e.component);
  }

  onTreeViewSelectionChanged(e): void {
    this.treeBoxValue = e.component.getSelectedNodeKeys();
  }

  checkValueConversion(checkValue): any {

    if (typeof (checkValue) === 'boolean') {
      return checkValue ? 'Y' : 'N';
    } else if (typeof (checkValue) === 'string') {
      return checkValue === 'Y' ? true : false;
    }
  }

  onSelectionChanged(selectedRowKeys, cellInfo, dropDownBoxComponent): void {
    cellInfo.setValue(selectedRowKeys[0]);
    if (selectedRowKeys.length > 0) {
      dropDownBoxComponent.close();
    }
  }

  calculateFilterExpression(filterValue, selectedFilterOperation, target): any {
    if (target === 'search' && typeof (filterValue) === 'string') {
      return [(this as any).dataField, 'contains', filterValue];
    }
    // tslint:disable-next-line:only-arrow-functions typedef
    return function (data) {
      return (data.AssignedEmployee || []).indexOf(filterValue) !== -1;
    };
  }

  cellTemplate(container, options): void {

    if (options.data.dept) {
      const arr = options.data.dept.split(',');

      const noBreakSpace = '\u00A0';
      const text = (arr || []).map((element) => options.column.lookup.calculateCellValue(element)).join(',');
      container.textContent = text || noBreakSpace;
      container.title = text;
    }

  }
}
