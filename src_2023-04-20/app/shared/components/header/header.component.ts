/*
 * Copyright (c) 2021 JFLab All rights reserved.
 * File Name : header.component.ts
 * Author : jbh5310
 * Lastupdate : 2021-02-20 11:22:19
 */

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgModule,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';

import {AuthService} from '../../services';
import {UserPanelModule} from '../user-panel/user-panel.component';
import {DxButtonModule} from 'devextreme-angular/ui/button';
import {DxToolbarModule} from 'devextreme-angular/ui/toolbar';
import themes from 'devextreme/ui/themes';
import {
  DevExtremeModule,
  DxDropDownButtonComponent,
  DxDropDownButtonModule,
  DxFormModule,
  DxRadioGroupComponent,
  DxRadioGroupModule,
  DxSelectBoxComponent,
  DxSelectBoxModule,
  DxTabsModule,
  DxTreeViewComponent
} from 'devextreme-angular';
import {CommonCodeService} from '../../services/common-code.service';
import {CommonUtilService} from '../../services/common-util.service';
import {ComponentBehaviorService} from '../../services/component-behavior.service';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {COMMONINITSTR} from '../../constants/commoninitstr';
import {BizCodeService} from '../../services/biz-code.service';
import {APPCONSTANTS} from '../../constants/appconstants';


@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit, AfterViewInit {

  // Global
  G_TENANT: any;

  constructor(private authService: AuthService,
              private codeService: CommonCodeService,
              public utilService: CommonUtilService,
              private cookieService: CookieService,
              private bizService: BizCodeService,
              private behaviorService: ComponentBehaviorService,
              @Inject(DOCUMENT) private document,
              private router: Router) {
    this.initBusinessCategory();
    this.initCommonSelectBox();
    this.onShown = this.onShown.bind(this);
  }

  @ViewChild('warehouse', {static: false}) warehouse: DxSelectBoxComponent;
  @ViewChild('itemAdmin', {static: false}) itemAdmin: DxSelectBoxComponent;
  @ViewChild('owner', {static: false}) owner: DxSelectBoxComponent;
  @ViewChild('company', {static: false}) company: DxSelectBoxComponent;
  @ViewChild('popupForm', {static: false}) popupForm: DxFormComponent;
  @ViewChild('dropDownBtn', {static: false}) dropDownBtn: DxDropDownButtonComponent;

  @ViewChild('settingForm', {static: false}) settingForm: DxFormComponent;
  @ViewChild('colorModeComponent', {static: false}) colorModeComponent: DxRadioGroupComponent;
  @ViewChild('colorSchemeComponent', {static: false}) colorSchemeComponent: DxRadioGroupComponent;
  @ViewChild('fontComponent', {static: false}) fontComponent: DxRadioGroupComponent;
  @ViewChild('fontSizeComponent', {static: false}) fontSizeComponent: DxRadioGroupComponent;
  @ViewChild(DxTreeViewComponent, {static: false}) treeView;

  /**
   *  공통 Lookup DataSet
   */
  dsWarehouse = [];  // 창고
  dsItemAdmin = [];  // 품목관리사
  dsOwner = [];  // 화주
  dsCompany = [];  // 소속회사

  @Output()
  systemTypeChanged = new EventEmitter<string>();

  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title: string;

  user = {user: '', email: ''};

  tabs: any[] = [];
  selectedIndex: any;

  // 스킨 목록
  colorMode: any[] = [
    {value: 'light', name: 'Light', type: 'colorMode'},
    {value: 'dark', name: 'Dark', type: 'colorMode'}
  ];

  colorScheme: any[] = [
    {value: 'orange', name: 'Orange', type: 'colorScheme'},
    {value: 'yellow', name: 'Yellow', type: 'colorScheme'},
    {value: 'darkyellow', name: 'Dark Yellow', type: 'colorScheme'},
    {value: 'lightgreen', name: 'Light Green', type: 'colorScheme'},
    {value: 'green', name: 'Green', type: 'colorScheme'},
    {value: 'blue', name: 'Blue', type: 'colorScheme'},
    {value: 'darkblue', name: 'Dark Blue', type: 'colorScheme'},
    {value: 'purple', name: 'Purple', type: 'colorScheme'}
  ];

  fontSize: any[] = [
    {value: '12', name: '12px', type: 'fontsize'},
    {value: '13', name: '13px', type: 'fontsize'},
    {value: '14', name: '14px', type: 'fontsize'},
    {value: '15', name: '15px', type: 'fontsize'},
    {value: '16', name: '16px', type: 'fontsize'}
  ];

  font: any[] = [
    {value: 'nanumgothic', name: 'Nanumgothic', type: 'font'},
    {value: 'malgungothic', name: 'Malgungothic', type: 'font'},
    {value: 'natosans', name: 'Natosans', type: 'font'}
  ];

  userMenuItems = [
    {
      text: 'Profile',
      icon: 'user',
      onClick: () => {
        const e = {} as Event;
        this.behaviorService.changedSystemType(e);
        this.router.navigate(['/profile'], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
      }
    },
    {
      text: 'Logout',
      icon: 'arrowright',
      onClick: () => {
        this.authService.logOut();
      }
    }];

  /**
   *  공통 창고코드, 화주, 품목관리사 선택 이벤트
   */
  warehouseChangedFlg = false;
  ownerChangedFlg = false;
  itemAdminChangedFlg = false;
  companyChangedFlg = false;

  settingFlag = false;
  shownFlag = false;

  treeBoxValue;
  isTreeBoxOpened = true;
  relatedCompanyId: number;

  initBusinessCategory(): void {

    const tenant = this.utilService.getTenant();
    this.codeService.getMenuTabList(tenant, Number(this.utilService.getUserUid())).subscribe(result => {
      if (result.success) {
        // tslint:disable-next-line:forin
        for (const idx in result.data) {
          const data = result.data[idx];
          this.tabs.push({
            text: data.codeName,
            systemType: data.code
          });
          if (this.utilService.getSystemType() === data.code) {
            this.selectedIndex = idx;   // 탭 포커스
          }
        }
      }
    });
  }

  onSelectTab(e): void {
    // systemType 선택
    this.utilService.setSystemType(e.itemData.systemType);
    this.behaviorService.changedSystemType(e);

    // 시스템타입 visible
    this.setVisibleSystemType();
  }

  setVisibleSystemType(): void {
    const systemType = this.utilService.getSystemType();

    // header에 소속회사 등 3가지 표시
    const allowTypes = ['WM', 'MM', 'PP'];
    // 시스템타입이 물류일 경우 창고 표시
    this.warehouse.visible = allowTypes.includes(systemType);
    this.itemAdmin.visible = allowTypes.includes(systemType);
    // this.owner.visible = allowTypes.includes(systemType);
    // this.company.visible = allowTypes.includes(systemType);
  }

  ngOnInit(): void {
    this.isTreeBoxOpened = false;
    this.authService.getUser().then((e) => {
        this.user = e.data;
      }
    );
    this.changSetting(this.utilService.getUtSetting());
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }

  /**
   * 테마 변경 이벤트
   */
  setSetting(): void {
    const font = this.fontComponent.value.value;
    const fontsize = this.fontSizeComponent.value.value;
    const theme = this.colorModeComponent.value.value + '.' + this.colorSchemeComponent.value.value;

    this.changSetting({font, fontsize, theme}).then(settingData => {
      this.utilService.setUtSetting(settingData);
      this.dropDownBtn.opened = false;
    });
  }

  async changSetting(settingData): Promise<any> {

    for (const key of Object.keys(settingData)) {

      if (key === 'font') {
        this.document.getElementById(key).setAttribute('href', 'themes/css/dx.fontfamily.' + settingData[key] + '.css');
      } else if (key === 'fontsize') {
        this.document.getElementById(key).setAttribute('href', 'themes/css/dx.fontsize.' + settingData[key] + '.css');
      } else if (key === 'theme') {
        themes.current(settingData[key]);
      }
    }
    return settingData;
  }

  onShown(): void {
    const utSetting = this.utilService.getUtSetting();

    const currTheme = utSetting.theme.split('.');
    this.colorModeComponent.value = this.colorMode.filter(el => el.value === currTheme[0])[0];
    this.colorSchemeComponent.value = this.colorScheme.filter(el => el.value === currTheme[1])[0];

    const currFontSize = utSetting.fontsize;
    this.fontSizeComponent.value = this.fontSize.filter(el => el.value === currFontSize)[0];

    const currFont = utSetting.font;
    this.fontComponent.value = this.font.filter(el => el.value === currFont)[0];
  }

  ngAfterViewInit(): void {
    this.setVisibleSystemType();
  }

  async onSelectWarehouse(e): Promise<void> {
    if (this.warehouseChangedFlg) {
      this.warehouseChangedFlg = false;
      return;
    }
    if (!e.previousValue) {
      return;
    }

    if (await this.utilService.confirm(this.utilService.convert1('DoesReloadPage', '페이지를 다시 불러 오시겠습니까?', 'Reload this Page?'))) {
      const lastPath = this.authService.lastAuthenticatedPath;
      this.utilService.setCommonWarehouseVO(this.warehouse.selectedItem);
      this.utilService.setCommonWarehouseId(e.value);
      this.router.navigate(['/'], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE}).then(() => {
        this.router.navigate([lastPath], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
      });
    } else {
      this.warehouseChangedFlg = true;
      this.utilService.setCommonWarehouseId(e.previousValue);
      this.warehouse.instance.option('value', e.previousValue);
    }
  }

  async onSelectOwner(e): Promise<void> {
    if (this.ownerChangedFlg) {
      this.ownerChangedFlg = false;
      return;
    }

    if (!e.previousValue) {
      return;
    }

    if (await this.utilService.confirm(this.utilService.convert('DoesReloadPage'))) {
      const lastPath = this.authService.lastAuthenticatedPath;
      this.utilService.setCommonOwnerId(e.value);
      this.router.navigate(['/'], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE}).then(() => {
        this.router.navigate([lastPath], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
      });
    } else {
      this.ownerChangedFlg = true;
      this.utilService.setCommonOwnerId(e.previousValue);
      this.owner.instance.option('value', e.previousValue);
    }
  }

  async onSelectItemAdmin(e): Promise<void> {
    if (this.itemAdminChangedFlg) {
      this.itemAdminChangedFlg = false;
      return;
    }

    if (!e.previousValue) {
      return;
    }

    if (await this.utilService.confirm(this.utilService.convert('DoesReloadPage'))) {
      const lastPath = this.authService.lastAuthenticatedPath;
      this.utilService.setCommonItemAdminId(e.value);
      this.router.navigate(['/'], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE}).then(() => {
        this.router.navigate([lastPath], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
      });
    } else {
      this.itemAdminChangedFlg = true;
      this.utilService.setCommonItemAdminId(e.previousValue);
      this.itemAdmin.instance.option('value', e.previousValue);
    }
  }


  async initCommonSelectBox(): Promise<void> {
    const _userId = this.utilService.getUserUid();
    const userId = Number(_userId) || -1;

    // 공통 창고 목록
    await this.codeService.getCommonWarehouse(userId).subscribe(result => {
      // await this.codeService.getWarehouse(this.utilService.getTenant(), null, null).subscribe(result => {
      this.dsWarehouse = result.data;
      const initValue = this.utilService.getCommonWarehouseId();
      if (initValue) {
        this.warehouse.instance.option('value', initValue);
        this.utilService.setCommonWarehouseId(initValue);
      } else {

        this.warehouse.instance.option('value', this.dsWarehouse.length > 0 ? this.dsWarehouse[0].uid : -1);
        this.utilService.setCommonWarehouseId(this.dsWarehouse.length > 0 ? this.dsWarehouse[0].uid : -1);
        this.utilService.setCommonWarehouseVO(this.dsWarehouse.length > 0 ? this.dsWarehouse[0] : null);
      }
    });

    // 공통 화주 목록
    await this.codeService.getCommonOwner(userId).subscribe(result => {
      // await this.codeService.getCompany(this.utilService.getTenant(), null, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;

      const initValue = this.utilService.getCommonOwnerId();
      if (initValue) {
        // this.owner.instance.option('value', initValue);
        this.utilService.setCommonOwnerId(initValue);
      } else {
        // this.owner.instance.option('value', this.dsOwner.length > 0 ? this.dsOwner[0].uid : -1);
        this.utilService.setCommonOwnerId(this.dsOwner.length > 0 ? this.dsOwner[0].uid : -1);
      }

      console.log(this.utilService.getCommonOwnerId());
    });

    // 공통 품목관리사 목록
    await this.codeService.getItemAdmin(this.utilService.getTenant()).subscribe(result => {
      this.dsItemAdmin = result.data;

      const initValue = this.utilService.getCommonItemAdminId();
      if (initValue) {
        this.itemAdmin.instance.option('value', initValue);
        this.utilService.setCommonItemAdminId(initValue);
      } else {
        this.itemAdmin.instance.option('value', this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : -1);
        this.utilService.setCommonItemAdminId(this.dsItemAdmin.length > 0 ? this.dsItemAdmin[0].uid : -1);
      }
    });

    this.relatedCompanyId = this.relatedCompanyId || Number(JSON.parse(sessionStorage.getItem(APPCONSTANTS.ISLOGIN)).companyId);
    await this.codeService.getRelatedCompany(this.utilService.getTenant(), this.relatedCompanyId).subscribe(r => {
      this.dsCompany = r.data;

      // this.company.instance.option('value', this.utilService.getCompanyId());
      this.treeBoxValue = this.utilService.getCompanyId();
      // this.company.disabled = true;
    });

    // await this.codeService.getCompany(this.utilService.getTenant(), null, null, null, null, null, null, null).subscribe(r => {
    //   this.dsCompany = r.data;
    //   this.company.instance.option('value', this.utilService.getCompanyId());
    //
    // });
  }

  async syncTreeViewSelection(e): Promise<void> {

    if (!this.treeView) {
      return;
    }
    if (!this.treeBoxValue) {
      this.treeView.instance.unselectAll();
    } else {
      // console.log(this.treeView.instance.getSelectedNodes());
      const selected = this.treeView.instance.getSelectedNodes();
      // console.log(selected[0]);
      // console.log(this.treeBoxValue);
      if (selected.length > 0 && selected[0].key === this.treeBoxValue[0]) {
        this.isTreeBoxOpened = false;
        return;
      }
      this.treeView.instance.selectItem(this.treeBoxValue);
    }
  }

  async treeView_itemSelectionChanged(e): Promise<void> {

    if (e.itemData.uid === this.utilService.getCompanyId()) {
      return;
    }
    if (this.companyChangedFlg) {
      this.companyChangedFlg = false;
      return;
    }

    if (await this.utilService.confirm(this.utilService.convert('DoesReloadPage'))) {
      const lastPath = this.authService.lastAuthenticatedPath;
      // this.utilService.setCommonOwnerId(e.value);
      this.router.navigate(['/'], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE}).then(() => {
        this.router.navigate([lastPath], {skipLocationChange: COMMONINITSTR.SKIP_LOCATION_CHANGE});
      });
    } else {
      this.companyChangedFlg = true;
      // 되돌리기
      return;
    }

    if (!this.treeView) {
      return;
    }

    this.treeBoxValue = e.component.getSelectedNodeKeys();
    // this.relatedCompanyId = this.treeBoxValue[0];
    console.log('this.treeBoxValue[0]', this.treeBoxValue);
    console.log('this.treeBoxValue[0]', this.treeBoxValue[0]);

    this.utilService.setCompanyId(this.treeBoxValue[0]);

    const company = this.dsCompany.filter(el => el.uid === this.treeBoxValue[0]);

    // console.log('company', company);
    this.utilService.setCompany(company.length > 0 ? company[0].company : null);

    // let company = [];
    // await this.codeService.getRelatedCompany(this.utilService.getTenant(), this.treeBoxValue[0]).subscribe(r => {
    //   // this.dsCompany = r.data;
    //
    //   company = r.data.filter(el => el.uid === this.treeBoxValue[0]);
    //
    //   console.log('company', company);
    //   this.utilService.setCompany(company[0].company);
    // });

    // this.utilService.setCompanyId(this.treeBoxValue);
  }

  async onTreeBoxOptionChanged(e): Promise<void> {
    try {
      this.treeView.instance.expandAll();
    } catch (e) {

    }

    if (e.name === 'value') {
      // console.log('this.isTreeBoxOpened', this.isTreeBoxOpened);
      this.isTreeBoxOpened = false;
    }
  }

}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelModule,
    DxToolbarModule,
    DxTabsModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxRadioGroupModule,
    DxFormModule,
    DevExtremeModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class HeaderModule {
}
